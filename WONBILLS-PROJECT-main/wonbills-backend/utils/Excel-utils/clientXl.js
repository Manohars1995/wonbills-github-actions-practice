const Client = require("../../models/client");
const User = require("../../models/users");
const ExcelJS = require("exceljs");
const { flatHeaders, countries, dialCodes } = require("../constData");
const { generateUniqueCustomId } = require("../CustomIDGenerator");
const mongoose = require("mongoose");



const flattenRecord = (record = {}) => ({
  "CLIENT NAME": record.client_name || "",
  "TRADING NAME": record.trading_name || "",
  "REGISTRATION NUMBER": record.registration_number || "",
  "EMAIL": record.email || "",

  // FIXED: phone numbers are STRING now
  "WORK NUMBER": record.work_number || "",
  "MOBILE NUMBER": record.mobile_number || "",

  "GST REFERENCE": record.gst_reference || "",
  "NOTES": record.notes || "",

  // FIXED: use `state` instead of `province`
  "OFFICE ADDRESS FLAT NO": record.office_address?.flat_no || "",
  "OFFICE ADDRESS STREET NAME": record.office_address?.street_name || "",
  "OFFICE ADDRESS ZIP CODE": record.office_address?.zip_code || "",
  "OFFICE ADDRESS CITY": record.office_address?.city || "",
  "OFFICE ADDRESS STATE": record.office_address?.state || "",
  "OFFICE ADDRESS COUNTRY": record.office_address?.country || "",

  "BILLING ADDRESS FLAT NO": record.billing_address?.flat_no || "",
  "BILLING ADDRESS STREET NAME": record.billing_address?.street_name || "",
  "BILLING ADDRESS ZIP CODE": record.billing_address?.zip_code || "",
  "BILLING ADDRESS CITY": record.billing_address?.city || "",
  "BILLING ADDRESS STATE": record.billing_address?.state || "",
  "BILLING ADDRESS COUNTRY": record.billing_address?.country || "",
});


const exportDuplicateExcelBuffer = async (duplicateRecords = []) => {
  if (!duplicateRecords.length) return null;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Client Template");
  const dropdownSheet = workbook.addWorksheet("Dropdown Data");

  dropdownSheet.state = "hidden";

  const flatHeaders = Object.keys(flattenRecord({}));

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

    const colLetter = ExcelJS.utils?.getExcelAlpha
      ? ExcelJS.utils.getExcelAlpha(colIndex)
      : String.fromCharCode(64 + colIndex);

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
  const officeCountryRange = addDropdownData("OfficeCountry", countries, 1);
  const billingCountryRange = addDropdownData("BillingCountry", countries, 2);

  /* ---------------- APPLY DROPDOWNS (SAFE) ---------------- */
  createDropdown(
    getColumnIndex("OFFICE ADDRESS COUNTRY"),
    officeCountryRange
  );

  createDropdown(
    getColumnIndex("BILLING ADDRESS COUNTRY"),
    billingCountryRange
  );

  // ❌ Dial code dropdowns REMOVED (columns no longer exist)
  // createDropdown(getColumnIndex("WORK NUMBER DIALCODE"), workDialRange);
  // createDropdown(getColumnIndex("MOBILE NUMBER DIALCODE"), mobileDialRange);

  /* ---------------- INSERT DUPLICATE RECORDS ---------------- */
  const flattened = duplicateRecords.map(flattenRecord);

  flattened.forEach((record, rowIdx) => {
    const row = worksheet.getRow(rowIdx + 2);
    Object.values(record).forEach((value, colIdx) => {
      row.getCell(colIdx + 1).value = value;
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

const downloadExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Client Template");
    const dropdownSheet = workbook.addWorksheet("Dropdown Data");

    dropdownSheet.state = "hidden";

    /* ---------------- COLUMNS ---------------- */
    worksheet.columns = flatHeaders.map((key) => ({
      header: key.replace(/_/g, " ").toUpperCase(),
      key,
      width: 30,
    }));

    /* ---------------- EMPTY ROWS ---------------- */
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    /* ---------------- LOCK ALL CELLS INITIALLY ---------------- */
    for (let i = 1; i <= 101; i++) {
      worksheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
        cell.protection = { locked: true };
      });
    }

    /* ---------------- DROPDOWN HELPERS ---------------- */
    const addDropdownData = (name, values, colIndex) => {
      if (!values?.length) return null;

      dropdownSheet.getCell(1, colIndex).value = name;
      dropdownSheet.getCell(1, colIndex).font = { bold: true };

      values.forEach((value, rowIndex) => {
        dropdownSheet.getCell(rowIndex + 2, colIndex).value = value;
      });

      const colLetter = String.fromCharCode(64 + colIndex);
      return `'Dropdown Data'!$${colLetter}$2:$${colLetter}$${values.length + 1}`;
    };

    const officeCountryRange = addDropdownData("OfficeCountry", countries, 1);
    const billingCountryRange = addDropdownData("BillingCountry", countries, 2);
    const workDialRange = addDropdownData("WorkDial", dialCodes, 3);
    const mobileDialRange = addDropdownData("MobileDial", dialCodes, 4);

    const createDropdown = (columnIndex, range) => {
      if (!range) return;

      for (let row = 2; row <= 101; row++) {
        const cell = worksheet.getRow(row).getCell(columnIndex);
        cell.protection = { locked: false };
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [range],
          showErrorMessage: true,
          errorTitle: "Invalid Selection",
          error: "Please select a valid option from the dropdown list.",
        };
      }
    };

    createDropdown(flatHeaders.indexOf("office_address_country") + 1, officeCountryRange);
    createDropdown(flatHeaders.indexOf("billing_address_country") + 1, billingCountryRange);
    createDropdown(flatHeaders.indexOf("work_number_dialCode") + 1, workDialRange);
    createDropdown(flatHeaders.indexOf("mobile_number_dialCode") + 1, mobileDialRange);

    /* ---------------- HEADER STYLING ---------------- */
    worksheet.getRow(1).eachCell((cell) => {
      cell.protection = { locked: true };
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFADD8E6" },
      };
    });

    /* ---------------- UNLOCK DATA CELLS ---------------- */
    for (let row = 2; row <= 101; row++) {
      flatHeaders.forEach((_, colIndex) => {
        worksheet.getRow(row).getCell(colIndex + 1).protection = { locked: false };
      });
    }

    /* ---------------- PROTECT SHEET ---------------- */
    await worksheet.protect("yourpassword", {
      selectLockedCells: true,
      selectUnlockedCells: true,
    });

    /* ---------------- RESPONSE HEADERS ---------------- */
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Client_Template.xlsx"'
    );
    res.setHeader("Cache-Control", "no-store");

    /* ---------------- STREAM FILE ---------------- */
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export to Excel error:", error);

    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to export data to Excel" });
    }
  }
};

const multiImport = async (req, res) => {
  try {
    let newData = req.body?.newData || req.body;

    /* ---------------- NORMALIZE DATA ---------------- */
    if (!Array.isArray(newData)) {
      newData = [newData];
    }

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

    /* ---------------- BUILD DOCUMENTS ---------------- */
    const docs = [];

    for (const row of newData) {
      const sameAsAddress =
        JSON.stringify(row.billing_address) ===
        JSON.stringify(row.office_address);

      // ONLY source of custom_id
      const customId = await generateUniqueCustomId("CLI", Client);

      docs.push({
        custom_id: customId,
        vendor_id: vendorId,

        client_name: row.client_name?.trim(),
        email: row.email || null,

        work_number: row.work_number || null,
        mobile_number: row.mobile_number || null,

        billing_address: row.billing_address || null,
        office_address: row.office_address || null,

        trading_name: row.trading_name || null,
        registration_number: row.registration_number || null,
        gst_reference: row.gst_reference || null,

        date_of_birth: row.date_of_birth || null,
        profile_picture: row.profile_picture || null,

        state: row.office_address?.province || null,
        country: row.office_address?.country || null,

        notes: row.notes || null,
        same_as_address: sameAsAddress,

        status: true, // Boolean as per schema
      });
    }

    /* ---------------- BULK INSERT ---------------- */
    const insertedDocs = await Client.insertMany(docs, {
      ordered: false, // prevents total failure on partial duplicates
    });

    return res.status(200).json({
      success: true,
      message: "Data imported successfully.",
      insertedCount: insertedDocs.length,
    });

  } catch (err) {
    console.error("Error uploading data:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate client detected.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error uploading data.",
    });
  }
};

// for web
const importDataFromXl = async (req, res) => {
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
      "client_name",
      "trading_name",
      "registration_number",
      "email",
      "work_number",
      "mobile_number",
      "gst_reference",
      "notes",
      "office_address",
      "billing_address",
    ];

    const missingFields = [];

    newData.forEach((row, index) => {
      const missing = requiredFields.filter(
        (field) => row[field] === undefined || row[field] === null
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

    /* ---------------- DUPLICATE EMAIL CHECK ---------------- */
    const emails = newData
      .map((r) => r.email?.trim().toLowerCase())
      .filter(Boolean);

    const existingClients = await Client.find({
      vendor_id: vendorId,
      email: { $in: emails },
    }).select("email");

    const existingEmailSet = new Set(
      existingClients.map((c) => c.email.toLowerCase())
    );

    /* ---------------- HELPERS ---------------- */
    const isValidPhoneString = (val) =>
      typeof val === "string" && val.trim().length >= 8;

    const isValidAddress = (addr) =>
      addr &&
      typeof addr === "object" &&
      ["flat_no", "street_name", "zip_code", "city", "state", "country"].every(
        (k) => addr[k] && addr[k].toString().trim()
      );

    const duplicateEntries = [];
    const ignoredEntries = [];
    const validDocs = [];

    /* ---------------- PRE-GENERATE IDS ---------------- */
    const ids = await Promise.all(
      newData.map(() => generateUniqueCustomId("CLI", Client))
    );
    let idIndex = 0;

    /* ---------------- PROCESS ROWS ---------------- */
    for (const row of newData) {
      const email = row.email?.trim().toLowerCase();

      // Duplicate email
      if (existingEmailSet.has(email)) {
        duplicateEntries.push(row);
        continue;
      }

      // Phone validation
      if (
        !isValidPhoneString(row.work_number) ||
        !isValidPhoneString(row.mobile_number)
      ) {
        ignoredEntries.push(row);
        continue;
      }

      // Address validation
      if (
        !isValidAddress(row.office_address) ||
        !isValidAddress(row.billing_address)
      ) {
        ignoredEntries.push(row);
        continue;
      }

      validDocs.push({
        custom_id: ids[idIndex++],
        vendor_id: vendorId,

        client_name: row.client_name.trim(),
        email,

        work_number: row.work_number.trim(),
        mobile_number: row.mobile_number.trim(),

        office_address: row.office_address,
        billing_address: row.billing_address,

        state: row.office_address.state,
        country: row.office_address.country,

        trading_name: row.trading_name.trim(),
        registration_number: row.registration_number.trim(),
        gst_reference: row.gst_reference.trim(),
        notes: row.notes.trim(),

        same_as_address:
          JSON.stringify(row.office_address) ===
          JSON.stringify(row.billing_address),

        status: true,
      });
    }

    /* ---------------- INSERT ---------------- */
    let insertedDocs = [];
    if (validDocs.length) {
      insertedDocs = await Client.insertMany(validDocs, { ordered: false });
    }

    /* ---------------- DUPLICATE EXCEL ---------------- */
    let duplicateExcel = null;
    if (duplicateEntries.length) {
      const buffer = await exportDuplicateExcelBuffer(duplicateEntries);
      duplicateExcel = buffer.toString("base64");
    }

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Data processed successfully.",
      insertedCount: insertedDocs.length,
      duplicateCount: duplicateEntries.length,
      ignoredCount: ignoredEntries.length,
      duplicateEntries,
      ignoredEntries,
      duplicateExcel,
    });

  } catch (err) {
    console.error("Client import error:", err);
    return res.status(500).json({
      success: false,
      message: "Error uploading data.",
    });
  }
};




const downloadExcelFile = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Client Template");
    const dropdownSheet = workbook.addWorksheet("Dropdown Data");

    // Use 'hidden' for dropdown sheet
    dropdownSheet.state = "hidden";

    // Define column headers
    const columns = flatHeaders.map((key) => ({
      header: key.replace(/_/g, " ").toUpperCase(),
      key,
      width: 30,
    }));
    worksheet.columns = columns;

    // Add empty rows
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    // By default, lock all cells on the worksheet
    worksheet.properties.defaultRowHeight = 15;
    for (let i = 1; i <= 101; i++) {
      worksheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
        cell.protection = { locked: true };
      });
    }

    // Add Dropdown Data to Hidden Sheet
    const addDropdownData = (name, values, colIndex) => {
      if (!values || values.length === 0) return null;

      // Add a header row with the list name
      dropdownSheet.getCell(1, colIndex).value = name;
      dropdownSheet.getCell(1, colIndex).font = { bold: true };

      // Add the values starting from row 2
      values.forEach((value, rowIndex) => {
        dropdownSheet.getCell(rowIndex + 2, colIndex).value = value;
      });

      // Create a range that includes all values
      const colLetter = String.fromCharCode(64 + colIndex);
      const range = `'Dropdown Data'!$${colLetter}$2:$${colLetter}$${values.length + 1
        }`;

      return range;
    };

    // Add Dropdown Data to Hidden Sheet
    const officeCountryRange = addDropdownData("OfficeCountry", countries, 1);
    const billingCountryRange = addDropdownData("BillingCountry", countries, 2);
    const workDialRange = addDropdownData("WorkDial", dialCodes, 3);
    const mobileDialRange = addDropdownData("MobileDial", dialCodes, 4);

    // Apply Dropdowns and UNLOCK these specific cells
    const createDropdown = (columnIndex, range) => {
      if (!range) return;

      const dataColumn = worksheet.getColumn(columnIndex);

      // Apply dropdown and unlock cells for rows 2-101
      for (let rowNumber = 2; rowNumber <= 101; rowNumber++) {
        const cell = worksheet.getRow(rowNumber).getCell(columnIndex);

        // CRITICAL: Unlock this cell so users can select from dropdown
        cell.protection = { locked: false };

        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [range],
          showErrorMessage: true,
          errorTitle: "Invalid Selection",
          error: "Please select a valid option from the dropdown list.",
        };
      }
    };

    // Apply Dropdowns to specific columns
    createDropdown(
      flatHeaders.indexOf("office_address_country") + 1,
      officeCountryRange
    );
    createDropdown(
      flatHeaders.indexOf("billing_address_country") + 1,
      billingCountryRange
    );
    createDropdown(
      flatHeaders.indexOf("work_number_dialCode") + 1,
      workDialRange
    );
    createDropdown(
      flatHeaders.indexOf("mobile_number_dialCode") + 1,
      mobileDialRange
    );

    // Format Header Row
    worksheet.getRow(1).eachCell((cell) => {
      cell.protection = { locked: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFADD8E6" },
      };
      cell.font = { bold: true };
    });

    // UNLOCK all data cells that users need to modify
    for (let rowNumber = 2; rowNumber <= 101; rowNumber++) {
      flatHeaders.forEach((header, colIndex) => {
        const cell = worksheet.getRow(rowNumber).getCell(colIndex + 1);
        // Unlock all data cells
        cell.protection = { locked: false };
      });
    }

    // Now protect the worksheet with appropriate options
    worksheet.protect("yourpassword", {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    });

    // Send File as Binary Stream
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Client_Template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("to Excel error:", error);
    res.status(500).json({ message: "Failed to data to Excel" });
  }
};



module.exports = {
  flattenRecord,
  downloadExcel,
  multiImport,
  importDataFromXl,
  downloadExcelFile
}