const Item = require("../models/item");
const { sendLowStockEmail } = require("../utils/EmailUtils");
const { updateAlertsOnLowStock } = require("../controllers/alert-controllers");

const CheckStockToSendNotification = async (productNumbers, userEmail, userID) => {
  try {
    if (!Array.isArray(productNumbers) || productNumbers.length === 0) {
      return; // Nothing to process
    }

    // Convert product_numbers to numbers if they come as strings
    const itemNumbers = productNumbers.map((num) => Number(num)).filter(Boolean);

    if (itemNumbers.length === 0) return;

    // 🔍 Find low-stock active products
    const lowStockProducts = await Item.find({
      item_number: { $in: itemNumbers },
      in_stock: { $lte: 5 },
      status: "active",
    });

    if (lowStockProducts.length === 0) return;

    // ✉️ Send email only once
    await sendLowStockEmail(lowStockProducts, userEmail);

    // 🔔 Create alerts
    await updateAlertsOnLowStock(lowStockProducts, userID);

  } catch (error) {
    console.error("Error in CheckStockToSendNotification:", error.message);
  }
};


const convertExcelDate = (excelDate) => {
  if (!excelDate) return null;

  if (!isNaN(excelDate)) {
    const date = new Date((excelDate - 25569) * 86400000);
    return date.toISOString().split("T")[0];
  }

  // If it's already a string in a valid format, return it
  if (typeof excelDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
    return excelDate;
  }

  console.warn("Invalid date format:", excelDate);
  return null;
};

module.exports = {
  CheckStockToSendNotification,
  convertExcelDate
}