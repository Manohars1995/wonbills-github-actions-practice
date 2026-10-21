const mongoose = require("mongoose");
const Payment = require("../models/payment");
const Item = require("../models/item");
const Invoice = require("../models/invoice");

/* ---------------- CONSTANTS ---------------- */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const PENDING_STATES = ["scheduled", "saved"];
const VALID_STATES = ["received", "requested", ...PENDING_STATES];

/* ---------------- CONTROLLER ---------------- */
const getVendorDashboardChartsForMobile = async (req, res) => {
  console.log(req.query, "Req.query")
  try {
    const vendor_id = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(vendor_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID"
      });
    }

    /* ---------- YEAR (UTC SAFE) ---------- */
    // const year = req.query.year
    //   ? Number(req.query.year)
    //   : new Date().getUTCFullYear();

    // const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    // const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    /* ---------- MONTH + YEAR FILTER ---------- */

    const currentDate = new Date();

    const year = req.query.year
      ? Number(req.query.year)
      : currentDate.getUTCFullYear();

    const month = req.query.month
      ? Number(req.query.month)
      : currentDate.getUTCMonth() + 1;



    const startDate = new Date(
      Date.UTC(year, month - 1, 1, 0, 0, 0)
    );

    const endDate = new Date(
      Date.UTC(year, month, 0, 23, 59, 59)
    );
    const selectedMonthIndex = month - 1;

    console.log({
      year,
      month,
      startDate,
      endDate,
    });

    const vendorObjectId = new mongoose.Types.ObjectId(vendor_id);


    const paymentsRaw = await Payment.aggregate([
      {
        $match: {
          vendor_id: vendorObjectId,
          status: "active",
          payment_state: { $in: VALID_STATES }, // 🚀 FIX
          // createdAt: { $gte: startOfYear, $lte: endOfYear }
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          }
        }
      },
      {
        $lookup: {
          from: "invoices",
          localField: "invoice_id",
          foreignField: "_id",
          as: "invoice"
        }
      },
      { $unwind: "$invoice" },
      {
        $project: {
          month: { $month: "$createdAt" },
          amount: "$invoice_amount",
          tax: { $ifNull: ["$invoice.total_tax_amount", 0] },
          bucket: {
            $cond: [
              { $eq: ["$payment_state", "received"] },
              "received",
              {
                $cond: [
                  { $eq: ["$payment_state", "requested"] },
                  "requested",
                  "pending"
                ]
              }
            ]
          }
        }
      }
    ]);

    /* =====================================================
       2. SUMMARY (AMOUNT + TAX)
       ===================================================== */
    const summary = paymentsRaw.reduce(
      (acc, curr) => {
        acc[curr.bucket].amount += curr.amount;
        acc[curr.bucket].tax += curr.tax;
        return acc;
      },
      {
        requested: { amount: 0, tax: 0 },
        pending: { amount: 0, tax: 0 },
        received: { amount: 0, tax: 0 }
      }
    );

    /* =====================================================
       3. PAYMENTS BY MONTH
       ===================================================== */
    const paymentData = MONTHS.map((month, idx) => {
      const monthNum = idx + 1;

      const monthPayments = paymentsRaw.filter(
        p => p.month === monthNum
      );

      return {
        month,
        requested: monthPayments
          .filter(p => p.bucket === "requested" || p.bucket === "pending")
          .reduce((s, p) => s + p.amount, 0),
        received: monthPayments
          .filter(p => p.bucket === "received")
          .reduce((s, p) => s + p.amount, 0)
      };
    });

    /* =====================================================
       4. PAYMENT STATUS (COUNT)
       ===================================================== */


    // const paymentModeRaw = await Payment.aggregate([
    //   {
    //     $match: {
    //       vendor_id: vendorObjectId,
    //       status: "active",
    //       payment_state: { $in: VALID_STATES },
    //       createdAt: {
    //         $gte: startOfYear,
    //         $lte: endOfYear,
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$mode_of_payment",
    //       amount: {
    //         $sum: {
    //           $ifNull: ["$invoice_amount", 0],
    //         },
    //       },
    //     },
    //   },
    // ]);
    const paymentModeRaw = await Payment.aggregate([
      {
        $match: {
          vendor_id: vendorObjectId,
          status: "active",
          payment_state: { $in: VALID_STATES },

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: "$mode_of_payment",

          amount: {
            $sum: {
              $ifNull: ["$invoice_amount", 0],
            },
          },
        },
      },
    ]);
    const totalPaymentAmount = paymentModeRaw.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const paymentStatusData = paymentModeRaw.map((item) => ({
      mode: item._id,
      amount: Number(item.amount.toFixed(2)),
      percentage:
        totalPaymentAmount > 0
          ? Number(
            (
              (item.amount / totalPaymentAmount) *
              100
            ).toFixed(1),
          )
          : 0,
    }));


    /* =====================================================
       7. MONTH OVER MONTH CHANGE %
       ===================================================== */

    const currentMonth = new Date().getUTCMonth() + 1;
    const previousMonth =
      currentMonth === 1 ? 12 : currentMonth - 1;

    const calculatePercentage = (current = 0, previous = 0) => {
      current = Number(current) || 0;
      previous = Number(previous) || 0;

      if (current === 0 && previous === 0) {
        return 0;
      }

      if (previous === 0 && current > 0) {
        return 100;
      }

      if (previous > 0 && current === 0) {
        return -100;
      }

      return Number(
        (((current - previous) / previous) * 100).toFixed(1)
      );
    };

    const monthlySummary = {
      requested: { current: 0, previous: 0 },
      received: { current: 0, previous: 0 },
      pending: { current: 0, previous: 0 },
    };

    paymentsRaw.forEach((payment) => {
      const amount = Number(payment.amount) || 0;

      if (payment.month === currentMonth) {
        monthlySummary[payment.bucket].current += amount;
      }

      if (payment.month === previousMonth) {
        monthlySummary[payment.bucket].previous += amount;
      }
    });

    const growth = {
      requested: calculatePercentage(
        monthlySummary.requested.current,
        monthlySummary.requested.previous
      ),

      received: calculatePercentage(
        monthlySummary.received.current,
        monthlySummary.received.previous
      ),

      pending: calculatePercentage(
        monthlySummary.pending.current,
        monthlySummary.pending.previous
      ),
    };

    /* =====================================================
   8. PRODUCT INSIGHTS
   ===================================================== */

    const productItems = await Item.find({
      vendor_id: vendorObjectId,
      status: true,

      category: {
        $regex: /^product$/i,
      },
    }).lean();
    // added by sandhya - to get insights based on month and year filter
    const highStockItems =
      productItems.filter(
        item =>
          item.in_stock >=
          item.total_stock * 0.7,
      );

    const lowStockItems =
      productItems.filter(
        item =>
          item.in_stock > 0 &&
          item.in_stock <=
          item.total_stock * 0.3,
      );

    const outOfStockItems =
      productItems.filter(
        item =>
          item.in_stock === 0,
      );

    const totalProducts =
      productItems.length;

    const highStock =
      highStockItems.length;;

    const lowStock =
      lowStockItems.length;

    const outOfStock =
      outOfStockItems.length;

    const totalStock =
      productItems.reduce(
        (sum, item) =>
          sum +
          item.total_stock,
        0,
      );

    const currentStock =
      productItems.reduce(
        (sum, item) =>
          sum +
          item.in_stock,
        0,
      );

    const stockUtilization =
      totalStock > 0
        ? Number(
          (
            (currentStock /
              totalStock) *
            100
          ).toFixed(1),
        )
        : 0;

    // const productsAddedThisMonth =
    //   productItems.filter(
    //     item =>
    //       item.createdAt.getUTCMonth() ===
    //       new Date().getUTCMonth(),
    //   ).length;
    const productsAddedThisMonth =
      productItems.filter(
        item =>
          item.createdAt.getUTCMonth() === selectedMonthIndex &&
          item.createdAt.getUTCFullYear() === year,
      ).length;

    // const productsModifiedThisMonth =
    //   productItems.filter(
    //     item =>
    //       item.updatedAt.getUTCMonth() ===
    //       new Date().getUTCMonth() &&
    //       item.updatedAt.getTime() !==
    //       item.createdAt.getTime(),
    //   ).length;
    const productsModifiedThisMonth =
      productItems.filter(
        item =>
          item.updatedAt.getUTCMonth() === selectedMonthIndex &&
          item.updatedAt.getUTCFullYear() === year &&
          item.updatedAt.getTime() !==
          item.createdAt.getTime(),
      ).length;

    
    const productInsights = [
      {
        key: "high_stock",
        title: "High Stock",
        subtitle: "Healthy inventory",
        value: highStock,

        items: highStockItems.map(item => ({
          _id: item._id,
          item_name: item.item_name,
          in_stock: item.in_stock,
          total_stock: item.total_stock,
        })),

        percentage:
          totalProducts > 0
            ? Number(
              (
                (highStock /
                  totalProducts) *
                100
              ).toFixed(1),
            )
            : 0,
      },
      {
        key: "low_stock",
        title: "Low Stock",
        subtitle: "Needs replenishment",
        value: lowStock,

        items: lowStockItems.map(item => ({
          _id: item._id,
          item_name: item.item_name,
          in_stock: item.in_stock,
          total_stock: item.total_stock,
        })),

        percentage:
          totalProducts > 0
            ? Number(
              (
                (lowStock /
                  totalProducts) *
                100
              ).toFixed(1),
            )
            : 0,
      },
      {
        key: "out_stock",
        title: "Out of Stock",
        subtitle: "Unavailable products",
        value: outOfStock,

        items: outOfStockItems.map(item => ({
          _id: item._id,
          item_name: item.item_name,
          in_stock: item.in_stock,
          total_stock: item.total_stock,
        })),

        percentage:
          totalProducts > 0
            ? Number(
              (
                (outOfStock /
                  totalProducts) *
                100
              ).toFixed(1),
            )
            : 0,
      },
      {
        key: "utilization",
        title:
          "Stock Utilization",
        subtitle:
          "Inventory usage",
        value:
          stockUtilization,
        percentage:
          stockUtilization,
      },

      {
        key: "added",
        title:
          "Added This Month",
        subtitle:
          "New products",
        value:
          productsAddedThisMonth,
        percentage: 0,
      },

      {
        key: "modified",
        title:
          "Modified",
        subtitle:
          "Updated products",
        value:
          productsModifiedThisMonth,
        percentage: 0,
      },
    ]



    /* =====================================================
       RESPONSE
       ===================================================== */
    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        summary: {
          requested: {
            amount: Number(summary.requested.amount.toFixed(2)),
            tax: Number(summary.requested.tax.toFixed(2)),
            growth: growth.requested
          },
          pending: {
            amount: Number(summary.pending.amount.toFixed(2)),
            tax: Number(summary.pending.tax.toFixed(2)),
            growth: growth.pending,
          },
          received: {
            amount: Number(summary.received.amount.toFixed(2)),
            tax: Number(summary.received.tax.toFixed(2)),
            growth: growth.received,
          }
        },
        paymentStatusData,
        productInsights,
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });
  }
};

const getVendorDashboardCharts = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(vendor_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID"
      });
    }

    /* ---------- YEAR (UTC SAFE) ---------- */
    const year = req.query.year
      ? Number(req.query.year)
      : new Date().getUTCFullYear();

    const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    const vendorObjectId = new mongoose.Types.ObjectId(vendor_id);

    /* =====================================================
       1. PAYMENTS + TAX (EXCLUDE CANCELED)
       ===================================================== */
    const paymentsRaw = await Payment.aggregate([
      {
        $match: {
          vendor_id: vendorObjectId,
          status: "active",
          payment_state: { $in: VALID_STATES }, // 🚀 FIX
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $lookup: {
          from: "invoices",
          localField: "invoice_id",
          foreignField: "_id",
          as: "invoice"
        }
      },
      { $unwind: "$invoice" },
      {
        $project: {
          month: { $month: "$createdAt" },
          amount: "$invoice_amount",
          tax: { $ifNull: ["$invoice.total_tax_amount", 0] },
          bucket: {
            $cond: [
              { $eq: ["$payment_state", "received"] },
              "received",
              {
                $cond: [
                  { $eq: ["$payment_state", "requested"] },
                  "requested",
                  "pending"
                ]
              }
            ]
          }
        }
      }
    ]);

    /* =====================================================
       2. SUMMARY (AMOUNT + TAX)
       ===================================================== */
    const summary = paymentsRaw.reduce(
      (acc, curr) => {
        acc[curr.bucket].amount += curr.amount;
        acc[curr.bucket].tax += curr.tax;
        return acc;
      },
      {
        requested: { amount: 0, tax: 0 },
        pending: { amount: 0, tax: 0 },
        received: { amount: 0, tax: 0 }
      }
    );

    /* =====================================================
       3. PAYMENTS BY MONTH
       ===================================================== */
    const paymentData = MONTHS.map((month, idx) => {
      const monthNum = idx + 1;

      const monthPayments = paymentsRaw.filter(
        p => p.month === monthNum
      );

      return {
        month,
        requested: monthPayments
          .filter(p => p.bucket === "requested" || p.bucket === "pending")
          .reduce((s, p) => s + p.amount, 0),
        received: monthPayments
          .filter(p => p.bucket === "received")
          .reduce((s, p) => s + p.amount, 0)
      };
    });

    /* =====================================================
       4. PAYMENT STATUS (COUNT)
       ===================================================== */
    const paymentStatusData = {
      requested: paymentsRaw.filter(p => p.bucket === "requested").length,
      pending: paymentsRaw.filter(p => p.bucket === "pending").length,
      received: paymentsRaw.filter(p => p.bucket === "received").length
    };

    /* =====================================================
       5. ITEMS BY CATEGORY
       ===================================================== */
    const itemsCategoryRaw = await Item.aggregate([
      {
        $match: {
          vendor_id: vendorObjectId,
          status: true
        }
      },
      {
        $group: {
          _id: { $toLower: "$category" },
          count: { $sum: 1 }
        }
      }
    ]);

    const itemsByCategory = {
      product: itemsCategoryRaw.find(i => i._id === "product")?.count || 0,
      service: itemsCategoryRaw.find(i => i._id === "service")?.count || 0,
      expense: itemsCategoryRaw.find(i => i._id === "expense")?.count || 0
    };

    /* =====================================================
       6. ITEMS ACTIVITY
       ===================================================== */
    const itemsActivityRaw = await Item.aggregate([
      {
        $match: {
          vendor_id: vendorObjectId,
          status: true,
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $project: {
          createdMonth: { $month: "$createdAt" },
          isModified: {
            $cond: [{ $ne: ["$createdAt", "$updatedAt"] }, 1, 0]
          }
        }
      },
      {
        $group: {
          _id: "$createdMonth",
          added: { $sum: 1 },
          modified: { $sum: "$isModified" }
        }
      }
    ]);

    const itemsActivityData = MONTHS.map((month, idx) => {
      const monthNum = idx + 1;
      const data = itemsActivityRaw.find(m => m._id === monthNum);

      return {
        month,
        added: data?.added || 0,
        modified: data?.modified || 0
      };
    });

    /* =====================================================
       RESPONSE
       ===================================================== */
    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        summary: {
          requested: {
            amount: Number(summary.requested.amount.toFixed(2)),
            tax: Number(summary.requested.tax.toFixed(2))
          },
          pending: {
            amount: Number(summary.pending.amount.toFixed(2)),
            tax: Number(summary.pending.tax.toFixed(2))
          },
          received: {
            amount: Number(summary.received.amount.toFixed(2)),
            tax: Number(summary.received.tax.toFixed(2))
          }
        },
        paymentData,
        paymentStatusData,
        itemsByCategory,
        itemsActivityData
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });
  }
};

module.exports = {
  getVendorDashboardCharts,
  getVendorDashboardChartsForMobile
};
