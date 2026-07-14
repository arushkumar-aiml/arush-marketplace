const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf-8");
const match = envContent.match(/FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64=(.+)/);

if (!match) {
  console.log("❌ FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 not found in .env.local");
  process.exit(1);
}

const base64 = match[1].trim();

try {
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const parsed = JSON.parse(decoded);

  console.log("✅ Base64 decoded and parsed successfully!");
  console.log("project_id:", parsed.project_id);
  console.log("client_email:", parsed.client_email);
  console.log("private_key starts with:", parsed.private_key?.substring(0, 30));
  console.log("private_key ends with:", parsed.private_key?.slice(-30));
} catch (err) {
  console.log("❌ Failed to decode/parse:", err.message);
}