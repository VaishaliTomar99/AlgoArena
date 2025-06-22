const Problem = require("../models/Problem");

const getAllProblems = async (req, res) => {
  try {
    const { search, difficulty, tags } = req.query;

    let query = {};

    // 🔍 Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // 🎯 Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // 🏷️ Filter by tags (one or multiple)
    if (tags) {
      const tagsArray = tags.split(",");
      query.tags = { $in: tagsArray };
    }

    const problems = await Problem.find(query);
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching problems", error });
  }
};

module.exports = {
  getAllProblems,
  getProblemById,
};
