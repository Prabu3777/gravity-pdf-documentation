const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    uom_code: {
      type: String,
      required: true,
      trim: true,
    },

    purchase_quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    purchase_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    purchase_date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },

    profit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Purchase", purchaseSchema);