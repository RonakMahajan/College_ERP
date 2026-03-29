const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    address: { type: String },
    phone: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Institution", institutionSchema);
