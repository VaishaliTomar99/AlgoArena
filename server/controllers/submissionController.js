const Problem = require("../models/Problem");
const User = require("../models/User");
const Submission = require("../models/Submission");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// ✅ Function 1: Submit solution
const submitSolution = async (req, res) => {
  const { problemId } = req.params;
  const { code, language } = req.body;

  if (language !== "python") {
    return res.status(400).json({ message: "Only Python supported for now." });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const filePath = path.join(__dirname, "temp.py");
    const results = [];

    for (const testCase of problem.testCases) {
      const fullCode = `${code}\n\nsolve()\n`;
      fs.writeFileSync(
        filePath,
        `input_data = """${testCase.input}"""\n\n` +
        `def input():\n\treturn input_data.strip().split('\\n').pop(0)\n\n${fullCode}`
      );

      const result = await new Promise((resolve) => {
        exec(`python ${filePath}`, (error, stdout, stderr) => {
          if (error || stderr) {
            resolve({ status: "Runtime Error", output: stderr || error.message });
          } else if (stdout.trim() === testCase.output.trim()) {
            resolve({ status: "Accepted", output: stdout.trim() });
          } else {
            resolve({ status: "Wrong Answer", output: stdout.trim() });
          }
        });
      });

      results.push({
        input: testCase.input,
        expected: testCase.output,
        actual: result.output,
        verdict: result.status
      });
    }

    fs.unlinkSync(filePath); // Cleanup

    const isAccepted = results.every(r => r.verdict === "Accepted");
    const verdict = isAccepted
      ? "Accepted"
      : results.find(r => r.verdict !== "Accepted")?.verdict || "Wrong Answer";

    await Submission.create({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      verdict,
    });

    if (isAccepted) {
      const user = await User.findById(req.user._id);
      user.score += 10;
      await user.save();
    }

    res.json({ results, verdict });
  } catch (error) {
    res.status(500).json({ message: "Error during code execution", error });
  }
};

// ✅ Function 2: Get submission history
const getSubmissionHistory = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate("problem", "title")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error });
  }
};

module.exports = { submitSolution, getSubmissionHistory };
