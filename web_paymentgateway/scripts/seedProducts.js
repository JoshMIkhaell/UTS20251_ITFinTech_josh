// scripts/seedProducts.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });   // <-- load file .env.local

const { default: dbConnect } = await import("../lib/mongodb.js");
const { default: Product } = await import("../models/Product.js");

async function main() {
  await dbConnect();

  const sample = [
    {
      name: "Yonex Astrox 88S Badminton Racket",
      price: 2499000,
      category: "Racket Sports",
      description: "Raket kontrol untuk pemain all-around dengan frame ringan dan respons cepat.",
      image: "https://images.squarespace-cdn.com/content/v1/52785d8ae4b0c7662185b542/1582976535434-I0S2MBHF6Y9O3L9KM9CL/astrox88s.jpg"
    },
    {
      name: "Wilson Pro Staff 97 V14 Tennis Racket",
      price: 3299000,
      category: "Racket Sports",
      description: "Tennis racket ikonik dengan stabilitas tinggi dan feel klasik untuk penyerang baseline.",
      image: "https://cdn.shopify.com/s/files/1/0221/0751/products/WR125911U_ProStaff97v14_BL_Hero_1024x1024.jpg"
    },
    {
      name: "Nike Air Zoom Pegasus 41",
      price: 1899000,
      category: "Running",
      description: "Sepatu lari responsif dengan bantalan Zoom Air ganda dan upper engineered mesh.",
      image: "https://static.nike.com/a/images/t_prod/w_1920,c_limit,f_auto,q_auto/028311c8-bc8a-41ca-8da3-5f0c542aab72/air-zoom-pegasus-41.jpg"
    },
    {
      name: "Adidas Predator League FG",
      price: 1599000,
      category: "Football",
      description: "Sepatu bola dengan kontrol grip strategis untuk akurasi passing dan shooting di lapangan kering.",
      image: "https://assets.adidas.com/images/w_600,f_auto,q_auto/0cec9d80aba34388bba5ada3011f305d_9366/Predator_League_FG_Pink_IE4095_01_standard.jpg"
    },
    {
      name: "Molten F5A4800 Soccer Ball",
      price: 899000,
      category: "Football",
      description: "Bola sepak match-grade dengan panel bonded dan permukaan PU untuk lintasan stabil.",
      image: "https://cdn.shopify.com/s/files/1/0585/0767/1147/products/F5A4800_1800x1800.jpg"
    },
    {
      name: "Lululemon Reversible Yoga Mat 5mm",
      price: 1299000,
      category: "Yoga",
      description: "Mat yoga anti-slip dua sisi dengan dukungan 5mm untuk latihan vinyasa maupun yin.",
      image: "https://images.lululemon.com/is/image/lululemon/LWYG7YS_0001_1?wid=1024"
    },
    {
      name: "Under Armour Project Rock Training Gloves",
      price: 499000,
      category: "Training",
      description: "Sarung tangan latihan dengan padding telapak dan ventilasi mesh untuk grip maksimal.",
      image: "https://underarmour.scene7.com/is/image/Underarmour/1369833-001_DEFAULT?fmt=jpg&qlt=85&wid=1200&hei=1500"
    },
    {
      name: "CamelBak Podium Chill 710ml",
      price: 349000,
      category: "Accessories",
      description: "Botol olahraga isolasi ganda dengan Jet Valve anti bocor, ideal untuk bersepeda dan lari.",
      image: "https://cdn.shopify.com/s/files/1/0251/5031/2054/products/1874004062-PodiumChill_SageLeaf-LogoBack.jpg"
    }
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
