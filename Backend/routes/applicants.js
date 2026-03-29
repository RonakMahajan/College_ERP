const express = require("express");
const router = express.Router();
const Applicant = require("../models/Applicant");
const Program = require("../models/Program");
const { protect, authorize } = require("../middleware/auth");
const { generateAdmissionNumber } = require("../utils/admissionNumber");

// GET /api/applicants  — with optional filters
router.get("/", protect, async (req, res) => {
  try {
    const { status, quota, program, search } = req.query;
    const filter = {};
    if (status) filter.admissionStatus = status;
    if (quota) filter.quotaType = quota;
    if (program) filter.program = program;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
      ];
    }
    const applicants = await Applicant.find(filter)
      .populate("program", "name code courseType")
      .sort({ createdAt: -1 });
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/applicants/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate({
      path: "program",
      populate: { path: "department", populate: { path: "campus" } },
    });
    if (!applicant)
      return res.status(404).json({ message: "Applicant not found" });
    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/applicants  — create new applicant
router.post(
  "/",
  protect,
  authorize("admin", "admission_officer"),
  async (req, res) => {
    try {
      const applicant = await Applicant.create(req.body);
      res.status(201).json(applicant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

// PUT /api/applicants/:id — update basic info
router.put(
  "/:id",
  protect,
  authorize("admin", "admission_officer"),
  async (req, res) => {
    try {
      const applicant = await Applicant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!applicant)
        return res.status(404).json({ message: "Applicant not found" });
      res.json(applicant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

// PUT /api/applicants/:id/documents — update document status
router.put(
  "/:id/documents",
  protect,
  authorize("admin", "admission_officer"),
  async (req, res) => {
    try {
      const { documentStatus } = req.body;
      const applicant = await Applicant.findByIdAndUpdate(
        req.params.id,
        { documentStatus },
        { new: true },
      );
      res.json(applicant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

// PUT /api/applicants/:id/fee — mark fee as paid/pending
router.put(
  "/:id/fee",
  protect,
  authorize("admin", "admission_officer"),
  async (req, res) => {
    try {
      const { feeStatus } = req.body;
      const applicant = await Applicant.findByIdAndUpdate(
        req.params.id,
        { feeStatus },
        { new: true },
      );
      res.json(applicant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

// POST /api/applicants/:id/allocate — CORE: seat allocation with quota check
router.post(
  "/:id/allocate",
  protect,
  authorize("admin", "admission_officer"),
  async (req, res) => {
    try {
      const { programId } = req.body;
      const applicant = await Applicant.findById(req.params.id);
      if (!applicant)
        return res.status(404).json({ message: "Applicant not found" });

      if (["Allocated", "Confirmed"].includes(applicant.admissionStatus)) {
        return res
          .status(400)
          .json({ message: "Seat already allocated to this applicant" });
      }

      const program = await Program.findById(programId);
      if (!program)
        return res.status(404).json({ message: "Program not found" });

      // Find matching quota by applicant's quotaType
      const quota = program.quotas.find((q) => q.name === applicant.quotaType);
      if (!quota) {
        return res.status(400).json({
          message: `Quota '${applicant.quotaType}' is not configured for this program`,
        });
      }

      // ★ KEY RULE: Block if quota is full
      if (quota.filled >= quota.seats) {
        return res.status(400).json({
          message: `Quota '${quota.name}' is FULL (${quota.filled}/${quota.seats} seats filled). Cannot allocate.`,
        });
      }

      // Allocate — increment quota counter atomically
      quota.filled += 1;
      await program.save();

      applicant.program = programId;
      applicant.admissionStatus = "Allocated";
      await applicant.save();

      const remaining = quota.seats - quota.filled;
      res.json({
        message: "Seat allocated successfully",
        applicant,
        remainingSeats: remaining,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// POST /api/applicants/:id/confirm — confirm admission (fee check + generate number)
router.post(
  "/:id/confirm",
  protect,
  authorize("admin", "admission_officer"),
  async (req, res) => {
    try {
      const applicant = await Applicant.findById(req.params.id);
      if (!applicant)
        return res.status(404).json({ message: "Applicant not found" });

      // Rule 1: Must be allocated
      if (applicant.admissionStatus !== "Allocated") {
        return res
          .status(400)
          .json({ message: "Seat must be allocated before confirmation" });
      }

      // Rule 2: Fee must be paid
      if (applicant.feeStatus !== "Paid") {
        return res
          .status(400)
          .json({ message: "Fee must be paid before confirming admission" });
      }

      // Rule 3: Admission number is immutable — never regenerate
      if (applicant.admissionNumber) {
        return res.status(400).json({
          message:
            "Admission already confirmed. Admission number cannot be changed.",
        });
      }

      const program = await Program.findById(applicant.program);
      if (!program)
        return res
          .status(400)
          .json({ message: "Program not linked. Allocate a seat first." });

      // Generate unique admission number
      applicant.admissionNumber = await generateAdmissionNumber(
        applicant,
        program,
      );
      applicant.admissionStatus = "Confirmed";
      await applicant.save();

      res.json({
        message: "Admission confirmed successfully!",
        admissionNumber: applicant.admissionNumber,
        applicant,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// DELETE /api/applicants/:id — admin only, frees seat if allocated
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant)
      return res.status(404).json({ message: "Applicant not found" });

    // Free the quota seat if allocated (but not confirmed — confirmed is permanent)
    if (applicant.admissionStatus === "Allocated" && applicant.program) {
      const program = await Program.findById(applicant.program);
      if (program) {
        const quota = program.quotas.find(
          (q) => q.name === applicant.quotaType,
        );
        if (quota && quota.filled > 0) {
          quota.filled -= 1;
          await program.save();
        }
      }
    }

    await applicant.deleteOne();
    res.json({ message: "Applicant deleted and seat released" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
