const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../middleware/check-auth");
const itemControllers = require("../controllers/item-controllers");

router.post('/create', authenticateToken, itemControllers.createItem);
router.get('/', authenticateToken, itemControllers.getItemsByUserId);
router.get('/:id', authenticateToken, itemControllers.getItemById);
router.put('/update-item/:id', authenticateToken, itemControllers.updateItemById);
router.get('/valid-active/items', authenticateToken, itemControllers.getValidItemsByUserId);
router.post('/download/excel', authenticateToken, itemControllers.downloadItemExcel);
router.put('/import/data', authenticateToken, itemControllers.importDataFromXl);
router.patch("/toggle-item/:itemId", authenticateToken, itemControllers.toggleItemStatusById);


module.exports = router;