const express = require("express");
const router = express.Router();
const Program = require("../models/Program");
const Applicant = require("../models/Applicant");
const { protect } = require("../middleware/auth");

// GET /api/dashboard
router.get("/", protect, async (req, res) => {
  try {
    const programs = await Program.find().populate({
      path: "department",
      populate: { path: "campus" },
    });

    // Per-program seat matrix
    const seatMatrix = programs.map((p) => {
      const totalFilled = p.quotas.reduce((sum, q) => sum + q.filled, 0);
      return {
        programId: p._id,
        programName: p.name,
        programCode: p.code,
        courseType: p.courseType,
        intake: p.intake,
        totalFilled,
        remaining: p.intake - totalFilled,
        fillPercent: Math.round((totalFilled / p.intake) * 100),
        quotas: p.quotas.map((q) => ({
          name: q.name,
          seats: q.seats,
          filled: q.filled,
          remaining: q.seats - q.filled,
        })),
      };
    });

    // Aggregate overview totals
    const totalIntake = programs.reduce((s, p) => s + p.intake, 0);
    const totalAdmitted = programs.reduce(
      (s, p) => s + p.quotas.reduce((qs, q) => qs + q.filled, 0),
      0,
    );

    // Applicant stats via parallel queries
    const [totalApplicants, pendingDocs, pendingFees, confirmed, allocated] =
      await Promise.all([
        Applicant.countDocuments(),
        Applicant.countDocuments({ documentStatus: { $ne: "Verified" } }),
        Applicant.countDocuments({
          feeStatus: "Pending",
          admissionStatus: "Allocated",
        }),
        Applicant.countDocuments({ admissionStatus: "Confirmed" }),
        Applicant.countDocuments({ admissionStatus: "Allocated" }),
      ]);

    const pendingFeeList = await Applicant.find({
      feeStatus: "Pending",
      admissionStatus: "Allocated",
    })
      .populate("program", "name code")
      .select("name mobile email quotaType feeStatus program")
      .limit(10);

    const pendingDocList = await Applicant.find({
      documentStatus: { $ne: "Verified" },
    })
      .populate("program", "name code")
      .select("name mobile documentStatus program admissionStatus")
      .limit(10);

    res.json({
      overview: {
        totalIntake,
        totalAdmitted,
        totalRemaining: totalIntake - totalAdmitted,
        totalApplicants,
        confirmed,
        allocated,
      },
      applicantStats: { pendingDocs, pendingFees },
      seatMatrix,
      pendingFeeList,
      pendingDocList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
