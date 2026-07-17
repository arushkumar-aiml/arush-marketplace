import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SOURCE = "messages/en.json";
const TARGET_LANGS = ["hi", "es", "fr", "de", "pt", "ar", "ur", "zh", "ja", "ru", "id", "tr", "vi", "ta", "bn", "sw"];

const LANG_NAMES = {
  hi: "Hindi", es: "Spanish", fr: "French", de: "German", pt: "Portuguese",
  ar: "Arabic", ur: "Urdu", zh: "Chinese", ja: "Japanese", ru: "Russian",
  id: "Indonesian", tr: "Turkish", vi: "Vietnamese", ta: "Tamil", bn: "Bengali", sw: "Swahili",
};

const englishContent = JSON.parse(fs.readFileSync(SOURCE, "utf-8"));
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY in .env.local");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateJSON(targetLangName, json) {
  const prompt = `Translate the string values in this JSON object into ${targetLangName}. Keep all keys exactly the same. Keep the same nested structure. Return ONLY valid JSON, no markdown fences, no explanation.\n\n${JSON.stringify(json, null, 2)}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return JSON.parse(text);
}

async function translateWithRetry(langName, json, maxRetries = 4) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await translateJSON(langName, json);
    } catch (err) {
      const isRateLimit = err.message?.includes("429") || err.message?.includes("Too Many Requests");
      if (isRateLimit && attempt < maxRetries) {
        const waitMs = attempt * 10000;
        console.log(`  Rate limited, waiting ${waitMs / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
}

async function run() {
  const outDir = "messages";
  const skipExisting = process.argv.includes("--skip-existing");

  for (const lang of TARGET_LANGS) {
    const outPath = path.join(outDir, `${lang}.json`);

    if (skipExisting && fs.existsSync(outPath)) {
      console.log(`⏭  Skipping ${lang} (already exists, --skip-existing set)`);
      continue;
    }

    console.log(`Translating to ${lang}...`);
    try {
      const translated = await translateWithRetry(LANG_NAMES[lang], englishContent);
      fs.writeFileSync(outPath, JSON.stringify(translated, null, 2));
      console.log(`✓ ${lang}.json written`);
    } catch (err) {
      console.error(`✗ Failed for ${lang}:`, err.message);
    }
    await sleep(2000);
  }
}

run();
