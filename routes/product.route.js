const express = require("express");


const {
  addUnit,
  editUnit,
  deleteUnit,
  getUnit,
  getAllUnits,
  addProduct,
  editProduct
} = require("../controllers/product.controller");

const router = express.Router();

router.post("/addUnit", addUnit);
router.patch("/unit/edit/:id", editUnit);
router.post("/deleteUnit", deleteUnit);
router.get("/unit/:id", getUnit);
router.get("/unit", getAllUnits);
router.post("/addProduct", addProduct);
router.patch("/edit/:id", editProduct);

module.exports = router;