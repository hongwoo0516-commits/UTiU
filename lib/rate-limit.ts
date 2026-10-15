import "server-only";
import { createHash } from "node:crypto";
import { connectDB } from "@/lib/mongodb";
import { AuthAttempt } from "@/models/AuthAttempt";

// Stored in MongoDB so the limit also applies across server restarts/instances.
export async function allowAuthAttempt(email: string, kind: "login" | "register") {
  await connectDB();
  await AuthAttempt.init();
  const windowMs = kind === "login" ? 15 * 60 * 1000 : 60 * 60 * 1000;
  const limit = kind === "login" ? 10 : 5;
  const window = Math.floor(Date.now() / windowMs);
  const digest = createHash("sha256").update(email).digest("hex");
  const attempt = await AuthAttempt.findOneAndUpdate(
    { _id: `${kind}:${digest}:${window}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * windowMs) } },
    { upsert: true, returnDocument: "after" },
  );
  return attempt.count <= limit;
}
