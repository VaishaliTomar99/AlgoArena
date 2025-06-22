const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");

router.get("/", getLeaderboard); // GET /api/leaderboard

module.exports = router;
