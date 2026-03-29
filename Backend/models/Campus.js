const mongoose = require("mongoose");

const campusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    location: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Campus", campusSchema);
