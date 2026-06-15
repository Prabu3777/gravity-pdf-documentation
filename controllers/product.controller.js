
const Product = require("../models/product.model");
const cloudinary = require("cloudinary").v2;
const UOM = require("../models/units.model");


exports.addUnit = async (req, res) => {
  try {
    const { name, code, isBaseUnit, parentUnit, conversionQty } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Name and code are required",
      });
    }

    const existing = await UOM.findOne({ code });
    if (existing) {
      return res.status(400).json({
        message: "Unit code already exists",
      });
    }

    const unit = await UOM.create({
      name,
      code,
      isBaseUnit: isBaseUnit || false,
      parentUnit: parentUnit || null,
      conversionQty: conversionQty || 1,
    });

    return res.status(201).json({
      message: "Unit created successfully",
      unit,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.editUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      code,
      isBaseUnit,
      parentUnit,
      conversionQty,
    } = req.body;

    // 1. Find unit
    const unit = await UOM.findById(id);

    if (!unit) {
      return res.status(404).json({
        message: "Unit not found",
      });
    }

    // 2. Optional: prevent duplicate code (important)
    if (code && code !== unit.code) {
      const existingCode = await UOM.findOne({ code });
      if (existingCode) {
        return res.status(400).json({
          message: "Unit code already exists",
        });
      }
    }

    // 3. Update only provided fields (safe way)
    if (name !== undefined) unit.name = name;
    if (code !== undefined) unit.code = code;
    if (isBaseUnit !== undefined) unit.isBaseUnit = isBaseUnit;
    if (parentUnit !== undefined) unit.parentUnit = parentUnit;
    if (conversionQty !== undefined) unit.conversionQty = conversionQty;

    // 4. Optional: business rule (only one base unit allowed)
    if (isBaseUnit === true) {
      await UOM.updateMany(
        { _id: { $ne: id } },
        { isBaseUnit: false }
      );
    }

    // 5. Save
    await unit.save();

    // 6. Response
    return res.status(200).json({
      message: "Unit updated successfully",
      unit,
    });

  } catch (error) {
    console.log("Edit Unit Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check unit exists
    const unit = await UOM.findById(id);

    if (!unit) {
      return res.status(404).json({
        message: "Unit not found",
      });
    }

    // 2. Check if unit is used in any product
    const usedInProduct = await Product.findOne({
      uomCodes: id,
    });

    if (usedInProduct) {
      return res.status(400).json({
        message: "Cannot delete unit. It is used in products.",
      });
    }

    // 3. Delete unit
    await UOM.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Unit deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await UOM.findById(id);

    if (!unit) {
      return res.status(404).json({
        message: "Unit not found",
      });
    }

    return res.status(200).json({
      message: "Unit fetched successfully",
      unit,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllUnits = async (req, res) => {
  try {
    const units = await UOM.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Units fetched successfully",
      units,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      image,
      category,
      uomCodes,
      discount,
      tax,
      reorderQuantity,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let imageUrl = null;

    // ✅ Only upload if image exists
    if (image) {
      const upload = await cloudinary.uploader.upload(image, {
        folder: "products",
      });

      imageUrl = upload.secure_url;
    }

    const product = await Product.create({
      name,
      image: imageUrl, // will be null if no image
      category,
      uomCodes,
      discount,
      tax,
      reorderQuantity,
    });

    return res.status(201).json({
      message: "Product added",
      product,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      image,
      category,
      uomCodes,
      discount,
      tax,
      reorderQuantity,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (image) {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "products",
      });

      product.image = uploaded.secure_url;
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (uomCodes !== undefined) product.uomCodes = uomCodes;
    if (discount !== undefined) product.discount = discount;
    if (tax !== undefined) product.tax = tax;
    if (reorderQuantity !== undefined) product.reorderQuantity = reorderQuantity;

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

