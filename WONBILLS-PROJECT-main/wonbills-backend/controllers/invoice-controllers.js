const mongoose = require("mongoose");

const Invoice = require("../models/invoice");
const Client = require("../models/client");
const User = require("../models/users");
const Item = require("../models/item");


const Payment = require("../models/payment");

const { checkSubscriptionStatusByUserID } = require("./shared-controllers");
const { generateUniqueCustomId } = require("../utils/CustomIDGenerator");


/* ---------------------------------------------
   Helpers
---------------------------------------------- */
const normalizeInvoiceStatus = (status) => {
  if (typeof status === "string") return status;
  if (status === true) return "active";
  if (status === false) return "inactive";
  return "active";
};

const normalizePaymentStatus = (status) => {
  if (!status) return undefined;
  const allowed = ["pending", "declined", "requested", "received"];
  return allowed.includes(status) ? status : undefined;
};

const getInvoicesByUserId = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID required",
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
    let sortCriteria = { _id: -1 }; // timestamps are disabled

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
        console.warn("Invalid sort query. Falling back to default.", {
          sort: req.query.sort,
          error: err.message,
        });
      }
    }

    /* ---------------- SEARCH ---------------- */
    const search = req.query.search?.trim();
    const searchFilter = [];

    if (search) {
      searchFilter.push(
        { invoice_name: { $regex: search, $options: "i" } },
        { custom_id: { $regex: search, $options: "i" } }
      );

      const normalizedSearch = search.toLowerCase();
      if (["active", "inactive", "initiated", "closed"].includes(normalizedSearch)) {
        searchFilter.push({ status: normalizedSearch });
      }
    }

    /* ---------------- FILTER ---------------- */
    const filter = {
      vendor_id,
      invoice_name: { $ne: null },
      ...(searchFilter.length > 0 && { $or: searchFilter }),
    };

    /* ---------------- PARALLEL QUERY ---------------- */
    const [totalInvoices, invoicesRaw] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(
        filter,
        {
          invoice_name: 1,
          custom_id: 1,
          client: 1,
          due_date: 1,
          net_amount: 1,
          gross_amount: 1,
          status: 1,
          quantity: 1,
        }
      )
        .populate("client", "custom_id")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    /* ---------------- FLATTEN RESPONSE ---------------- */
    const invoices = invoicesRaw.map(i => ({
      ...i,
      client: i.client?._id || null,
      client_custom_id: i.client?.custom_id || null,
    }));

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Fetched invoices successfully",
      totalInvoices,
      totalPages: Math.ceil(totalInvoices / limit),
      offset: skip,
      limit,
      invoices,
    });

  } catch (err) {
    console.error("Error fetching invoices:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
    });
  }
};

const toggleInvoiceStatusById = async (req, res) => {
  try {
    const { invId } = req.params;
    const vendor_id = req.user?.userId;

    /* ---------------- AUTH ---------------- */

    if (!vendor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized vendor"
      });
    }

    if (!invId) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required"
      });
    }

    /* ---------------- ATOMIC + RULED UPDATE ---------------- */

    const invoice = await Invoice.findOneAndUpdate(
      {
        custom_id: invId,               
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

    if (!invoice) {
      return res.status(409).json({
        success: false,
        message:
          "Invoice not found, access denied, or status cannot be changed"
      });
    }

    /* ---------------- RESPONSE ---------------- */

    return res.status(200).json({
      success: true,
      data: {
        id: invoice.custom_id,
        status: invoice.status
      },
      message: `Invoice status updated to '${invoice.status}' successfully`
    });

  } catch (err) {
    console.error("Failed to update invoice status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update invoice status"
    });
  }
};

// GET CLIENT AND VENDOR DETAILS FOR INVOICE CREATION
const getClientVendorDetails = async (req, res) => {
  try {
    const { clientId } = req.params;
    const vendorId = req.user?.userId;

    /* ---------------- VALIDATE IDS ---------------- */
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID",
      });
    }

    /* ---------------- FETCH CLIENT ---------------- */
    const client = await Client.findById(clientId).lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    /* ---------------- FETCH VENDOR ---------------- */
    const vendor = await User.findById(vendorId)
      .select(
        "email company_details company_logo currency_preference selected_invoice"
      )
      .lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    /* ---------------- BUILD RESPONSE ---------------- */
    const responseData = {
      client, // full client object
      vendor: {
        email: vendor.email,
        company_details: vendor.company_details,
        company_logo: vendor.company_logo,
        currency_preference: vendor.currency_preference,
        selected_invoice: vendor.selected_invoice,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Fetched client and vendor details successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Failed to fetch client/vendor details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch client/vendor details",
    });
  }
};

//  CREATE INVOICE
const createInvoice = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;
    if (!vendor_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      invoice_name,
      client,
      due_date,
      valid_from,
      valid_until,
      items = [],
      taxation = 0,
      net_amount = 0,
      gross_amount = 0,
      total_tax_amount = 0,
      quantity = 0,
      include_taxation,
      status = "active",
      invoice_notes
    } = req.body;

    /* ---------------- VALIDATIONS ---------------- */
    if (!invoice_name || !client) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invoice must have items" });
    }

    const normalizedStatus =
      typeof status === "string"
        ? status
        : status === true
          ? "active"
          : status === false
            ? "inactive"
            : "active";

    /* ---------------- NORMALIZE & PREPARE STOCK UPDATES ---------------- */
    const stockUpdates = [];
    const normalizedItems = items.map((item) => {
      const isProd = Boolean(item._meta?.isProduct);
      const qty = Number(item.quantity || 0);
      const itemId = item._meta?.item_id;

      // If it's a product and we have a valid MongoDB ID, prepare the decrement
      if (isProd && itemId) {
        stockUpdates.push({
          updateOne: {
            filter: { _id: itemId },
            // $inc with a negative number subtracts the quantity from current in_stock
            update: { $inc: { in_stock: -qty } }
          }
        });
      }

      return {
        item_code: item.id,
        name: item.name,
        category: item.category,
        quantity: qty,
        unit_price: Number(item.unit_price || 0),
        tax: Number(item.tax || 0),
        discount: Number(item.discount || 0),
        final_price: Number(item.final_price || 0),
        total: Number(item.total || 0),
        item_id: itemId,
        isProduct: isProd
      };
    });

    /* ---------------- DATABASE OPERATIONS ---------------- */

    // 1. Generate ID
    const custom_id = await generateUniqueCustomId("INV", Invoice);

    // 2. Create the Invoice
    const invoice = await Invoice.create({
      vendor_id,
      custom_id,
      invoice_name,
      client,
      due_date,
      valid_from,
      valid_until,
      items: normalizedItems,
      quantity,
      taxation,
      net_amount,
      gross_amount,
      total_tax_amount,
      include_taxation,
      invoice_notes,
      status: normalizedStatus
    });

    // 3. Update Item Stock Levels (Bulk Write)
    if (stockUpdates.length > 0) {
      // Use your Item model here
      await Item.bulkWrite(stockUpdates);
    }

    /* ---------------- RESPONSE ---------------- */
    return res.status(201).json({
      success: true,
      message: "Invoice created and stock updated successfully",
      data: invoice
    });

  } catch (err) {
    console.error("Failed to create invoice:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE INVOICE BY ID WITH SAFE STOCK RECONCILIATION
const updateInvoiceById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vendor_id = req.user?.userId;
    const invoiceCustomId = req.params?.id;

    if (!vendor_id) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!invoiceCustomId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    /* ---------------- FETCH INVOICE ---------------- */
    const invoice = await Invoice.findOne(
      { custom_id: invoiceCustomId, vendor_id },
      null,
      { session }
    );

    if (!invoice) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    /* ---------------- STATE GUARDS ---------------- */
    if (invoice.invoice_state === "closed") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "You cannot update a closed invoice.",
      });
    }

    /* ---------------- STOCK RECONCILIATION ---------------- */
    const stockUpdates = [];

    // Restore old stock
    for (const oldItem of invoice.items || []) {
      if (oldItem.isProduct && oldItem.item_id) {
        stockUpdates.push({
          updateOne: {
            filter: { _id: oldItem.item_id },
            update: { $inc: { in_stock: Number(oldItem.quantity || 0) } },
          },
        });
      }
    }

    // Normalize new items & deduct stock
    const normalizedItems = Array.isArray(req.body.items)
      ? req.body.items.map((item) => {
        const isProd = Boolean(item._meta?.isProduct);
        const qty = Number(item.quantity || 0);
        const itemId = item._meta?.item_id;

        if (isProd && itemId) {
          stockUpdates.push({
            updateOne: {
              filter: { _id: itemId },
              update: { $inc: { in_stock: -qty } },
            },
          });
        }

        return {
          item_code: item.id,
          name: item.name,
          category: item.category,
          quantity: qty,
          unit_price: Number(item.unit_price || 0),
          tax: Number(item.tax || 0),
          discount: Number(item.discount || 0),
          final_price: Number(item.final_price || 0),
          total: Number(item.total || 0),
          item_id: itemId,
          isProduct: isProd,
        };
      })
      : invoice.items;

    if (stockUpdates.length > 0) {
      await Item.bulkWrite(stockUpdates, { session });
    }

    /* ---------------- FIELD UPDATES ---------------- */
    const {
      invoice_name,
      client,
      due_date,
      valid_from,
      valid_until,
      quantity,
      net_amount,
      taxation,
      total_tax_amount,
      gross_amount,
      status,
      payment_status,
      invoice_state,
    } = req.body;

    invoice.invoice_name = invoice_name ?? invoice.invoice_name;
    invoice.client = client ?? invoice.client;
    invoice.due_date = due_date ?? invoice.due_date;
    invoice.valid_from = valid_from ?? invoice.valid_from;
    invoice.valid_until = valid_until ?? invoice.valid_until;
    invoice.quantity = quantity ?? invoice.quantity;

    invoice.net_amount = net_amount ?? invoice.net_amount;
    invoice.taxation = taxation ?? invoice.taxation;
    invoice.total_tax_amount =
      total_tax_amount ?? invoice.total_tax_amount;
    invoice.gross_amount = gross_amount ?? invoice.gross_amount;

    if (status !== undefined) {
      invoice.status = normalizeInvoiceStatus(status);
    }

    const normalizedPaymentStatus = normalizePaymentStatus(payment_status);
    if (normalizedPaymentStatus) {
      invoice.payment_status = normalizedPaymentStatus;
    }

    invoice.invoice_state =
      invoice_state ?? invoice.invoice_state;

    invoice.items = normalizedItems;

    /* ---------------- SAVE ---------------- */
    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Invoice ${invoiceCustomId} updated successfully.`,
      invoice,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction failed:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update invoice safely",
    });
  }
};

// GET INVOICE BY ID
const getInvoiceById = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;
    const invoiceCustomId = req.params?.id;

    if (!vendor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!invoiceCustomId) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    /* ---------------- FETCH INVOICE ---------------- */
    const invoice = await Invoice.findOne({
      custom_id: invoiceCustomId,
      vendor_id,
    }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Fetched invoice successfully",
      data: invoice,
    });

  } catch (err) {
    console.error("Error fetching invoice:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
    });
  }
};

// GET ACTIVE INVOICES TO SHOW IN PYAMENT MODAL
const getActiveInvoices = async (req, res) => {
  try {
    const vendorId = req.user?.userId;
    const { invoiceId } = req.query;

    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Vendor ID is required",
      });
    }

    const pipeline = [
      {
        $match: {
          vendor_id: new mongoose.Types.ObjectId(vendorId),
          status: "active",
        },
      },
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "clientData",
        },
      },
      {
        $unwind: {
          path: "$clientData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          custom_id: 1,
          gross_amount: 1,
          client: {
            _id: "$clientData._id",
            client_name: "$clientData.client_name",
          },
          isLocked: { $literal: false }, // 👈 harmless default
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    const invoices = await Invoice.aggregate(pipeline);

    /* --------------------------------------------------
       ADDITIONAL LAYER (ONLY IF invoiceId IS PROVIDED)
    -------------------------------------------------- */
    if (invoiceId && mongoose.Types.ObjectId.isValid(invoiceId)) {
      const exists = invoices.some(
        inv => inv._id.toString() === invoiceId
      );

      if (!exists) {
        const linkedInvoice = await Invoice.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(invoiceId),
              vendor_id: new mongoose.Types.ObjectId(vendorId),
            },
          },
          {
            $lookup: {
              from: "clients",
              localField: "client",
              foreignField: "_id",
              as: "clientData",
            },
          },
          {
            $unwind: {
              path: "$clientData",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              custom_id: 1,
              gross_amount: 1,
              client: {
                _id: "$clientData._id",
                client_name: "$clientData.client_name",
              },
              isLocked: { $literal: true }, // 👈 key difference
            },
          },
        ]);

        if (linkedInvoice.length) {
          invoices.push(linkedInvoice[0]);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Active invoices fetched successfully",
      data: invoices,
    });

  } catch (error) {
    console.error("getActiveInvoices error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active invoices",
    });
  }
};


//  GET INACTIVE INVOICE BY ID
const markInvoiceInactive = async (invoiceID) => {
  try {
    if (!invoiceID) {
      throw new Error(`Invalid invoice ID: ${invoiceID}`);
    }

    // Update status only if not already closed
    const updated = await Invoice.findOneAndUpdate(
      { _id: invoiceID, status: { $ne: "closed" } },
      { status: "closed" },
      { new: true }
    );

    if (!updated) {
      throw new Error(`Invoice with ID ${invoiceID} not found or already closed`);
    }

    return updated;

  } catch (error) {
    console.error("Error in markInvoiceInactive:", error.message);
    throw error;
  }
};

const getInvoicePdfData = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const vendorId = req.user.userId;

    /* ---------------- FETCH INVOICE ---------------- */
    const invoice = await Invoice.findOne({
      custom_id: invoiceId,
      vendor_id: vendorId
    })
      .populate("client")
      .lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    /* ---------------- FETCH VENDOR ---------------- */
    const vendor = await User.findById(vendorId)
      .select("email company_logo currency_preference selected_invoice company_details")
      .lean();

    /* ---------------- NORMALIZE ITEMS ---------------- */
    const items = (invoice.items || []).map((item) => ({
      item_id: item.item_code || "-",
      item_name: item.name || "Unnamed Item",
      value: Number(item.unit_price || 0),
      tax: Number(item.tax || 0),
      discount: Number(item.discount || 0),
      quantity: Number(item.quantity || 0),
      price: Number(item.final_price || 0),
      total: Number(item.total || 0)
    }));

    return res.status(200).json({
      success: true,
      message: "Invoice PDF data fetched successfully",
      data: {
        invoice: {
          custom_id: invoice.custom_id,
          due_date: invoice.due_date
        },
        items,
        client: invoice.client,
        vendor
      }
    });
  } catch (error) {
    console.error("Invoice PDF fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice PDF data"
    });
  }
};



module.exports = {
  getInvoicesByUserId,
  toggleInvoiceStatusById,
  getClientVendorDetails,
  updateInvoiceById,
  getInvoiceById,
  getActiveInvoices,
  markInvoiceInactive,
  createInvoice,
  getInvoicePdfData
}