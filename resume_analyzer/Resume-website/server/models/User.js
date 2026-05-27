import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false, default: null },

    // OAuth providers
    googleId: { type: String, default: null },
    linkedinId: { type: String, default: null },
    avatar: { type: String, default: null },

    resume: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String,
      uploadedAt: Date,
    },
    resumeParsed: {
      name: String,
      email: String,
      phone: String,
      degree: [String],
      noOfPages: Number,
      skills: [String],
      experience: String,
      education: String,
      rawText: String,
      atsScore: {
        score: Number,
        issues: Number,
        content: Number,
        sections: Number,
        essentials: Number,
        formatting: Number,
        tailoring: Number,
        breakdown: {
          contact: Number,
          skills: Number,
          experience: Number,
          education: Number,
          keywords: Number,
          length: Number,
        },
      },
    },
    subscription: {
      plan: { type: String, enum: ["free", "basic", "pro"], default: "free" },
      status: {
        type: String,
        enum: ["active", "expired", "none"],
        default: "none",
      },
      razorpayPaymentId: String,
      razorpayOrderId: String,
      startDate: Date,
      expiryDate: Date,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
