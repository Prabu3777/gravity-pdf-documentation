const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String
    },

    category: {
      type: String,
      required: true,
      enum: [
        "GROCERY",
        "SNACKS",
        "DRY_FRUITS",
        "DAIRY",
        "BAKERY",
        "FRUITS",
        "VEGETABLES",
        "MEAT",
        "SEAFOOD",
        "HOUSEHOLD",
        "PERSONAL_CARE",
        "STATIONERY",
        "Electronics"
      ]
    },

    uomCodes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "UOM"
    }],

    discount: {
      type: Number,
      default: 0
    },

    tax: {
      type: Number,
      default: 0
    },

    reorderQuantity: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);