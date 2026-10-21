const Item = require("../../models/item");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const { itemsFlatHeaders, category } = require("../constData");
const { generateUniqueCustomId } = require("../CustomIDGenerator");


// EXCEL DOWNLOAD OF DUPLICATE ITEMS
const exportDuplicateItemsExcelBuffer = async (duplicateRecords = []) => {
  if (!duplicateRecords.length) return null;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Item Template");
  const dropdownSheet = workbook.addWorksheet("Dropdown Data");

  dropdownSheet.state = "hidden";

  /* ---------------- FLAT HEADERS ---------------- */
  const flatHeaders = itemsFlatHeaders;

  worksheet.columns = flatHeaders.map((key) => ({
    header: key.replace(/_/g, " ").toUpperCase(),
    key,
    width: 30,
  }));

  /* ---------------- EMPTY ROWS ---------------- */
  for (let i = 0; i < 1000; i++) {
    worksheet.addRow({});
  }

  /* ---------------- HEADER STYLE ---------------- */
  worksheet.getRow(1).eachCell((cell) => {
    cell.protection = { locked: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFADD8E6" },
    };
    cell.font = { bold: true };
  });

  /* ---------------- UNLOCK DATA CELLS ---------------- */
  for (let i = 2; i <= 1001; i++) {
    worksheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
      cell.protection = { locked: false };
    });
  }

  /* ---------------- DROPDOWN HELPERS ---------------- */
  const addDropdownData = (name, values, colIndex) => {
    if (!values?.length) return null;

    dropdownSheet.getCell(1, colIndex).value = name;
    dropdownSheet.getCell(1, colIndex).font = { bold: true };

    values.forEach((value, idx) => {
      dropdownSheet.getCell(idx + 2, colIndex).value = value;
    });

    const colLetter =
      ExcelJS.utils?.getExcelAlpha?.(colIndex) ||
      String.fromCharCode(64 + colIndex);

    return `'Dropdown Data'!$${colLetter}$2:$${colLetter}$${values.length + 1}`;
  };

  const createDropdown = (columnIndex, range) => {
    if (!columnIndex || columnIndex < 1 || !range) return;

    for (let r = 2; r <= 1001; r++) {
      worksheet.getRow(r).getCell(columnIndex).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [range],
      };
    }
  };

  const getColumnIndex = (headerName) => {
    const idx = flatHeaders.indexOf(headerName);
    return idx === -1 ? null : idx + 1;
  };

  /* ---------------- DROPDOWN DATA ---------------- */
  const categoryRange = addDropdownData(
    "category",
    ["product", "service", "expense"],
    1
  );

  /* ---------------- APPLY DROPDOWNS ---------------- */
  createDropdown(getColumnIndex("category"), categoryRange);

  /* ---------------- DATE VALIDATION ---------------- */
  ["valid_from", "valid_until"].forEach((colName) => {
    const colIndex = getColumnIndex(colName);
    if (!colIndex) return;

    const colLetter =
      ExcelJS.utils?.getExcelAlpha?.(colIndex) ||
      String.fromCharCode(64 + colIndex);

    worksheet.getColumn(colIndex).numFmt = "yyyy-mm-dd";

    worksheet.dataValidations.add(`${colLetter}2:${colLetter}1001`, {
      type: "date",
      operator: "between",
      formulae: [new Date(2000, 0, 1), new Date(2099, 11, 31)],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Date",
      error:
        "Please enter a valid date between 2000-01-01 and 2099-12-31 (YYYY-MM-DD).",
    });
  });

  /* ---------------- INSERT DUPLICATE RECORDS ---------------- */
  duplicateRecords.forEach((record, rowIdx) => {
    const row = worksheet.getRow(rowIdx + 2);

    flatHeaders.forEach((header, colIdx) => {
      row.getCell(colIdx + 1).value = record[header] ?? "";
    });
  });

  /* ---------------- PROTECT SHEET ---------------- */
  worksheet.protect("yourpassword", {
    selectLockedCells: true,
    selectUnlockedCells: true,
  });

  /* ---------------- RETURN BUFFER ---------------- */
  return await workbook.xlsx.writeBuffer();
};

// ----------------------------------- CONTROLLER FUNCTIONS -------------------------------------


const downloadItemExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Item Template");

    /* ---------------- COLUMNS ---------------- */
    worksheet.columns = itemsFlatHeaders.map((key) => ({
      header: key.replace(/_/g, " ").toUpperCase(),
      key,
      width: 30,
    }));

    /* ---------------- EMPTY ROWS ---------------- */
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    /* ---------------- LOCK ALL CELLS INITIALLY ---------------- */
    for (let row = 1; row <= 101; row++) {
      worksheet.getRow(row).eachCell({ includeEmpty: true }, (cell) => {
        cell.protection = { locked: true };
      });
    }

    /* ---------------- SAFE DROPDOWN HELPERS ---------------- */

    const getColumnIndex = (header) => {
      const idx = itemsFlatHeaders.indexOf(header);
      return idx === -1 ? null : idx + 1;
    };

    const createDropdown = (columnIndex, options = []) => {
      if (!columnIndex || !options.length) return;

      for (let row = 2; row <= 101; row++) {
        const cell = worksheet.getRow(row).getCell(columnIndex);
        cell.protection = { locked: false };
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${options.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Invalid Selection",
          error: "Please select a valid option",
        };
      }
    };

    /* ---------------- CATEGORY DROPDOWN ---------------- */
    createDropdown(
      getColumnIndex("category"),
      Array.isArray(category) ? category : []
    );

    /* ---------------- HEADER STYLING ---------------- */
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFADD8E6" },
      };
      cell.protection = { locked: true };
    });

    /* ---------------- UNLOCK DATA CELLS ---------------- */
    for (let row = 2; row <= 101; row++) {
      itemsFlatHeaders.forEach((_, colIndex) => {
        worksheet.getRow(row).getCell(colIndex + 1).protection = {
          locked: false,
        };
      });
    }

    /* ---------------- PROTECT SHEET ---------------- */
    await worksheet.protect("yourpassword", {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: false,
      deleteRows: false,
    });

    /* ---------------- RESPONSE HEADERS ---------------- */
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Item_Template.xlsx"'
    );
    res.setHeader("Cache-Control", "no-store");

    /* ---------------- STREAM FILE ---------------- */
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Item Excel export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to export item template" });
    }
  }
};


const multiImportProducts = async (req, res) => {
  try {
    let newData = req.body;

    // Convert single object → array
    if (newData && typeof newData === "object" && !Array.isArray(newData)) {
      newData = [newData];
    }

    const { vid: vendorId } = req.params;

    if (!newData || newData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided.",
      });
    }

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID required.",
      });
    }

    // Get last item_number for this vendor
    const lastItem = await Item.findOne({ vendor_id: vendorId })
      .sort({ item_number: -1 })
      .select("item_number");

    let nextItemNumber = lastItem?.item_number ? lastItem.item_number + 1 : 1;

    // Map incoming rows into schema documents
    const docs = newData.map((row) => {
      const itemNumber = nextItemNumber++;
      const customItemId = `${vendorId}ITM${itemNumber}`;

      return {
        product_name: row.product_name ?? null,
        category: row.category ?? null,
        description: row.description ?? null,

        valid_from: row.valid_from ?? null,
        valid_until: row.valid_until ?? null,

        serial_number: row.serial_number ?? null,

        value: row.value ?? 0,
        total_stock: row.total_stock ?? 0,
        in_stock: row.in_stock ?? 0,

        discount: row.discount ?? 0,
        taxation: row.taxation ?? 0,
        discount_amount: row.discount_amount ?? 0,
        tax_amount: row.tax_amount ?? 0,

        price: row.price ?? 0,
        notes: row.notes ?? null,

        image: row.image ?? null,

        status: row.status ?? "active",

        vendor_id: vendorId,
        item_number: itemNumber,
        custom_item_id: customItemId,
      };
    });

    // Bulk insert
    await Item.insertMany(docs);

    return res.status(200).json({
      success: true,
      message: "Products imported successfully.",
      insertedCount: docs.length,
    });

  } catch (err) {
    console.error("Error uploading product data:", err);
    return res.status(500).json({
      success: false,
      message: "Error uploading product data.",
      error: err.message,
    });
  }
};

//Download items excel sheet web siva
const downloadItemExcelSheet = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Item Template");
    const dropdownSheet = workbook.addWorksheet("Dropdown Data");

    dropdownSheet.state = "hidden";

    /* ---------------- COLUMNS ---------------- */
    worksheet.columns = itemsFlatHeaders.map((key) => ({
      header: key.replace(/_/g, " ").toUpperCase(),
      key,
      width: 30,
    }));

    /* ---------------- EMPTY ROWS ---------------- */
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    /* ---------------- LOCK ALL CELLS ---------------- */
    for (let r = 1; r <= 101; r++) {
      worksheet.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
        cell.protection = { locked: true };
      });
    }

    /* ---------------- HELPERS ---------------- */
    const getColIndex = (name) => {
      const idx = itemsFlatHeaders.indexOf(name);
      return idx === -1 ? null : idx + 1;
    };

    const getColLetter = (colIndex) =>
      worksheet.getColumn(colIndex).letter;

    /* ---------------- UNLOCK DATA CELLS ---------------- */
    for (let r = 2; r <= 101; r++) {
      itemsFlatHeaders.forEach((_, i) => {
        worksheet.getRow(r).getCell(i + 1).protection = { locked: false };
      });
    }

    /* ---------------- DROPDOWN DATA ---------------- */
    const categoryValues = ["product", "service", "expense"];

    const addDropdownData = (name, values, colIndex) => {
      if (!values?.length) return null;

      dropdownSheet.getCell(1, colIndex).value = name;
      dropdownSheet.getCell(1, colIndex).font = { bold: true };

      values.forEach((val, i) => {
        dropdownSheet.getCell(i + 2, colIndex).value = val;
      });

      const letter = worksheet.getColumn(colIndex).letter;
      return `'Dropdown Data'!$${letter}$2:$${letter}$${values.length + 1}`;
    };

    const categoryRange = addDropdownData("category", categoryValues, 1);
    const categoryCol = getColIndex("category");

    if (categoryRange && categoryCol) {
      for (let r = 2; r <= 101; r++) {
        worksheet.getRow(r).getCell(categoryCol).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [categoryRange],
          showErrorMessage: true,
          errorTitle: "Invalid Selection",
          error: "Please select a valid option",
        };
      }
    }

    /* ---------------- DATE VALIDATION ---------------- */
    ["valid_from", "valid_until"].forEach((colName) => {
      const colIndex = getColIndex(colName);
      if (!colIndex) return;

      const colLetter = getColLetter(colIndex);
      worksheet.getColumn(colIndex).numFmt = "yyyy-mm-dd";

      worksheet.dataValidations.add(`${colLetter}2:${colLetter}101`, {
        type: "date",
        operator: "between",
        formulae: [new Date(2000, 0, 1), new Date(2099, 11, 31)],
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: "Invalid Date",
        error: "Use YYYY-MM-DD between 2000 and 2099",
      });
    });

    /* ---------------- PRICE FORMULA ---------------- */
    const valueCol = getColIndex("value");
    const discountCol = getColIndex("discount");
    const taxCol = getColIndex("taxation");
    const priceCol = getColIndex("price");

    if (valueCol && discountCol && taxCol && priceCol) {
      for (let r = 2; r <= 101; r++) {
        const row = worksheet.getRow(r);
        row.getCell(priceCol).value = {
          formula: `=${row.getCell(valueCol).address}*(1-${row.getCell(discountCol).address}/100)*(1+${row.getCell(taxCol).address}/100)`,
        };
      }
    }

    /* ---------------- HEADER STYLE ---------------- */
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFADD8E6" },
      };
      cell.protection = { locked: true };
    });

    /* ---------------- PROTECT SHEET ---------------- */
    await worksheet.protect("yourpassword", {
      selectUnlockedCells: true,
      selectLockedCells: false,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertRows: false,
      deleteRows: false,
    });

    /* ---------------- STREAM RESPONSE ---------------- */
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Item_Template.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Item Excel export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to export item template" });
    }
  }
};

// IMPORT ITEMS EXCEL SHEET - WEB SIVA
const importItemsFromXl = async (req, res) => {
  try {
    const newData = Array.isArray(req.body?.newData) ? req.body.newData : [];

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!newData.length) {
      return res.status(400).json({
        success: false,
        message: "No data provided.",
      });
    }

    const vendorId = req.user?.userId;

    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: "Valid vendor ID required.",
      });
    }

    /* ---------------- REQUIRED FIELDS ---------------- */
    const requiredFields = [
      "item_name",
      "category",
      "description",
      "valid_from",
      "valid_until",
      "serial_number",
      "value",
      "discount",
      "taxation",
      "price",
      "notes",
    ];

    const missingFields = [];

    newData.forEach((row, index) => {
      const missing = requiredFields.filter(
        (field) =>
          row[field] === undefined ||
          row[field] === null ||
          row[field].toString().trim() === ""
      );

      if (missing.length) {
        missingFields.push({ row: index + 1, missing });
      }
    });

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in some rows.",
        missingFields,
      });
    }

    /* ---------------- DUPLICATE SERIAL CHECK ---------------- */
    const serials = newData
      .map((r) => r.serial_number?.toString().trim().toLowerCase())
      .filter(Boolean);

    const existingItems = await Item.find({
      vendor_id: vendorId,
      serial_number: { $in: serials },
    }).select("serial_number");

    const existingSerialSet = new Set(
      existingItems.map((i) => i.serial_number.toLowerCase())
    );

    /* ---------------- HELPERS ---------------- */
    const toNumber = (val) =>
      Number(String(val).replace(/[^0-9.]/g, "")) || 0;

    const duplicateEntries = [];
    const ignoredEntries = [];
    const validDocs = [];

    /* ---------------- PRE-GENERATE UNIQUE IDS ---------------- */
    const ids = await Promise.all(
      newData.map(() => generateUniqueCustomId("ITM", Item))
    );
    let idIndex = 0;

    /* ---------------- PROCESS ROWS ---------------- */
    for (const row of newData) {
      const serial = row.serial_number?.toString().trim().toLowerCase();

      // Duplicate serial
      if (existingSerialSet.has(serial)) {
        duplicateEntries.push(row);
        continue;
      }

      const categoryType = row.category.toLowerCase();

      const value = toNumber(row.value);
      const discount = toNumber(row.discount);
      const tax = toNumber(row.taxation);

      const taxAmount = +(value * tax / 100).toFixed(2);
      const discountAmount = +((value + taxAmount) * discount / 100).toFixed(2);
      const finalPrice = +((value + taxAmount) - discountAmount).toFixed(2);

      // DEFAULT STOCK HANDLING
      const totalStock =
        categoryType === "product" ? toNumber(row.total_stock) : null;

      const inStock =
        categoryType === "product" ? toNumber(row.in_stock) : null;

      validDocs.push({
        custom_id: ids[idIndex++],
        vendor_id: vendorId,

        item_name: row.item_name.trim(),
        category: categoryType,
        description: row.description,

        valid_from: row.valid_from,
        valid_until: row.valid_until,

        serial_number: row.serial_number.trim(),

        value,
        total_stock: totalStock,
        in_stock: inStock,

        discount,
        taxation: tax,

        discount_amount: discountAmount,
        tax_amount: taxAmount,
        price: finalPrice,

        notes: row.notes,
        image: row.image || null,
        status: true,
      });
    }

    /* ---------------- INSERT ---------------- */
    let insertedDocs = [];

    if (validDocs.length) {
      insertedDocs = await Item.insertMany(validDocs, { ordered: false });
    }

    /* ---------------- DUPLICATE EXCEL (OPTIONAL) ---------------- */
    let duplicateExcel = null;

    if (duplicateEntries.length) {
      const buffer = await exportDuplicateItemsExcelBuffer(duplicateEntries);
      duplicateExcel = buffer.toString("base64");
    }

    /* ---------------- FINAL RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Items processed successfully.",
      insertedCount: insertedDocs.length,
      duplicateCount: duplicateEntries.length,
      ignoredCount: ignoredEntries.length,
      duplicateEntries,
      ignoredEntries,
      duplicateExcel,
    });

  } catch (err) {
    console.error("Item import error:", err);
    return res.status(500).json({
      success: false,
      message: "Error uploading items.",
    });
  }
};


module.exports = {
  downloadItemExcel,
  multiImportProducts,
  downloadItemExcelSheet,
  importItemsFromXl
}