const mongoose = require("mongoose");

const quotaSchema = new mongoose.Schema({
  name: { type: String, required: true }, // KCET, COMEDK, Management, etc.
  seats: { type: Number, required: true, min: 0 },
  filled: { type: Number, default: 0 },
});

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    courseType: { type: String, enum: ["UG", "PG"], required: true },
    entryType: { type: String, enum: ["Regular", "Lateral"], required: true },
    admissionMode: {
      type: String,
      enum: ["Government", "Management"],
      required: true,
    },
    academicYear: { type: String, required: true },
    intake: { type: Number, required: true, min: 1 },
    quotas: [quotaSchema],
  },
  { timestamps: true },
);

// Virtual: total allocated seats
programSchema.virtual("totalFilled").get(function () {
  return this.quotas.reduce((sum, q) => sum + q.filled, 0);
});

// Validate: sum of quota seats must not exceed intake
programSchema.pre("save", async function () {
  const totalQuotaSeats = this.quotas.reduce((sum, q) => sum + q.seats, 0);
  if (totalQuotaSeats > this.intake) {
    throw new Error(
      `Total quota seats (${totalQuotaSeats}) exceed intake (${this.intake})`,
    );
  }
});

module.exports = mongoose.model("Program", programSchema);
