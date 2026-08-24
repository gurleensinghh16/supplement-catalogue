import fs from "fs";
import path from "path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../src/convex/_generated/api.js";

const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error(
    "Missing VITE_CONVEX_URL. Run like:\n" +
    '  $env:VITE_CONVEX_URL="https://combative-bass-696.convex.cloud"; node scripts/importProducts.mjs'
  );
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const filePath = path.resolve(process.cwd(), "products_convex_import.jsonl");
console.log("Reading from:", filePath);

const raw = fs.readFileSync(filePath, "utf-8");
const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

const CATEGORY_MAP = {
  "whey protein blend": "Whey Protein",
  "whey concentrate protein": "Whey Protein",
  "lean gainer": "Gainer",
  "fat burners": "Fat Burner",
  "pre workout": "Pre-Workout",
  "l carnitine": "L-Carnitine",
  "protein meal": "Protein Bar",
  "meal replacement bar": "Protein Bar",
};

function normalizeCategory(cat) {
  if (!cat || cat === "nan") return "Other";
  const key = cat.trim().toLowerCase();
  return CATEGORY_MAP[key] || cat.trim();
}

const products = lines.map((line) => {
  const p = JSON.parse(line);
  return {
    name: p.name,
    brand: p.brand,
    category: normalizeCategory(p.category),
    description: p.description || "",
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    sku: p.sku || "",
    inStock: !!p.inStock,
    imageUrl: p.imageUrl,
    tags: p.tags || [],
    servings: p.servings,
    weight: p.weight,
    featured: p.featured || false,
    stockQuantity: p.stockQuantity ?? 0,
  };
});

console.log(`Parsed ${products.length} products.`);

const BATCH_SIZE = 50;
let done = 0;

for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const batch = products.slice(i, i + BATCH_SIZE);
  const result = await client.mutation(api.products.bulkImport, {
    products: batch,
  });
  done += batch.length;
  console.log(`Batch ${Math.ceil((i + 1) / BATCH_SIZE)}: ${result} (${done}/${products.length} sent)`);
}

console.log("Import complete.");