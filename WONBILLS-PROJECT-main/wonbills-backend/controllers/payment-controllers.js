const mongoose = require("mongoose");

const { disablePaymentLink } = require("../utils/razorpay/razorpay-helpers");
const { markInvoiceInactive } = require("./invoice-controllers");
const Payment = require("../models/payment");
const Invoice = require("../models/invoice");
const User = require("../models/users");
const { razorpay } = require("../utils/razorpay/razorpay-helpers");
const { updateClientOffline } = require("../utils/razorpay/payment-helpers");
const { sendPaymentEmail } = require("../utils/EmailUtils")
const { getVendorAndClientDetails } = require("../utils/razorpay/payment-helpers");
const { generateUniqueCustomId } = require("../utils/CustomIDGenerator");
const { createOnlinePaymentLink } = require("../services/PaymentService");


// controller

const getPaymentsByUserId = async (req, res) => {
  try {
    /* ---------------- AUTH ---------------- */
    const vendor_id = req.user?.userId;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required."
      });
    }

    /* ---------------- PAGINATION ---------------- */
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const skip =
      req.query.offset !== undefined
        ? offset
        : (page - 1) * limit;

    /* ---------------- SORTING ---------------- */
    let sortCriteria = { createdAt: -1 };

    if (req.query.sort) {
      try {
        const parsedSort = JSON.parse(req.query.sort);

        if (Array.isArray(parsedSort) && parsedSort.length > 0) {
          const dynamicSort = {};

          parsedSort.forEach(({ column, order }) => {
            if (column) {
              dynamicSort[column] = order === "desc" ? -1 : 1;
            }
          });

          if (Object.keys(dynamicSort).length > 0) {
            sortCriteria = dynamicSort;
          }
        }
      } catch (err) {
        console.warn("Invalid sort query. Falling back to default.", err.message);
        sortCriteria = { createdAt: -1 };
      }
    }

    /* ---------------- SEARCH ---------------- */
    const search = req.query.search?.trim();
    const searchFilter = [];

    if (search) {
      searchFilter.push(
        { custom_id: { $regex: search, $options: "i" } },
        { client_name: { $regex: search, $options: "i" } },
        { mode_of_payment: { $regex: search, $options: "i" } },
        { payment_state: { $regex: search, $options: "i" } }
      );

      const normalizedSearch = search.toLowerCase();
      if (["active", "inactive", "closed"].includes(normalizedSearch)) {
        searchFilter.push({ status: normalizedSearch });
      }

      if (!isNaN(search)) {
        const numericValue = Number(search);
        searchFilter.push({ invoice_amount: numericValue });
      }
    }

    /* ---------------- FILTER ---------------- */
    const filter = {
      vendor_id,
      invoice_id: { $ne: null },
      ...(searchFilter.length > 0 && { $or: searchFilter })
    };

    /* ---------------- PARALLEL QUERY ---------------- */
    const [totalPayments, paymentsRaw] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.find(
        filter,
        {
          custom_id: 1,
          invoice_id: 1,
          payment_due_date: 1,
          payment_state: 1,
          mode_of_payment: 1,
          client_name: 1,
          invoice_amount: 1,
          status: 1,
          createdAt: 1
        }
      )
        .populate("invoice_id", "custom_id")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const payments = paymentsRaw.map(p => ({
      ...p,
      invoice_id: p.invoice_id?._id || p.invoice_id,
      custom_invoice_id: p.invoice_id?.custom_id || null
    }));

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: payments.length
        ? "Fetched payments successfully."
        : "No payments found.",
      totalPayments,
      totalPages: Math.ceil(totalPayments / limit),
      offset: skip,
      limit,
      payments
    });

  } catch (err) {
    console.error("Error fetching payments:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments."
    });
  }
};

// toggles payment status by id
const togglePaymentStatusById = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;
    const paymentId = req.params.pid;

    /* ---------------- AUTH ---------------- */

    if (!vendor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized vendor"
      });
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required"
      });
    }

    /* ---------------- ATOMIC TOGGLE ---------------- */

    const payment = await Payment.findOneAndUpdate(
      {
        custom_id: paymentId,
        vendor_id: vendor_id,
        status: { $in: ["active", "inactive"] }
      },
      [
        {
          $set: {
            status: {
              $cond: [
                { $eq: ["$status", "active"] },
                "inactive",
                "active"
              ]
            }
          }
        }
      ],
      {
        new: true,
        updatePipeline: true
      }
    );

    if (!payment) {
      return res.status(409).json({
        success: false,
        message:
          "Payment not found, access denied, or status cannot be changed"
      });
    }

    /* ---------------- SIDE EFFECT ---------------- */

    if (payment.status === "inactive" && payment.payment_link_id) {
      await disablePaymentLink(payment.payment_link_id);
    }

    /* ---------------- RESPONSE ---------------- */

    return res.status(200).json({
      success: true,
      data: {
        id: payment.custom_id,
        status: payment.status
      },
      message: `Payment status updated to '${payment.status}' successfully`
    });

  } catch (err) {
    console.error("Error toggling payment status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle payment status"
    });
  }
};


const createPayment = async (req, res) => {
  console.log("Create payment request body:", req.body);
  const session = await mongoose.startSession();
  session.startTransaction();

  let linksToDisable = [];

  try {
    /* ---------------- AUTH ---------------- */
    const vendor_id = req.user?.userId;
    if (!vendor_id) {
      throw { status: 401, message: "Unauthorized" };
    }

    /* ---------------- INPUT ---------------- */
    const {
      invoice_id,
      payment_due_date,
      notes,
      client_name,
      payment_state = "requested",
      schedule_date,
      invoice_amount = 0,
      mode_of_payment,
      payment_reference_number,
      cheque_number = null,
      commission_by_customer
    } = req.body;

    const parsedAmount = Number(invoice_amount);

    /* ---------------- VALIDATIONS ---------------- */
    if (!invoice_id || !parsedAmount || !mode_of_payment) {
      throw {
        status: 400,
        message: "invoice_id, invoice_amount and mode_of_payment are required"
      };
    }

    if (typeof commission_by_customer !== "boolean") {
      throw {
        status: 400,
        message: "commission_by_customer must be boolean"
      };
    }

    const VALID_PAYMENT_STATES = ["scheduled", "received", "requested", "saved", "canceled"];
    if (!VALID_PAYMENT_STATES.includes(payment_state)) {
      throw { status: 400, message: "Invalid payment_state" };
    }

    if (mode_of_payment === "cheque" && !cheque_number) {
      throw {
        status: 400,
        message: "cheque_number is required for cheque payments"
      };
    }

    if (mode_of_payment !== "online_payment" && schedule_date) {
      throw {
        status: 400,
        message: "schedule_date is only allowed for online payments"
      };
    }

    /* ---------------- VERIFY INVOICE ---------------- */
    const invoice = await Invoice.findOne(
      { _id: invoice_id, vendor_id },
      null,
      { session }
    );

    if (!invoice) {
      throw { status: 404, message: "Invoice not found" };
    }

    /* ---------------- NORMALIZE ---------------- */
    const normalizedScheduleDate =
      mode_of_payment === "online_payment" ? schedule_date : null;

    /* ---------------- CLOSE OLD PAYMENTS ---------------- */
    const activePayments = await Payment.find(
      {
        invoice_id,
        vendor_id,
        status: "active"
      },
      null,
      { session }
    );

    // collect links
    linksToDisable = activePayments
      .filter(p => p.payment_link_id)
      .map(p => p.payment_link_id);

    await Payment.updateMany(
      {
        invoice_id,
        vendor_id,
        status: "active"
      },
      {
        $set: {
          status: "closed",
          payment_state: "canceled"
        }
      },
      { session }
    );

    /* ---------------- CREATE PAYMENT ---------------- */
    const custom_id = await generateUniqueCustomId("PAY", Payment);

    const [createdPayment] = await Payment.create(
      [
        {
          vendor_id,
          invoice_id,
          custom_id,
          payment_due_date,
          schedule_date: normalizedScheduleDate,
          notes,
          client_name,
          invoice_amount: parsedAmount,
          mode_of_payment,
          payment_reference_number,
          cheque_number,
          commission_by_customer,
          payment_state
        }
      ],
      { session }
    );

    /* ---------------- ONLINE PAYMENT LINK ---------------- */
    // if (
    //   mode_of_payment === "online_payment" &&
    //   !normalizedScheduleDate &&
    //   payment_state !== "received"
    // ) {
    //   // Check Razorpay account status before creating link
    //   const vendor = await User.findById(vendor_id, null, { session });

    //   if (vendor && vendor.razorpay_account_status === 'activated') {
    //     await createOnlinePaymentLink({
    //       vendorId: vendor_id,
    //       client_id: invoice.client,
    //       gross_amount: parsedAmount,
    //       clientPaysFees: commission_by_customer,
    //       payment_id: createdPayment._id,
    //       invoice_id,
    //       due_date: payment_due_date,
    //       custom_payment_id: createdPayment.custom_id,
    //       session
    //     });
    //   } else {
    //     // If Razorpay is not activated and payment was scheduled, mark it as saved
    //     if (payment_state === "scheduled") {
    //       await Payment.updateOne(
    //         { _id: createdPayment._id },
    //         { $set: { payment_state: "saved" } },
    //         { session }
    //       );

    //       // Update the in-memory object to reflect the change
    //       createdPayment.payment_state = "saved";
    //     }
    //   }
    // }
    if (
      mode_of_payment === "online_payment" &&
      payment_state !== "received"
    ) {
      console.log("Creating online payment link");

      const vendor = await User.findById(vendor_id, null, { session });

      console.log("Vendor status:", vendor?.razorpay_account_status);

      if (vendor?.razorpay_account_status === "activated") {

        const linkResponse = await createOnlinePaymentLink({
          vendorId: vendor_id,
          client_id: invoice.client,
          gross_amount: parsedAmount,
          clientPaysFees: commission_by_customer,
          payment_id: createdPayment._id,
          invoice_id,
          due_date: payment_due_date,
          custom_payment_id: createdPayment.custom_id,
          session
        });

        console.log("Payment link created:", linkResponse);

      } else {
        console.log("Vendor Razorpay not activated");
      }
    }

    /* ---------------- BUSINESS SIDE EFFECTS ---------------- */
    if (payment_state === "received") {
      await Invoice.updateOne(
        { _id: invoice_id },
        {
          $set: {
            status: "closed",
            payment_status: "received"
          }
        },
        { session }
      );

      if (mode_of_payment !== "online_payment") {
        await updateClientOffline(
          createdPayment._id,
          parsedAmount,
          session
        );
      }
    }

    /* ---------------- COMMIT ---------------- */
    await session.commitTransaction();
    session.endSession();

    /* ---------------- AFTER COMMIT ---------------- */
    for (const id of linksToDisable) {
      try {
        await disablePaymentLink(id);
      } catch (err) {
        console.error("Failed to disable payment link:", id, err);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: createdPayment
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.log("Failed to create payment:", err);

    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Internal Server Error"
    });
  }
};

const updatePaymentById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let linksToDisable = [];

  try {
    /* ---------------- AUTH ---------------- */
    const vendor_id = req.user?.userId;
    if (!vendor_id) {
      throw { status: 401, message: "Unauthorized" };
    }

    const { pid: paymentID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentID)) {
      throw { status: 400, message: "Invalid payment ID" };
    }

    /* ---------------- FETCH PAYMENT ---------------- */
    const payment = await Payment.findOne(
      { _id: paymentID, vendor_id },
      null,
      { session }
    );

    if (!payment) {
      throw { status: 404, message: "Payment not found" };
    }

    if (payment.status === "closed") {
      throw { status: 400, message: "Closed payments cannot be updated" };
    }

    if (payment.payment_state === "canceled") {
      throw {
        status: 400,
        message: "Canceled payments cannot be updated"
      };
    }

    const body = req.body;
    const updates = {};
    const prevState = payment.payment_state;

    /* ---------------- VALIDATIONS ---------------- */

    if (body.payment_state !== undefined) {
      const validStates = ["scheduled", "received", "requested", "saved", "canceled"];
      if (!validStates.includes(body.payment_state)) {
        throw { status: 400, message: "Invalid payment_state" };
      }
      updates.payment_state = body.payment_state;
    }

    if (body.mode_of_payment !== undefined) {
      const validModes = ["cash", "online_payment", "cheque"];
      if (!validModes.includes(body.mode_of_payment)) {
        throw { status: 400, message: "Invalid mode_of_payment" };
      }
      updates.mode_of_payment = body.mode_of_payment;
    }

    if (body.invoice_amount !== undefined) {
      const amt = Number(body.invoice_amount);
      if (isNaN(amt)) {
        throw { status: 400, message: "Invalid invoice_amount" };
      }
      updates.invoice_amount = amt;
    }

    if (body.schedule_date !== undefined) {
      if (body.schedule_date === "") {
        updates.schedule_date = null;
      } else if (isNaN(Date.parse(body.schedule_date))) {
        throw { status: 400, message: "Invalid schedule_date" };
      } else {
        updates.schedule_date = body.schedule_date;
      }
    }

    /* ---------------- FINAL VALUES ---------------- */
    const finalMode = updates.mode_of_payment ?? payment.mode_of_payment;
    const finalSchedule =
      updates.schedule_date !== undefined
        ? updates.schedule_date
        : payment.schedule_date;

    const finalState = updates.payment_state ?? payment.payment_state;

    /* ---------------- ENFORCE schedule_date RULE ---------------- */
    if (finalMode !== "online_payment" && finalSchedule) {
      throw {
        status: 400,
        message: "schedule_date is only allowed for online payments"
      };
    }

    if (finalMode !== "online_payment") {
      updates.schedule_date = null;
    }

    if (Object.keys(updates).length === 0) {
      throw { status: 400, message: "No data provided to update" };
    }

    /* ---------------- APPLY UPDATE ---------------- */
    await Payment.updateOne(
      { _id: paymentID },
      { $set: updates },
      { session }
    );

    /* ---------------- CLOSE OTHER PAYMENTS ---------------- */
    if (updates.payment_state || updates.mode_of_payment) {
      const activePayments = await Payment.find(
        {
          invoice_id: payment.invoice_id,
          vendor_id,
          status: "active",
          _id: { $ne: paymentID }
        },
        null,
        { session }
      );

      linksToDisable = activePayments
        .filter(p => p.payment_link_id)
        .map(p => p.payment_link_id);

      await Payment.updateMany(
        {
          invoice_id: payment.invoice_id,
          vendor_id,
          status: "active",
          _id: { $ne: paymentID }
        },
        {
          $set: {
            status: "closed",
            payment_state: "canceled"
          }
        },
        { session }
      );
    }

    /* ---------------- ONLINE PAYMENT LINK ---------------- */
    if (
      finalMode === "online_payment" &&
      !finalSchedule &&
      finalState !== "received" &&
      !payment.payment_link_id
    ) {

      const vendor = await User.findById(vendor_id, null, { session });

      if (vendor && vendor.razorpay_account_status === 'activated') {
        await createOnlinePaymentLink({
          vendorId: vendor_id,
          client_id: payment.invoice_id,
          gross_amount: updates.invoice_amount ?? payment.invoice_amount,
          clientPaysFees: payment.commission_by_customer,
          payment_id: paymentID,
          invoice_id: payment.invoice_id,
          due_date: payment.payment_due_date,
          custom_payment_id: payment.custom_id,
          session
        });
      } else {
        // If Razorpay is not activated and payment state is scheduled, mark it as saved
        if (finalState === "scheduled") {
          await Payment.updateOne(
            { _id: paymentID },
            { $set: { payment_state: "saved" } },
            { session }
          );

          // Update the updates object to reflect the change
          updates.payment_state = "saved";
        }
      }

    }

    /* ---------------- BUSINESS SIDE EFFECTS ---------------- */
    if (finalState === "received" && prevState !== "received") {
      await Invoice.updateOne(
        { _id: payment.invoice_id },
        {
          $set: {
            status: "closed",
            payment_status: "received"
          }
        },
        { session }
      );

      if (finalMode !== "online_payment") {
        await updateClientOffline(
          paymentID,
          updates.invoice_amount ?? payment.invoice_amount,
          session
        );
      }
    }

    /* ---------------- COMMIT ---------------- */
    await session.commitTransaction();
    session.endSession();

    /* ---------------- AFTER COMMIT ---------------- */
    for (const id of linksToDisable) {
      try {
        await disablePaymentLink(id);
      } catch (err) {
        console.error("Failed to disable payment link:", id, err);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Payment ${paymentID} updated successfully`
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Failed to update payment:", err);

    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Failed to update payment"
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    /* ---------------- AUTH ---------------- */
    const vendor_id = req.user?.userId;
    if (!vendor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    /* ---------------- PARAMS ---------------- */
    const { pid: paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required"
      });
    }

    /* ---------------- FETCH PAYMENT ---------------- */
    const payment = await Payment.findOne({
      custom_id: paymentId,
      vendor_id
    })
      .populate("invoice_id") // full invoice for detail view
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Fetched payment successfully",
      data: payment
    });

  } catch (err) {
    console.error("Failed to fetch payment:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment"
    });
  }
};

const updatePayments = async (purchaseOrderID) => {
  try {
    const currentDate = new Date();

    // Update payment
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: purchaseOrderID }, // payment_id
      {
        payment_state: "received",
        status: "closed",
      },
      { new: true }
    );

    if (!updatedPayment) {
      throw new Error("Failed to update payment");
    }

    return updatedPayment;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw new Error("Failed to update payment");
  }
};



module.exports = {
  getPaymentsByUserId,
  togglePaymentStatusById,
  createPayment,
  updatePaymentById,
  getPaymentById,
  updatePayments,
}