const express = require("express");
const router = express.Router();
const { submitSolution, getSubmissionHistory } = require("../controllers/submissionController");
const protect = require("../middleware/authMiddleware");

router.post("/:problemId", protect, submitSolution);
router.get("/history", protect, getSubmissionHistory); // 🆕 Added this line

module.exports = router;
