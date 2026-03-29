const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    // Personal Details (15 fields)
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    category: {
      type: String,
      enum: ["GM", "SC", "ST", "OBC", "EWS"],
      required: true,
    },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    nationality: { type: String, default: "Indian" },
    qualifyingExam: { type: String, required: true },
    marks: { type: Number, required: true },
    allotmentNumber: { type: String }, // For govt: KCET/COMEDK allotment

    // Admission Details
    entryType: { type: String, enum: ["Regular", "Lateral"], required: true },
    quotaType: {
      type: String,
      enum: ["KCET", "COMEDK", "Management", "SNQ"],
      required: true,
    },
    admissionMode: {
      type: String,
      enum: ["Government", "Management"],
      required: true,
    },
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },

    // Status Fields
    documentStatus: {
      type: String,
      enum: ["Pending", "Submitted", "Verified"],
      default: "Pending",
    },
    feeStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    admissionStatus: {
      type: String,
      enum: ["Applied", "Allocated", "Confirmed", "Rejected"],
      default: "Applied",
    },

    // Generated on confirmation - immutable
    admissionNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Applicant", applicantSchema);
