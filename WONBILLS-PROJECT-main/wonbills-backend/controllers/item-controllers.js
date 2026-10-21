const { convertDate, HttpResponse } = require("../utils/helper-functions");
const { sendLowStockEmail } = require("../utils/EmailUtils");
const { updateAlertsOnLowStock } = require("./alert-controllers");
const { uploadImageToS3Bucket, deleteImageFromS3Bucket } = require("../utils/S3-bucket");
const moment = require("moment");
const ExcelJS = require("exceljs");
const { itemsFlatHeaders, category } = require("../utils/constData");
const { checkSubscriptionStatusByUserID } = require("./shared-controllers");
const { CheckStockToSendNotification, convertExcelDate } = require("../utils/shared");
const { downloadItemExcelSheet, importItemsFromXl } = require("../utils/Excel-utils/itemXl");
const { generateUniqueCustomId } = require("../utils/CustomIDGenerator");
const mongoose = require("mongoose");

const Item = require("../models/item");
const User = require("../models/users");

const getItemsByUserId = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required.",
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
        console.warn("Invalid sort query received. Falling back to default sort.", {
          sort: req.query.sort,
          error: err.message,
        });

        sortCriteria = { createdAt: -1 };
      }
    }

    /* ---------------- SEARCH ---------------- */
    const search = req.query.search?.trim();
    const searchFilter = [];

    if (search) {
      // ---- String fields (regex search) ----
      searchFilter.push(
        { item_name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { custom_id: { $regex: search, $options: "i" } },
        { serial_number: { $regex: search, $options: "i" } }
      );

      // ---- Boolean field (status) ----
      const normalizedSearch = search.toLowerCase();

      if (
        ["true", "false", "active", "inactive"].includes(normalizedSearch)
      ) {
        searchFilter.push({
          status:
            normalizedSearch === "true" ||
            normalizedSearch === "active",
        });
      }

      // ---- Numeric fields ----
      if (!isNaN(search)) {
        const numericValue = Number(search);

        searchFilter.push(
          { price: numericValue },
          { taxation: numericValue },
          { total_stock: numericValue },
          { in_stock: numericValue }
        );
      }
    }

    const filter = {
      vendor_id,
      ...(searchFilter.length > 0 && { $or: searchFilter }),
    };

    /* ---------------- PARALLEL QUERY ---------------- */
    const [totalItems, items] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(
        filter,
        {
          item_name: 1,
          category: 1,
          taxation: 1,
          serial_number: 1,
          total_stock: 1,
          in_stock: 1,
          price: 1,
          status: 1,
          custom_id: 1,
          image: 1,
          createdAt: 1,
        }
      )
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetched items successfully.",
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      offset: skip,
      limit,
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch items.",
    });
  }
};

const toggleItemStatusById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const vendor_id = req.user?.userId;

    if (!vendor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized vendor"
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required"
      });
    }

    const item = await Item.findOneAndUpdate(
      {
        custom_id: itemId,
        vendor_id: vendor_id
      },
      [
        {
          $set: {
            status: { $not: "$status" }
          }
        }
      ],
      {
        new: true,
        updatePipeline: true
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found or access denied"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: item.custom_id,
        status: item.status
      },
      message: `Item status updated to ${
        item.status ? "active" : "inactive"
      } successfully`
    });

  } catch (err) {
    console.error("Failed to update item status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update item status"
    });
  }
};


const createItem = async (req, res) => {
  try {
    const {
      item_name,
      category,
      description,
      valid_from,
      valid_until,
      serial_no,
      value = 0,
      total_stock,
      in_stock,
      discount = 0,
      taxation = 0,
      notes,
      status = true,
      image = null,
    } = req.body;

    /* ---------------- VENDOR ID ---------------- */
    const vendor_id = req.user?.userId;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required.",
      });
    }

    /* ---------------- REQUIRED FIELD ---------------- */
    if (!item_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required.",
      });
    }

    /* ---------------- NUMBER NORMALIZATION (FLOAT SAFE) ---------------- */
    const basePrice = parseFloat(value) || 0;
    const taxPercent = parseFloat(taxation) || 0;
    const discountPercent = parseFloat(discount) || 0;

    /* ---------------- PRICE CALCULATIONS ---------------- */
    const tax_amount = Number(
      (basePrice * (taxPercent / 100)).toFixed(2)
    );

    const priceWithTax = basePrice + tax_amount;

    const discount_amount = Number(
      (priceWithTax * (discountPercent / 100)).toFixed(2)
    );

    const final_price = Number(
      (priceWithTax - discount_amount).toFixed(2)
    );

    if (final_price < 0) {
      return res.status(400).json({
        success: false,
        message: "Final price cannot be negative.",
      });
    }

    /* ---------------- STOCK LOGIC ---------------- */
    const isProduct = category === "product";

    const stockPayload = isProduct
      ? {
        total_stock: Number(total_stock) || 0,
        in_stock: Number(in_stock) || 0,
      }
      : {
        total_stock: null,
        in_stock: null,
      };

    /* ---------------- CUSTOM ID ---------------- */
    const custom_id = await generateUniqueCustomId("ITM", Item);

    /* ---------------- CREATE ITEM ---------------- */
    const newItem = await Item.create({
      custom_id,
      item_name,
      category,
      description,
      valid_from: valid_from || null,
      valid_until: valid_until || null,
      serial_number: serial_no || null,

      value: basePrice,
      taxation: taxPercent,
      discount: discountPercent,
      tax_amount,
      discount_amount,
      price: final_price,

      ...stockPayload,

      notes,
      image,
      status,
      vendor_id,
    });

    return res.status(201).json({
      success: true,
      message: "Item created successfully.",
      data: newItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create item.",
    });
  }
};

const updateItemById = async (req, res) => {
  try {
    const { id: customId } = req.params;

    if (!customId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
      });
    }

    const {
      item_name,
      category,
      description,
      valid_from,
      valid_until,
      serial_no,
      value,
      total_stock,
      in_stock,
      discount,
      taxation,
      notes,
      status,
      image,
    } = req.body;

    const updatePayload = {};

    /* ---------------- FETCH EXISTING ITEM (READ ONLY) ---------------- */
    const existingItem = await Item.findOne({ custom_id: customId });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    /* ---------------- BASIC FIELD UPDATES ---------------- */
    if (item_name !== undefined) updatePayload.item_name = item_name;
    if (category !== undefined) updatePayload.category = category;
    if (description !== undefined) updatePayload.description = description;
    if (valid_from !== undefined) updatePayload.valid_from = valid_from || null;
    if (valid_until !== undefined) updatePayload.valid_until = valid_until || null;
    if (serial_no !== undefined)
      updatePayload.serial_number = serial_no || null;
    if (notes !== undefined) updatePayload.notes = notes;
    if (status !== undefined) updatePayload.status = status;
    if (image !== undefined) updatePayload.image = image;

    /* ---------------- PRICE RECALCULATION (FLOAT SAFE) ---------------- */
    const basePrice =
      value !== undefined ? parseFloat(value) : existingItem.value;

    const taxPercent =
      taxation !== undefined ? parseFloat(taxation) : existingItem.taxation;

    const discountPercent =
      discount !== undefined ? parseFloat(discount) : existingItem.discount;

    const tax_amount = Number(
      (basePrice * (taxPercent / 100)).toFixed(2)
    );

    const priceWithTax = basePrice + tax_amount;

    const discount_amount = Number(
      (priceWithTax * (discountPercent / 100)).toFixed(2)
    );

    const final_price = Number(
      (priceWithTax - discount_amount).toFixed(2)
    );

    if (final_price < 0) {
      return res.status(400).json({
        success: false,
        message: "Final price cannot be negative.",
      });
    }

    updatePayload.value = basePrice;
    updatePayload.taxation = taxPercent;
    updatePayload.discount = discountPercent;
    updatePayload.tax_amount = tax_amount;
    updatePayload.discount_amount = discount_amount;
    updatePayload.price = final_price;

    /* ---------------- STOCK LOGIC ---------------- */
    const effectiveCategory = category ?? existingItem.category;
    const isProduct = effectiveCategory === "product";

    if (isProduct) {
      if (total_stock !== undefined)
        updatePayload.total_stock = Number(total_stock) || 0;
      if (in_stock !== undefined)
        updatePayload.in_stock = Number(in_stock) || 0;
    } else {
      updatePayload.total_stock = null;
      updatePayload.in_stock = null;
    }

    /* ---------------- UPDATE ITEM ---------------- */
    const updatedItem = await Item.findOneAndUpdate(
      { custom_id: customId },
      updatePayload,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Item updated successfully.",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update item.",
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id: itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
        data: null,
      });
    }

    // Find item by _id
    const item = await Item.findOne({ custom_id: itemId });

    return res.status(200).json({
      success: true,
      data: item || null,
      message: item
        ? "Item data fetched successfully."
        : "Item not found.",
    });

  } catch (err) {
    console.error("Failed to fetch item data:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item data.",
    });
  }
};

const uploadItemImgById = async (req, res) => {
  try {
    // Validate file
    if (!req.files || !req.files[0]) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { itemId } = req.params;

    // Validate item ID
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing item ID",
      });
    }

    // Check item exists
    const item = await Item.findById(itemId).select("_id");
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Upload to S3
    const imageUrl = await uploadImageToS3Bucket(req.files[0]);
    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to S3",
      });
    }

    // Prepare image payload
    const imageData = {
      url: imageUrl,
      timestamp: Date.now(),
    };

    // Update item document 
    await Item.findByIdAndUpdate(
      itemId,
      { image: imageData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Item image updated successfully.",
      image: imageUrl,
    });

  } catch (error) {
    console.error("Error uploading item image:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading image, try again.",
    });
  }
};

const deleteItemImgById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const imageUrl = req.body.url;

    // Validate item ID
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing item ID",
      });
    }

    // Validate image URL
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // Check item exists
    const item = await Item.findById(itemId).select("image");
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Delete from S3 bucket
    await deleteImageFromS3Bucket(imageUrl);

    // Set image to null (timestamps auto-update)
    await Item.findByIdAndUpdate(itemId, { image: null });

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting item image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image.",
    });
  }
};

const getValidItemsByUserId = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required.",
      });
    }

    const items = await Item.find({
      vendor_id,
      status: true,
      $or: [
        {
          category: "product",
          in_stock: { $gte: 0 }, // only products with stock
        },
        {
          category: { $ne: "product" }, // all non-products
        },
      ],
    })
      .sort({ createdAt: -1 })
      .select(
        `
        item_name
        category
        serial_number
        value
        total_stock
        in_stock
        discount
        taxation
        discount_amount
        tax_amount
        price
        status
        custom_id
        image
        `
      )
      .lean();


    return res.status(200).json({
      success: true,
      message: "Fetched available items successfully.",
      items: items,
    });
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch items.",
    });
  }
};

const updateItemsStock = async (req, res) => {
  try {
    const { items, userID } = req.body;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    // Validate required fields
    for (const each of items) {
      if (!each.id || typeof each.inStock === "undefined") {
        return res.status(400).json({
          success: false,
          message: "Product ID and inStock are required for each item",
        });
      }
    }

    // Bulk update all items in one DB operation

    const bulkOps = items.map((each) => ({
      updateOne: {
        filter: { _id: each.id },
        update: { in_stock: each.inStock },
      },
    }));

    await Item.bulkWrite(bulkOps);

    const updatedIds = items.map((x) => x.id);

    // Fetch user email
    const user = await User.findById(userID).select("email");

    if (user) {
      await CheckStockToSendNotification(updatedIds, user.email, userID);
    }

    return res.status(200).json({
      success: true,
      message: "Product stocks updated successfully!",
      updatedProductNumbers: updatedIds,
    });

  } catch (error) {
    console.error("Error updating product stocks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const importDataFromXl = async (req, res) => {
  await importItemsFromXl(req, res);
};

// DOWNLOADS ITEM EXCEL SHEET FOR WEB SIVA
const downloadItemExcel = async (req, res) => {
  await downloadItemExcelSheet(req, res);
};




module.exports = {
  getItemsByUserId,
  toggleItemStatusById,
  createItem,
  updateItemById,
  getItemById,
  uploadItemImgById,
  deleteItemImgById,
  getValidItemsByUserId,
  updateItemsStock,
  importDataFromXl,
  downloadItemExcel,
}