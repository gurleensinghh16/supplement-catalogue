import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    if (args.category) {
      products = products.filter((p) => p.category === args.category);
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q),
      );
    }

    return products;
  },
});

export const categories = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const cats = [...new Set(products.map((p) => p.category))].sort();
    return cats;
  },
});

export const brands = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const b = [...new Set(products.map((p) => p.brand))].sort();
    return b;
  },
});

export const featured = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.filter((p) => p.featured);
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    stockQuantity: v.optional(v.number()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    await ctx.db.patch(productId, updates);
    return "updated";
  },
});

/** One-time migration: fix all product images to reliable URLs */
export const fixImages = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const imageMap: Record<string, string> = {
      "Gold Standard 100% Whey": "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=500&h=500&fit=crop&auto=format&q=80",
      "Creatine Monohydrate Micronized": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&h=500&fit=crop&auto=format&q=80",
      "Pre-Workout Ignite": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop&auto=format&q=80",
      "BCAA 2200 Powder": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=500&fit=crop&auto=format&q=80",
      "Mass Tech Extreme 2000": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&h=500&fit=crop&auto=format&q=80",
      "Platinum Fish Oil": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&auto=format&q=80",
      "Hydroxycut Hardcore Elite": "https://images.unsplash.com/photo-1571019613242-c5c5dee9f50b?w=500&h=500&fit=crop&auto=format&q=80",
      "Gold Standard Pre-Workout": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&h=500&fit=crop&auto=format&q=80",
      "Creatine HCL": "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=500&h=500&fit=crop&auto=format&q=80",
      "Plant-Based Protein Complex": "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=500&h=500&fit=crop&auto=format&q=80",
      "Casein Protein Powder": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&auto=format&q=80",
      "Nitro-Tech 100% Whey Gold": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&h=500&fit=crop&auto=format&q=80",
      "EAAs Essentials": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=500&fit=crop&auto=format&q=80",
      "Thermopure Fat Burner": "https://images.unsplash.com/photo-1571019613242-c5c5dee9f50b?w=500&h=500&fit=crop&auto=format&q=80",
      "Vitamin D3 5000 IU": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&auto=format&q=80",
      "ZMA Recovery Complex": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&h=500&fit=crop&auto=format&q=80",
      "Tribulus Terrestris": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=500&fit=crop&auto=format&q=80",
      "Mass Gainer Serious Mass": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&h=500&fit=crop&auto=format&q=80",
      "Electrolyte Hydration Mix": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop&auto=format&q=80",
      "Glutamine Recovery Powder": "https://images.unsplash.com/photo-1571019613242-c5c5dee9f50b?w=500&h=500&fit=crop&auto=format&q=80",
    };
    let count = 0;
    for (const product of products) {
      const newUrl = imageMap[product.name];
      if (newUrl && product.imageUrl !== newUrl) {
        await ctx.db.patch(product._id, { imageUrl: newUrl });
        count++;
      }
    }
    return `fixed ${count} images`;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) return "already_seeded";

    const products = [
      {
        name: "Gold Standard 100% Whey",
        brand: "Optimum Nutrition",
        category: "Protein",
        description: "The world's best-selling whey protein powder. 24g of premium protein per serving with 5.5g of naturally occurring BCAAs.",
        price: 2999,
        sku: "ON-GSW-2LB",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["whey", "protein", "muscle recovery", "bestseller"],
        servings: "29 servings",
        weight: "2 lbs",
        featured: true,
        stockQuantity: 150,
      },
      {
        name: "Creatine Monohydrate Micronized",
        brand: "Optimum Nutrition",
        category: "Creatine",
        description: "Micronized creatine powder for enhanced absorption. Supports strength, power, and muscle volume.",
        price: 1499,
        sku: "ON-CM-1200G",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["creatine", "strength", "power", "muscle"],
        servings: "240 servings",
        weight: "1.2 kg",
        featured: false,
        stockQuantity: 200,
      },
      {
        name: "Pre-Workout Ignite",
        brand: "C4 Original",
        category: "Pre-Workout",
        description: "Explosive energy formula with caffeine, beta-alanine, and arginine to fuel your most intense workouts.",
        price: 2499,
        sku: "C4-IGN-30S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["energy", "pre-workout", "focus", "endurance"],
        servings: "30 servings",
        weight: "195 g",
        featured: true,
        stockQuantity: 80,
      },
      {
        name: "BCAA 2200 Powder",
        brand: "MuscleTech",
        category: "Aminos",
        description: "Instantized BCAA powder with a 2:1:1 ratio of leucine, isoleucine, and valine for muscle recovery.",
        price: 1899,
        sku: "MT-BCAA-400",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["bcaa", "amino acids", "recovery", "muscle"],
        servings: "40 servings",
        weight: "400 g",
        featured: false,
        stockQuantity: 120,
      },
      {
        name: "Mass Tech Extreme 2000",
        brand: "MuscleTech",
        category: "Mass Gainers",
        description: "High-calorie mass gainer with 2,000 calories, 80g protein, and 304g carbs per serving.",
        price: 3899,
        sku: "MT-MTE-12LB",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["mass gainer", "calories", "bulking", "size"],
        servings: "8 servings",
        weight: "12 lbs",
        featured: false,
        stockQuantity: 45,
      },
      {
        name: "Platinum Fish Oil",
        brand: "MuscleTech",
        category: "Omega & Health",
        description: "Molecularly distilled fish oil providing 300mg EPA and 200mg DHA per softgel.",
        price: 1299,
        sku: "MT-FO-90S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["fish oil", "omega-3", "heart health", "joints"],
        servings: "90 softgels",
        weight: "180 g",
        featured: false,
        stockQuantity: 300,
      },
      {
        name: "Hydroxycut Hardcore Elite",
        brand: "MuscleTech",
        category: "Fat Burners",
        description: "Thermogenic weight loss supplement with caffeine, green coffee extract, and L-carnitine.",
        price: 1699,
        sku: "MT-HCE-100C",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1571019613242-c5c5dee9f50b?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["fat burner", "thermogenic", "weight loss", "metabolism"],
        servings: "100 capsules",
        weight: "120 g",
        featured: false,
        stockQuantity: 90,
      },
      {
        name: "Gold Standard Pre-Workout",
        brand: "Optimum Nutrition",
        category: "Pre-Workout",
        description: "Clean energy pre-workout with 175mg caffeine, beta-alanine, and AstraGIN for focus and performance.",
        price: 2349,
        sku: "ON-GSPW-30S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["pre-workout", "energy", "focus", "performance"],
        servings: "30 servings",
        weight: "324 g",
        featured: true,
        stockQuantity: 110,
      },
      {
        name: "Creatine HCL",
        brand: "Kaged Muscle",
        category: "Creatine",
        description: "Patented creatine hydrochloride for superior solubility and absorption. No loading phase required.",
        price: 2099,
        sku: "KM-CHCL-90S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["creatine", "hcl", "solubility", "strength"],
        servings: "90 servings",
        weight: "135 g",
        featured: false,
        stockQuantity: 75,
      },
      {
        name: "Plant-Based Protein Complex",
        brand: "Garden of Life",
        category: "Protein",
        description: "Organic plant protein blend from pea, brown rice, and chia seed with live probiotics.",
        price: 3499,
        sku: "GOL-PBP-2LB",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["plant protein", "vegan", "organic", "digestive"],
        servings: "20 servings",
        weight: "2 lbs",
        featured: false,
        stockQuantity: 60,
      },
      {
        name: "Casein Protein Powder",
        brand: "Optimum Nutrition",
        category: "Protein",
        description: "Slow-digesting micellar casein protein with 24g protein per serving for overnight recovery.",
        price: 2799,
        sku: "ON-CP-2LB",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["casein", "protein", "slow digesting", "overnight"],
        servings: "23 servings",
        weight: "2 lbs",
        featured: false,
        stockQuantity: 85,
      },
      {
        name: "Nitro-Tech 100% Whey Gold",
        brand: "MuscleTech",
        category: "Protein",
        description: "Premium whey protein isolate with 30g protein and 6.8g BCAAs per scoop for lean muscle.",
        price: 3149,
        sku: "MT-NTWG-4LB",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["whey", "protein", "isolate", "lean muscle"],
        servings: "40 servings",
        weight: "4 lbs",
        featured: true,
        stockQuantity: 130,
      },
      {
        name: "EAAs Essentials",
        brand: "Xtend",
        category: "Aminos",
        description: "Complete essential amino acid formula with all 9 EAAs for muscle protein synthesis.",
        price: 2299,
        sku: "XT-EAA-30S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["eaa", "amino acids", "recovery", "hydration"],
        servings: "30 servings",
        weight: "270 g",
        featured: false,
        stockQuantity: 95,
      },
      {
        name: "Thermopure Fat Burner",
        brand: "Myprotein",
        category: "Fat Burners",
        description: "Green tea extract, caffeine, and cayenne pepper thermogenic formula for metabolic support.",
        price: 1599,
        sku: "MP-TP-90C",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1571019613242-c5c5dee9f50b?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["fat burner", "thermogenic", "green tea", "metabolism"],
        servings: "90 capsules",
        weight: "108 g",
        featured: false,
        stockQuantity: 140,
      },
      {
        name: "Vitamin D3 5000 IU",
        brand: "Sports Research",
        category: "Vitamins & Minerals",
        description: "High-potency vitamin D3 from organic coconut oil for bone health and immune function.",
        price: 1349,
        sku: "SR-D3-360S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["vitamin d3", "immune", "bone health", "supplement"],
        servings: "360 softgels",
        weight: "200 g",
        featured: false,
        stockQuantity: 250,
      },
      {
        name: "ZMA Recovery Complex",
        brand: "Optimum Nutrition",
        category: "Recovery",
        description: "Zinc, magnesium, and vitamin B6 complex for enhanced recovery and deeper sleep.",
        price: 1099,
        sku: "ON-ZMA-90S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["zma", "recovery", "sleep", "zinc", "magnesium"],
        servings: "90 capsules",
        weight: "120 g",
        featured: false,
        stockQuantity: 180,
      },
      {
        name: "Tribulus Terrestris",
        brand: "BSN",
        category: "Performance",
        description: "Standardized tribulus terrestris extract for natural testosterone support and performance.",
        price: 1449,
        sku: "BSN-TT-90S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["tribulus", "testosterone", "performance", "herb"],
        servings: "90 capsules",
        weight: "108 g",
        featured: false,
        stockQuantity: 65,
      },
      {
        name: "Mass Gainer Serious Mass",
        brand: "Optimum Nutrition",
        category: "Mass Gainers",
        description: "Extreme calorie weight gainer with 1,250 calories, 50g protein, and 252g carbs.",
        price: 3699,
        sku: "ON-SM-12LB",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["mass gainer", "calories", "bulking", "strength"],
        servings: "8 servings",
        weight: "12 lbs",
        featured: false,
        stockQuantity: 35,
      },
      {
        name: "Electrolyte Hydration Mix",
        brand: "LMNT",
        category: "Hydration",
        description: "Zero-sugar electrolyte drink with 1000mg sodium, 200mg potassium for peak hydration.",
        price: 2999,
        sku: "LMNT-EH-30P",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["electrolyte", "hydration", "zero sugar", "sodium"],
        servings: "30 packets",
        weight: "180 g",
        featured: true,
        stockQuantity: 100,
      },
      {
        name: "Glutamine Recovery Powder",
        brand: "MusclePharm",
        category: "Recovery",
        description: "L-glutamine powder for immune function, gut health, and post-workout muscle recovery.",
        price: 1699,
        sku: "MP-GRP-60S",
        inStock: true,
        imageUrl: "https://images.unsplash.com/photo-1571019613242-c5c5dee9f50b?w=500&h=500&fit=crop&auto=format&q=80",
        tags: ["glutamine", "recovery", "immune", "gut health"],
        servings: "60 servings",
        weight: "300 g",
        featured: false,
        stockQuantity: 110,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});
