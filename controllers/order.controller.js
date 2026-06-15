const Product = require("../models/product.model");
const Purchase = require("../models/purchase.model")
const cloudinary = require("cloudinary").v2;


exports.addPurchase = async (req, res) => {
  try {
    const {
      item_id,

      // Product fields (for new item)
      name,
      image,
      category,
      uomCodes,
      discount,
      tax,
      reorderQuantity,

      // Purchase fields
      uom_code,
      purchase_quantity,
      purchase_amount,
      purchase_date,
      balance,
      profit,
    } = req.body;

    let productId = item_id;

    // If item does not exist, create Product
    if (!productId) {
      if (!name || !category) {
        return res.status(400).json({
          message: "Name and Category are required for new item",
        });
      }

      let imageUrl = null;

      if (image) {
        const upload = await cloudinary.uploader.upload(image, {
          folder: "products",
        });

        imageUrl = upload.secure_url;
      }

      const product = await Product.create({
        name,
        image: imageUrl,
        category,
        uomCodes,
        discount,
        tax,
        reorderQuantity,
      });

      productId = product._id;
    }

    // Calculate cost
    const cost =
      Number(purchase_quantity) > 0
        ? Number(purchase_amount) / Number(purchase_quantity)
        : 0;

    // Create purchase
    const purchase = await Purchase.create({
      item_id: productId,
      uom_code,
      purchase_quantity,
      discount: discount || 0,
      tax: tax || 0,
      purchase_amount,
      purchase_date,
      cost,
      balance,
      profit,
    });

    return res.status(201).json({
      success: true,
      message: "Purchase added successfully",
      purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPurchase = await Purchase.findById(id);

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    const {
      item_id,
      uom_code,
      purchase_quantity,
      purchase_amount,
      purchase_date,
      balance,
      profit,
      discount,
      tax,
    } = req.body;

    // Minimum quantity allowed
    const consumedQty =
      Number(existingPurchase.purchase_quantity) -
      Number(existingPurchase.balance);

    if (Number(purchase_quantity) < consumedQty) {
      return res.status(400).json({
        success: false,
        message: `Purchase quantity cannot be less than ${consumedQty}. ${consumedQty} units have already been used/sold.`,
      });
    }

    const cost =
      Number(purchase_quantity) > 0
        ? Number(purchase_amount) / Number(purchase_quantity)
        : 0;

    const purchase = await Purchase.findByIdAndUpdate(
      id,
      {
        item_id,
        uom_code,
        purchase_quantity,
        purchase_amount,
        purchase_date,
        balance,
        profit,
        discount,
        tax,
        cost,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};