import mongoose from "mongoose";

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/atsify";

function isAtlasUri(uri) {
  return uri?.includes("mongodb.net");
}

function isDnsOrNetworkError(err) {
  const code = err?.code;
  const message = err?.message || "";
  return (
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEOUT" ||
    message.includes("querySrv") ||
    message.includes("getaddrinfo")
  );
}

export async function connectDatabase() {
  const configuredUri = process.env.MONGO_URI?.trim() || LOCAL_MONGO_URI;

  try {
    await mongoose.connect(configuredUri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected ✅ (${mongoose.connection.host})`);
    return;
  } catch (err) {
    if (!isAtlasUri(configuredUri) || !isDnsOrNetworkError(err)) {
      throw err;
    }

    console.warn(
      "MongoDB Atlas unreachable (cluster deleted, DNS blocked, or offline). Trying local MongoDB…",
    );
    await mongoose.connect(LOCAL_MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected ✅ (local fallback: ${LOCAL_MONGO_URI})`);
  }
}

export function getDatabaseErrorMessage(err) {
  if (isDnsOrNetworkError(err)) {
    return "Cannot reach the database. Use local MongoDB (mongodb://127.0.0.1:27017/atsify) or update MONGO_URI in server/.env with a valid Atlas connection string.";
  }
  return err?.message || "Database error";
}
