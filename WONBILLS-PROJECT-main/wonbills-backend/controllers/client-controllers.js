const Client = require("../models/client");
const {
  uploadImageToS3Bucket,
  deleteImageFromS3Bucket,
} = require("../utils/S3-bucket");
const {
  flattenRecord,
  downloadExcel,
  importDataFromXl,
} = require("../utils/Excel-utils/clientXl");
const ExcelJS = require("exceljs");
const { countries, dialCodes } = require("../utils/constData");
const { checkSubscriptionStatusByUserID } = require("./shared-controllers");
const { generateUniqueCustomId } = require("../utils/CustomIDGenerator");

const downloadExcelSheet = async (req, res) => {
  await downloadExcel(req, res);
};

const importExcelSheet = async (req, res) => {
  await importDataFromXl(req, res);
};

const getClientsByUserId = async (req, res) => {
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

    const skip = req.query.offset !== undefined ? offset : (page - 1) * limit;

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
        console.warn("Invalid sort query received. Falling back to default.", {
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
      // ---- String fields ----
      searchFilter.push(
        { client_name: { $regex: search, $options: "i" } },
        { trading_name: { $regex: search, $options: "i" } },
        { custom_id: { $regex: search, $options: "i" } },
        { work_number: { $regex: search, $options: "i" } },
        { gst_reference: { $regex: search, $options: "i" } },
      );

      // ---- Boolean field (status) ----
      const normalizedSearch = search.toLowerCase();

      if (["true", "false", "active", "inactive"].includes(normalizedSearch)) {
        searchFilter.push({
          status: normalizedSearch === "true" || normalizedSearch === "active",
        });
      }
    }

    /* ---------------- FILTER ---------------- */
    const filter = {
      vendor_id,
      client_name: { $ne: null },
      ...(searchFilter.length > 0 && { $or: searchFilter }),
    };

    /* ---------------- PARALLEL QUERY ---------------- */
    const [totalClients, clients] = await Promise.all([
      Client.countDocuments(filter),
      Client.find(filter, {
        client_name: 1,
        trading_name: 1,
        work_number: 1,
        gst_reference: 1,
        status: 1,
        custom_id: 1,
        createdAt: 1,
        profile_picture: 1,
      })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    /* ---------------- FORMAT RESPONSE ---------------- */
    const formattedClients = clients.map((client) => ({
      ...client,
      work_number: client.work_number || "N/A",
    }));

    return res.status(200).json({
      success: true,
      message: "Fetched clients successfully",
      totalClients,
      totalPages: Math.ceil(totalClients / limit),
      offset: skip,
      limit,
      clients: formattedClients,
    });
  } catch (err) {
    console.error("Error fetching clients:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};

const getActiveClientsByUserId = async (req, res) => {
  try {
    const vendor_id = req.user?.userId;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const clients = await Client.find(
      {
        vendor_id: vendor_id,
        status: true,
        client_name: { $ne: null },
      },
      {
        // Only fetch these three fields
        _id: 1,
        custom_id: 1,
        client_name: 1,
      },
    )
      .sort({ client_name: 1 }) // Sorting by name (A-Z) is usually better for lists
      .lean();

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients: clients,
    });
  } catch (err) {
    console.error("Failed to fetch active clients:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const toggleClientStatusById = async (req, res) => {
  try {
    const clientId = req.params.cid;
    const vendor_id = req.user?.userId;

    /* ---------------- AUTH ---------------- */

    if (!vendor_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized vendor",
      });
    }

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    /* ---------------- FETCH (VENDOR-SCOPED) ---------------- */

    const client = await Client.findOne({
      custom_id: clientId,
      vendor_id: vendor_id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found or access denied",
      });
    }

    /* ---------------- TOGGLE BOOLEAN ---------------- */

    client.status = !client.status;
    await client.save();

    /* ---------------- RESPONSE ---------------- */

    return res.status(200).json({
      success: true,
      data: {
        id: client.custom_id,
        status: client.status,
      },
      message: `Client status updated to ${
        client.status ? "active" : "inactive"
      } successfully`,
    });
  } catch (err) {
    console.error("Error toggling client status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle client status",
    });
  }
};

// CREATE CLIENT USING VENDOR ID
const createClient = async (req, res) => {
  try {
    const vendorId = req.user?.userId;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required.",
      });
    }

    /* ---------------- EXTRACT INPUT ---------------- */
    const {
      client_name,
      email,
      work_number,
      mobile_number,
      billing_address = {},
      office_address = {},
      trading_name,
      registration_number,
      gst_reference,
      date_of_birth,
      notes,
      status,
      same_as_ofc,
      profile_picture,
    } = req.body;

    if (!client_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client name is required.",
      });
    }

    /* ---------------- SUBSCRIPTION CHECK ---------------- */
    const subscriptionStatus = await checkSubscriptionStatusByUserID(vendorId);
    if (!subscriptionStatus?.success) {
      return res.status(403).json({
        success: false,
        message: `${subscriptionStatus.message}. Cannot add more clients.`,
      });
    }

    /* ---------------- GENERATE UNIQUE CLIENT ID ---------------- */
    const customClientId = await generateUniqueCustomId("CLI", Client);

    /* ---------------- SAME ADDRESS CHECK ---------------- */
    const sameAsAddressComputed =
      JSON.stringify(billing_address) === JSON.stringify(office_address);

    /* ---------------- CREATE CLIENT ---------------- */
    const newClient = await Client.create({
      vendor_id: vendorId,
      custom_id: customClientId,

      client_name: client_name.trim(),
      email: email?.trim().toLowerCase() || null,

      work_number: work_number || null,
      mobile_number: mobile_number || null,

      billing_address,
      office_address,

      trading_name: trading_name || null,
      registration_number: registration_number || null,
      gst_reference: gst_reference || null,
      date_of_birth: date_of_birth || null,
      notes: notes || null,
      profile_picture: profile_picture || null,

      status: typeof status === "boolean" ? status : true,
      same_as_address:
        typeof same_as_ofc === "boolean" ? same_as_ofc : sameAsAddressComputed,

      country: billing_address?.country || null,
      state: billing_address?.province || null,
    });

    /* ---------------- RESPONSE ---------------- */
    return res.status(201).json({
      success: true,
      message: "Client created successfully.",
      customClientId,
      client: newClient,
    });
  } catch (err) {
    console.error("Error creating client:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create client.",
      error: err.message,
    });
  }
};

const updateClientById = async (req, res) => {
  try {
    const clientID = req.params.cid;

    if (!clientID) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    // Extract payload
    const {
      client_name,
      email,
      work_number,
      mobile_number,
      billing_address,
      office_address,
      trading_name,
      gst_reference,
      registration_number,
      date_of_birth,
      notes,
      status,
      same_as_address,
      profile_picture,
    } = req.body;

    // Find the client
    const client = await Client.findOne({ custom_id: clientID });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Compute necessary values
    const billingAddr = billing_address || client.billing_address || {};
    const officeAddr = office_address || client.office_address || {};

    const country = billingAddr?.country || client.country || null;
    const province = billingAddr?.province || client.state || null;

    const computedSameAddress =
      same_as_address ??
      JSON.stringify(billingAddr) === JSON.stringify(officeAddr);

    // Update fields only if provided
    client.client_name = client_name ?? client.client_name;
    client.email = email ?? client.email;
    client.work_number = work_number ?? client.work_number;
    client.mobile_number = mobile_number ?? client.mobile_number;
    client.billing_address = billing_address ?? client.billing_address;
    client.office_address = office_address ?? client.office_address;

    client.trading_name = trading_name ?? client.trading_name;
    client.gst_reference = gst_reference ?? client.gst_reference;
    client.registration_number =
      registration_number ?? client.registration_number;
    client.date_of_birth = date_of_birth ?? client.date_of_birth;
    client.notes = notes ?? client.notes;

    client.status = status ?? client.status;
    client.same_as_address = computedSameAddress;

    client.country = country;
    client.state = province;
    client.profile_picture = profile_picture || "";

    // Save the document
    await client.save(); // will auto-update `updatedAt`

    return res.status(200).json({
      success: true,
      message: "Client updated successfully.",
      client,
    });
  } catch (err) {
    console.error("Failed to update client:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update client.",
    });
  }
};

const getClientById = async (req, res) => {
  try {
    const { cId: cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const client = await Client.findOne({ custom_id: cid });

    return res.status(200).json({
      success: !!client,
      data: client || null,
      message: client
        ? "Client data fetched successfully."
        : "Client not found.",
    });
  } catch (err) {
    console.error("Error fetching client:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch client data.",
    });
  }
};

const uploadClientImgById = async (req, res) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const clientId = req.params.cid;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing client ID",
      });
    }

    // Check if client exists
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Upload image to S3
    const imageUrl = await uploadImageToS3Bucket(req.file);

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to S3",
      });
    }

    // Prepare new image data
    const imageData = {
      url: imageUrl,
      timestamp: Date.now(),
    };

    // Update mongo document
    client.profile_picture = imageData;
    await client.save();

    // Send response
    return res.status(200).json({
      success: true,
      message: "Client profile picture updated successfully.",
      image: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading client profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading profile picture, try again.",
    });
  }
};

const DeleteClientImgById = async (req, res) => {
  try {
    const clientId = req.params.cid;

    // Validate client ID
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing client ID",
      });
    }

    // Check client exists
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Validate image URL
    const { url: imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // Delete from S3 bucket
    await deleteImageFromS3Bucket(imageUrl);

    // Remove from client record
    client.profile_picture = null;
    await client.save();

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting client image:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};

const getColumnNames = async (req, res) => {
  try {
    // Fields to hide
    const excludedFields = [
      "_id",
      "__v",
      "vendor_id",
      "profile_picture",
      "createdAt",
      "updatedAt",
      "office_address",
      "same_as_address",
      "date_of_birth",
      "created_date",
      "last_modified_date",
      "client_number",
    ];

    // Extract keys from Mongoose Schema
    const schemaPaths = Object.keys(Client.schema.paths);

    // Filter out unwanted fields
    const filteredColumns = schemaPaths.filter(
      (field) => !excludedFields.includes(field),
    );

    return res.status(200).json({
      success: true,
      message: "Fetched column names successfully.",
      data: filteredColumns,
    });
  } catch (err) {
    console.error("Error getting column names:", err);
    return res.status(500).json({
      success: false,
      message: "Error getting column names.",
    });
  }
};

const downloadDuplicateRecordsExcelFile = async (req, res) => {
  try {
    const { duplicateRecords } = req.body;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Client Template");
    const dropdownSheet = workbook.addWorksheet("Dropdown Data");

    dropdownSheet.state = "hidden";

    const flatHeaders = Object.keys(flattenRecord({}));
    const columns = flatHeaders.map((key) => ({
      header: key.replace(/_/g, " ")?.toUpperCase(),
      key,
      width: 30,
    }));
    worksheet.columns = columns;

    // Add 1000 empty rows for user input
    for (let i = 0; i < 1000; i++) {
      worksheet.addRow({});
    }

    worksheet.properties.defaultRowHeight = 15;

    // Protect only the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.protection = { locked: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFADD8E6" },
      };
      cell.font = { bold: true };
    });

    // Unlock all other cells for editing
    for (let i = 2; i <= 1001; i++) {
      // Allow data entry from row 2 onwards
      worksheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
        cell.protection = { locked: false };
      });
    }

    // Add dropdown data
    const addDropdownData = (name, values, colIndex) => {
      if (!values || values.length === 0) return null;

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
      for (let rowNumber = 2; rowNumber <= 101; rowNumber++) {
        const cell = worksheet.getRow(rowNumber).getCell(columnIndex);
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

    createDropdown(
      flatHeaders.indexOf("OFFICE ADDRESS COUNTRY") + 1,
      officeCountryRange,
    );
    createDropdown(
      flatHeaders.indexOf("BILLING ADDRESS COUNTRY") + 1,
      billingCountryRange,
    );
    createDropdown(
      flatHeaders.indexOf("WORK NUMBER DIALCODE") + 1,
      workDialRange,
    );
    createDropdown(
      flatHeaders.indexOf("MOBILE NUMBER DIALCODE") + 1,
      mobileDialRange,
    );

    if (duplicateRecords && duplicateRecords.length > 0) {
      const flattenedDuplicates = duplicateRecords.map(flattenRecord);
      let startRow = 2; // Start inserting from row 2 (row 1 is the header)

      flattenedDuplicates.forEach((record, index) => {
        const row = worksheet.getRow(startRow + index);
        Object.values(record).forEach((value, colIndex) => {
          const cell = row.getCell(colIndex + 1);
          cell.value = value;
          cell.protection = { locked: false }; // Unlock duplicate record cells for editing
        });
      });
    }

    // Apply worksheet protection but allow editing of unlocked cells
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

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Client_Template.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(" to Excel error:", error);
    res.status(500).json({ message: "Failed to  data to Excel" });
  }
};

module.exports = {
  downloadExcelSheet,
  getClientsByUserId,
  getActiveClientsByUserId,
  toggleClientStatusById,
  createClient,
  updateClientById,
  getClientById,
  uploadClientImgById,
  DeleteClientImgById,
  getColumnNames,
  downloadDuplicateRecordsExcelFile,
  importExcelSheet,
};
