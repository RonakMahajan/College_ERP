const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    code: { type: String, required: true, uppercase: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", departmentSchema);
