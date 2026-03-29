const express = require("express");
const router = express.Router();
const Institution = require("../models/Institution");
const Campus = require("../models/Campus");
const Department = require("../models/Department");
const Program = require("../models/Program");
const { protect, authorize } = require("../middleware/auth");

// ════════════════════════════════════════════
//  INSTITUTIONS
// ════════════════════════════════════════════

router.get("/institutions", protect, async (req, res) => {
  try {
    const institutions = await Institution.find().sort({ createdAt: -1 });
    res.json(institutions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/institutions", protect, authorize("admin"), async (req, res) => {
  try {
    const inst = await Institution.create(req.body);
    res.status(201).json(inst);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put(
  "/institutions/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const inst = await Institution.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      res.json(inst);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

router.delete(
  "/institutions/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      await Institution.findByIdAndDelete(req.params.id);
      res.json({ message: "Institution deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// ════════════════════════════════════════════
//  CAMPUSES
// ════════════════════════════════════════════

router.get("/campuses", protect, async (req, res) => {
  try {
    const campuses = await Campus.find()
      .populate("institution", "name code")
      .sort({ createdAt: -1 });
    res.json(campuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/campuses", protect, authorize("admin"), async (req, res) => {
  try {
    const campus = await Campus.create(req.body);
    res.status(201).json(campus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/campuses/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const campus = await Campus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(campus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete(
  "/campuses/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      await Campus.findByIdAndDelete(req.params.id);
      res.json({ message: "Campus deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// ════════════════════════════════════════════
//  DEPARTMENTS
// ════════════════════════════════════════════

router.get("/departments", protect, async (req, res) => {
  try {
    const depts = await Department.find()
      .populate("campus", "name")
      .sort({ createdAt: -1 });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/departments", protect, authorize("admin"), async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put(
  "/departments/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(dept);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

router.delete(
  "/departments/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      await Department.findByIdAndDelete(req.params.id);
      res.json({ message: "Department deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// ════════════════════════════════════════════
//  PROGRAMS (with Quota sub-documents)
// ════════════════════════════════════════════

router.get("/programs", protect, async (req, res) => {
  try {
    const programs = await Program.find()
      .populate({
        path: "department",
        populate: { path: "campus", populate: { path: "institution" } },
      })
      .sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/programs/:id", protect, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id).populate({
      path: "department",
      populate: { path: "campus", populate: { path: "institution" } },
    });
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/programs", protect, authorize("admin"), async (req, res) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/programs/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(program);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete(
  "/programs/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      await Program.findByIdAndDelete(req.params.id);
      res.json({ message: "Program deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;
