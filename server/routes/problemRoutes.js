const express = require("express");
const router = express.Router();
const { getAllProblems, getProblemById } = require("../controllers/problemController");

// Publicly accessible
router.get("/", getAllProblems);            // GET /api/problems
router.get("/:id", getProblemById);         // GET /api/problems/:id

module.exports = router;
