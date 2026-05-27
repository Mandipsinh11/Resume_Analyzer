import dotenv from "dotenv";
dotenv.config();
import { analyzeResume } from "../utils/gemini.js";

async function testAnalysis() {
    console.log("Starting ATS Resume Analysis Test...");

    const role = "Software Engineer";
    const jobDescription = "We are looking for a Software Engineer with experience in React, Node.js, and MongoDB.";
    const resumeText = "John Doe. Experience: Worked at Tech Corp as a coder. Skills: HTML, CSS. Education: BS CS.";

    try {
        const result = await analyzeResume(role, jobDescription, resumeText);
        console.log("✅ Analysis successful!");
        console.log("Result:", JSON.stringify(result, null, 2));

        // Check for required fields
        const requiredFields = ["atsScore", "missingKeywords", "addedKeywords", "issues", "suggestions", "optimizedResume"];
        const missing = requiredFields.filter(f => !(f in result));

        if (missing.length === 0) {
            console.log("✅ JSON format is valid and contains all required fields.");
        } else {
            console.log("❌ Missing fields:", missing.join(", "));
        }
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

testAnalysis();
