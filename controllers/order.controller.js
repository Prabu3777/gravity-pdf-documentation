const Product = require("../models/product.model");
const Purchase = require("../models/purchase.model")
const Sale = require("../models/sale.model");
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

exports.getPurchases = async (req, res) => {
  try {
    const { item_id, from_date, to_date } = req.query;

    const filter = {};

    // Item filter
    if (item_id) {
      filter.item_id = item_id;
    }

    // Date filter
    if (from_date || to_date) {
      filter.purchase_date = {};

      if (from_date) {
        filter.purchase_date.$gte = new Date(from_date);
      }

      if (to_date) {
        const endDate = new Date(to_date);
        endDate.setHours(23, 59, 59, 999);

        filter.purchase_date.$lte = endDate;
      }
    }

    const purchases = await Purchase.find(filter)
      .populate("item_id")
      .sort({ purchase_date: -1 });

    const totalPurchaseAmount = purchases.reduce(
      (sum, p) => sum + Number(p.purchase_amount || 0),
      0
    );

    const totalQuantity = purchases.reduce(
      (sum, p) => sum + Number(p.purchase_quantity || 0),
      0
    );

    return res.status(200).json({
      success: true,
      count: purchases.length,
      totalQuantity,
      totalPurchaseAmount,
      purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const {
      item_id,
      sales_quantity,
      sales_price,
      discount = 0,
      tax = 0,
      sales_date,
    } = req.body;

    const qty = Number(sales_quantity);

    if (!qty || qty <= 0) {
      throw new Error("Invalid sales quantity");
    }

    const effectiveSaleDate =
      sales_date || new Date();

    let remainingQty = qty;
    let totalProfit = 0;

    const purchaseDetails = [];

    // FIFO based on purchase date
    const purchases = await Purchase.find({
      item_id,
      balance: { $gt: 0 },
      purchase_date: {
        $lte: effectiveSaleDate,
      },
    })
      .sort({
        purchase_date: 1,
        createdAt: 1,
      })
      .session(session);

    for (const purchase of purchases) {
      if (remainingQty <= 0) break;

      const usedQty = Math.min(
        remainingQty,
        purchase.balance
      );

      const profit =
        (Number(sales_price) -
          Number(purchase.cost)) *
        usedQty;

      purchase.balance -= usedQty;
      purchase.profit =
        (purchase.profit || 0) + profit;

      purchaseDetails.push({
        purchase_id: purchase._id,
        quantity_used: usedQty,
        cost: purchase.cost,
        profit,
      });

      remainingQty -= usedQty;
      totalProfit += profit;

      await purchase.save({ session });
    }

    if (remainingQty > 0) {
      throw new Error(
        `Insufficient stock. Missing ${remainingQty} units`
      );
    }

    const sale = new Sale({
      item_id,
      sales_date: effectiveSaleDate,
      sales_quantity: qty,
      sales_price,
      discount,
      tax,

      sales_amount:
        qty * Number(sales_price),

      total_amount:
        qty * Number(sales_price) +
        Number(tax) -
        Number(discount),

      profit: totalProfit,
      purchase_details: purchaseDetails,
    });

    await sale.save({ session });

    // Add sale id to purchases
    for (const detail of purchaseDetails) {
      await Purchase.findByIdAndUpdate(
        detail.purchase_id,
        {
          $addToSet: {
            sales_ids: sale._id,
          },
        },
        { session }
      );
    }

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      sale,
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};


exports.updateSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const saleId = req.params.id;

    const {
      item_id,
      sales_quantity,
      sales_price,
      discount = 0,
      tax = 0,
      sales_date,
    } = req.body;

    const sale = await Sale.findById(saleId).session(session);

    if (!sale) {
      throw new Error("Sale not found");
    }

    const newItemId = item_id || sale.item_id;
    const newQty = Number(sales_quantity);

    if (!newQty || newQty <= 0) {
      throw new Error("Invalid sales quantity");
    }

    // update sale date if provided
    if (sales_date) {
      sale.sales_date = sales_date;
    }

    const effectiveSaleDate =
      sales_date ||
      sale.sales_date ||
      sale.createdAt;

    // ==================================
    // RESTORE OLD PURCHASE ALLOCATION
    // ==================================
    for (const detail of sale.purchase_details) {
      const purchase = await Purchase.findById(
        detail.purchase_id
      ).session(session);

      if (!purchase) continue;

      purchase.balance += detail.quantity_used;

      purchase.profit =
        (purchase.profit || 0) -
        (detail.profit || 0);

      purchase.sales_ids = purchase.sales_ids.filter(
        (id) =>
          id.toString() !== sale._id.toString()
      );

      await purchase.save({ session });
    }

    // reset allocation
    sale.purchase_details = [];
    sale.profit = 0;

    // ==================================
    // FIFO PURCHASE ALLOCATION
    // ==================================
    let remainingQty = newQty;
    let totalProfit = 0;

    const purchaseDetails = [];

    const purchases = await Purchase.find({
      item_id: newItemId,
      balance: { $gt: 0 },

      // IMPORTANT:
      // only purchases available before sale date
      purchase_date: {
        $lte: effectiveSaleDate,
      },
    })
      .sort({
        purchase_date: 1,
        createdAt: 1,
      })
      .session(session);

    for (const purchase of purchases) {
      if (remainingQty <= 0) break;

      const availableQty = purchase.balance;

      if (availableQty <= 0) continue;

      const usedQty = Math.min(
        remainingQty,
        availableQty
      );

      const profit =
        (Number(sales_price) -
          Number(purchase.cost)) *
        usedQty;

      purchase.balance -= usedQty;
      purchase.profit =
        (purchase.profit || 0) + profit;

      if (
        !purchase.sales_ids.some(
          (id) =>
            id.toString() ===
            sale._id.toString()
        )
      ) {
        purchase.sales_ids.push(sale._id);
      }

      await purchase.save({ session });

      purchaseDetails.push({
        purchase_id: purchase._id,
        quantity_used: usedQty,
        cost: purchase.cost,
        profit,
      });

      totalProfit += profit;
      remainingQty -= usedQty;
    }

    // ==================================
    // STOCK CHECK
    // ==================================
    if (remainingQty > 0) {
      throw new Error(
        `Insufficient stock. Missing ${remainingQty} units`
      );
    }

    // ==================================
    // UPDATE SALE
    // ==================================
    sale.item_id = newItemId;
    sale.sales_quantity = newQty;
    sale.sales_price = Number(sales_price);
    sale.discount = Number(discount);
    sale.tax = Number(tax);

    sale.sales_amount =
      newQty * Number(sales_price);

    sale.total_amount =
      sale.sales_amount +
      Number(tax) -
      Number(discount);

    sale.profit = totalProfit;
    sale.purchase_details = purchaseDetails;

    await sale.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Sale updated successfully (FIFO recalculated)",
      sale,
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.deleteSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const saleId = req.params.id;

    const sale = await Sale.findById(saleId).session(session);

    if (!sale) {
      throw new Error("Sale not found");
    }

    // Restore all purchase allocations
    for (const detail of sale.purchase_details) {
      const purchase = await Purchase.findById(
        detail.purchase_id
      ).session(session);

      if (!purchase) continue;

      // Restore stock
      purchase.balance += detail.quantity_used;

      // Restore purchase profit
      purchase.profit =
        (purchase.profit || 0) -
        (detail.profit || 0);

      // Remove sale reference
      purchase.sales_ids = purchase.sales_ids.filter(
        (id) =>
          id.toString() !== sale._id.toString()
      );

      await purchase.save({ session });
    }

    // Delete sale
    await Sale.findByIdAndDelete(
      sale._id,
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
    });

  } catch (error) {
    await session.abortTransaction();

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  } finally {
    session.endSession();
  }
};
