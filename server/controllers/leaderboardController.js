const User = require("../models/User");

const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ score: -1 })
      .select("username score")
      .limit(10);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to load leaderboard", error });
  }
};

module.exports = { getLeaderboard };
