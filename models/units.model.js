const mongoose = require("mongoose");

const uomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    code: {
        type: String,
        required: true
    },

    isBaseUnit: {
        type: Boolean,
        default: false
    },

    parentUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UOM",
        default: null
    },

    conversionQty: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model("Units", uomSchema);