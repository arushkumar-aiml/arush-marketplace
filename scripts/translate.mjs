import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SOURCE = "messages/en.json";
const TARGET_LANGS = ["hi", "es", "fr", "de", "pt", "ar", "ur", "zh", "ja", "ru", "id", "tr", "vi", "ta", "bn", "sw"];

const LANG_NAMES = {
  hi: "Hindi", es: "Spanish", fr: "French", de: "German", pt: "Portuguese",
  ar: "Arabic", ur: "Urdu", zh: "Chinese", ja: "Japanese", ru: "Russian",
  id: "Indonesian", tr: "Turkish", vi: "Vietnamese", ta: "Tamil", bn: "Bengali", sw: "Swahili",
};

const englishContent = JSON.parse(fs.readFileSync(SOURCE, "utf-8"));

async function translateJSON(targetLangName, json) {
  const prompt = `Translate the string values in this JSON object into ${targetLangName}. Keep all keys exactly the same. Keep the same nested structure. Return ONLY valid JSON, no markdown fences, no explanation.\n\n${JSON.stringify(json, null, 2)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

async function run() {
  for (const lang of TARGET_LANGS) {
    console.log(`Translating to ${lang}...`);
    try {
      const translated = await translateJSON(LANG_NAMES[lang], englishContent);
      fs.writeFileSync(path.join("messages", `${lang}.json`), JSON.stringify(translated, null, 2));
      console.log(`✓ ${lang}.json written`);
      await new Promise((r) => setTimeout(r, 1000)); // small delay to be safe with rate limits
    } catch (err) {
      console.error(`✗ Failed for ${lang}:`, err.message);
    }
  }
}

run();