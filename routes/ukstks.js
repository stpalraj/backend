import express from "express";
import Ukstk from "../models/Ukstk.js";
import upload from "../middleware/fileUpload.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  try {
    // const ukstks = await Ukstk.find();
    // const ukstks = await Ukstk.find().sort({ createdAt: -1 });
    //
    // Optionally add aggregation pipeline for additional data
    const pipeline = [
      { $match: {} },
      { $sort: { createdAt: -1 } }, // Sort by creation date descending
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          settled: { $sum: { $cond: ["$cardSettled", 1, 0] } },
          printed: { $sum: { $cond: ["$cardPrinted", 1, 0] } },
          ukstks: { $push: "$$ROOT" },
        },
      },
    ];
    const stats = await Ukstk.aggregate(pipeline);
    res.json(
      stats.length
        ? stats[0]
        : { total: 0, settled: 0, printed: 0, ukstks: [] },
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET by id
router.get("/:id", async (req, res) => {
  try {
    const ukstk = await Ukstk.findById(req.params.id);
    if (!ukstk) return res.status(404).json({ message: "Not found" });
    res.json(ukstk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.body.cardNumber || !req.body.ukstks) {
      return res
        .status(400)
        .json({ message: "Card number and ukstks are required" });
    }
    if (await Ukstk.findOne({ ukstks: req.body.ukstks })) {
      return res.status(400).json({ message: "Ukstks already exists" });
    }
    // if (await Ukstk.findOne({ cardNumber: req.body.cardNumber })) {
    //   return res.status(400).json({ message: "Card number already exists" });
    // }
    const newUkstk = new Ukstk({
      name: req.body.name,
      id: req.body.id,
      description: req.body.description,
      cardNumber: req.body.cardNumber,
      phone: req.body.phone,
      ukstks: req.body.ukstks,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
      cardSettled: req.body.cardSettled || false,
      cardPrinted: req.body.cardPrinted || false,
    });
    const savedUkstk = await newUkstk.save();
    res.status(201).json(savedUkstk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const ukstk = await Ukstk.findById(req.params.id);
    if (!ukstk) return res.status(404).json({ message: "Not found" });

    if (req.body.ukstks) {
      const existingUkstk = await Ukstk.findOne({
        ukstks: req.body.ukstks,
        _id: { $ne: req.params.id },
      });
      if (existingUkstk) {
        return res.status(400).json({ message: "Ukstks already exists" });
      }
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedUkstk = await Ukstk.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    );
    if (!updatedUkstk) return res.status(404).json({ message: "Not found" });
    res.json(updatedUkstk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deletedUkstk = await Ukstk.findByIdAndDelete(req.params.id);
    if (!deletedUkstk) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE all
router.delete("/", async (req, res) => {
  try {
    await Ukstk.deleteMany({});
    res.json({ message: "All ukstks deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as Settled and Printed
router.put("/:id/settle-print", async (req, res) => {
  const { body } = req;
  try {
    const ukstk = await Ukstk.findById(req.params.id);
    if (!ukstk) return res.status(404).json({ message: "Not found" });
    const updatedUkstk = await Ukstk.findByIdAndUpdate(
      req.params.id,
      {
        $set: { cardSettled: body.cardSettled, cardPrinted: body.cardPrinted },
      },
      { new: true },
    );
    res.json(updatedUkstk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
