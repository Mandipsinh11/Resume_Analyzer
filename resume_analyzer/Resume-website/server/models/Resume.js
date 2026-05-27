import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalResume: String,

    optimizedResume: String,

    atsScore: Number,

    missingKeywords: [String],

    suggestions: [String],

    jobDescription: String,

    role: String,
  },
  {
    timestamps: true,
  },
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
