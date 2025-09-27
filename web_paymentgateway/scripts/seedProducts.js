// scripts/seedProducts.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });   // <-- load file .env.local

import dbConnect from "../lib/mongodb.js";
import Product from "../models/Product.js";

async function main() {
  await dbConnect();

  const sample = [
    { name: "Notebook A", price: 150000, category: "Stationery", description: "Notes 100 pages" },
    { name: "USB Cable", price: 50000, category: "Electronics", description: "Type-C cable" },
    { name: "Coffee Mug", price: 80000, category: "Merch", description: "Ceramic 350ml" },
  ];

  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log("✅ Seed selesai");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed gagal:", e);
  process.exit(1);
});
