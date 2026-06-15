const express = require("express");


const {addPurchase,updatePurchase} = require("../controllers/order.controller")

const router = express.Router();

router.post("/purchase", addPurchase);
router.patch("/purchase/:id", updatePurchase);

module.exports = router;