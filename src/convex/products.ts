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
        description:
          "The world's best-selling whey protein powder. 24g of premium protein per serving with 5.5g of naturally occurring BCAAs.",
        price: 34.99,
        sku: "ON-GSW-2LB",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1622485831930-6961e42a6e9d?w=400&h=400&fit=crop&auto=format",
        tags: ["whey", "protein", "muscle recovery", "bestseller"],
        servings: "29 servings",
        weight: "2 lbs",
        featured: true,
      },
      {
        name: "Creatine Monohydrate Micronized",
        brand: "Optimum Nutrition",
        category: "Creatine",
        description:
          "Micronized creatine powder for enhanced absorption. Supports strength, power, and muscle volume.",
        price: 17.99,
        sku: "ON-CM-1200G",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=400&h=400&fit=crop&auto=format",
        tags: ["creatine", "strength", "power", "muscle"],
        servings: "240 servings",
        weight: "1.2 kg",
        featured: false,
      },
      {
        name: "Pre-Workout Ignite",
        brand: "C4 Original",
        category: "Pre-Workout",
        description:
          "Explosive energy formula with caffeine, beta-alanine, and arginine to fuel your most intense workouts.",
        price: 29.99,
        sku: "C4-IGN-30S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format",
        tags: ["energy", "pre-workout", "focus", "endurance"],
        servings: "30 servings",
        weight: "195 g",
        featured: true,
      },
      {
        name: "BCAA 2200 Powder",
        brand: "MuscleTech",
        category: "Aminos",
        description:
          "Instantized BCAA powder with a 2:1:1 ratio of leucine, isoleucine, and valine for muscle recovery.",
        price: 22.49,
        sku: "MT-BCAA-400",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop&auto=format",
        tags: ["bcaa", "amino acids", "recovery", "muscle"],
        servings: "40 servings",
        weight: "400 g",
        featured: false,
      },
      {
        name: "Mass Tech Extreme 2000",
        brand: "MuscleTech",
        category: "Mass Gainers",
        description:
          "High-calorie mass gainer with 2,000 calories, 80g protein, and 304g carbs per serving.",
        price: 44.99,
        sku: "MT-MTE-12LB",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1546782899-dfd58be99da0?w=400&h=400&fit=crop&auto=format",
        tags: ["mass gainer", "calories", "bulking", "size"],
        servings: "8 servings",
        weight: "12 lbs",
        featured: false,
      },
      {
        name: "Platinum Fish Oil",
        brand: "MuscleTech",
        category: "Omega & Health",
        description:
          "Molecularly distilled fish oil providing 300mg EPA and 200mg DHA per softgel.",
        price: 14.99,
        sku: "MT-FO-90S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop&auto=format",
        tags: ["fish oil", "omega-3", "heart health", "joints"],
        servings: "90 softgels",
        weight: "180 g",
        featured: false,
      },
      {
        name: "Hydroxycut Hardcore Elite",
        brand: "MuscleTech",
        category: "Fat Burners",
        description:
          "Thermogenic weight loss supplement with caffeine, green coffee extract, and L-carnitine.",
        price: 19.99,
        sku: "MT-HCE-100C",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1556816752-3e8c3e1e1e1e?w=400&h=400&fit=crop&auto=format",
        tags: ["fat burner", "thermogenic", "weight loss", "metabolism"],
        servings: "100 capsules",
        weight: "120 g",
        featured: false,
      },
      {
        name: "Gold Standard Pre-Workout",
        brand: "Optimum Nutrition",
        category: "Pre-Workout",
        description:
          "Clean energy pre-workout with 175mg caffeine, beta-alanine, and AstraGIN for focus and performance.",
        price: 27.99,
        sku: "ON-GSPW-30S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=400&fit=crop&auto=format",
        tags: ["pre-workout", "energy", "focus", "performance"],
        servings: "30 servings",
        weight: "324 g",
        featured: true,
      },
      {
        name: "Creatine HCL",
        brand: "Kaged Muscle",
        category: "Creatine",
        description:
          "Patented creatine hydrochloride for superior solubility and absorption. No loading phase required.",
        price: 24.99,
        sku: "KM-CHCL-90S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop&auto=format",
        tags: ["creatine", "hcl", "solubility", "strength"],
        servings: "90 servings",
        weight: "135 g",
        featured: false,
      },
      {
        name: "Plant-Based Protein Complex",
        brand: "Garden of Life",
        category: "Protein",
        description:
          "Organic plant protein blend from pea, brown rice, and chia seed with live probiotics.",
        price: 39.99,
        sku: "GOL-PBP-2LB",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=400&h=400&fit=crop&auto=format",
        tags: ["plant protein", "vegan", "organic", "digestive"],
        servings: "20 servings",
        weight: "2 lbs",
        featured: false,
      },
      {
        name: "Casein Protein Powder",
        brand: "Optimum Nutrition",
        category: "Protein",
        description:
          "Slow-digesting micellar casein protein with 24g protein per serving for overnight recovery.",
        price: 32.99,
        sku: "ON-CP-2LB",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1574266122935-64d0e810c2c8?w=400&h=400&fit=crop&auto=format",
        tags: ["casein", "protein", "slow digesting", "overnight"],
        servings: "23 servings",
        weight: "2 lbs",
        featured: false,
      },
      {
        name: "Nitro-Tech 100% Whey Gold",
        brand: "MuscleTech",
        category: "Protein",
        description:
          "Premium whey protein isolate with 30g protein and 6.8g BCAAs per scoop for lean muscle.",
        price: 36.99,
        sku: "MT-NTWG-4LB",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1622485831930-6961e42a6e9d?w=400&h=400&fit=crop&auto=format",
        tags: ["whey", "protein", "isolate", "lean muscle"],
        servings: "40 servings",
        weight: "4 lbs",
        featured: true,
      },
      {
        name: "EAAs Essentials",
        brand: "Xtend",
        category: "Aminos",
        description:
          "Complete essential amino acid formula with all 9 EAAs for muscle protein synthesis.",
        price: 26.99,
        sku: "XT-EAA-30S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&auto=format",
        tags: ["eaa", "amino acids", "recovery", "hydration"],
        servings: "30 servings",
        weight: "270 g",
        featured: false,
      },
      {
        name: "Thermopure Fat Burner",
        brand: "Myprotein",
        category: "Fat Burners",
        description:
          "Green tea extract, caffeine, and cayenne pepper thermogenic formula for metabolic support.",
        price: 18.99,
        sku: "MP-TP-90C",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1556816752-3e8c3e1e1e1e?w=400&h=400&fit=crop&auto=format",
        tags: ["fat burner", "thermogenic", "green tea", "metabolism"],
        servings: "90 capsules",
        weight: "108 g",
        featured: false,
      },
      {
        name: "Vitamin D3 5000 IU",
        brand: "Sports Research",
        category: "Vitamins & Minerals",
        description:
          "High-potency vitamin D3 from organic coconut oil for bone health and immune function.",
        price: 15.99,
        sku: "SR-D3-360S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop&auto=format",
        tags: ["vitamin d3", "immune", "bone health", "supplement"],
        servings: "360 softgels",
        weight: "200 g",
        featured: false,
      },
      {
        name: "ZMA Recovery Complex",
        brand: "Optimum Nutrition",
        category: "Recovery",
        description:
          "Zinc, magnesium, and vitamin B6 complex for enhanced recovery and deeper sleep.",
        price: 12.99,
        sku: "ON-ZMA-90S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop&auto=format",
        tags: ["zma", "recovery", "sleep", "zinc", "magnesium"],
        servings: "90 capsules",
        weight: "120 g",
        featured: false,
      },
      {
        name: "Tribulus Terrestris",
        brand: "BSN",
        category: "Performance",
        description:
          "Standardized tribulus terrestris extract for natural testosterone support and performance.",
        price: 16.99,
        sku: "BSN-TT-90S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop&auto=format",
        tags: ["tribulus", "testosterone", "performance", "herb"],
        servings: "90 capsules",
        weight: "108 g",
        featured: false,
      },
      {
        name: "Mass Gainer Serious Mass",
        brand: "Optimum Nutrition",
        category: "Mass Gainers",
        description:
          "Extreme calorie weight gainer with 1,250 calories, 50g protein, and 252g carbs.",
        price: 42.99,
        sku: "ON-SM-12LB",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1546782899-dfd58be99da0?w=400&h=400&fit=crop&auto=format",
        tags: ["mass gainer", "calories", "bulking", "strength"],
        servings: "8 servings",
        weight: "12 lbs",
        featured: false,
      },
      {
        name: "Electrolyte Hydration Mix",
        brand: "LMNT",
        category: "Hydration",
        description:
          "Zero-sugar electrolyte drink with 1000mg sodium, 200mg potassium for peak hydration.",
        price: 35.0,
        sku: "LMNT-EH-30P",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format",
        tags: ["electrolyte", "hydration", "zero sugar", "sodium"],
        servings: "30 packets",
        weight: "180 g",
        featured: true,
      },
      {
        name: "Glutamine Recovery Powder",
        brand: "MusclePharm",
        category: "Recovery",
        description:
          "L-glutamine powder for immune function, gut health, and post-workout muscle recovery.",
        price: 19.99,
        sku: "MP-GRP-60S",
        inStock: true,
        imageUrl:
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&auto=format",
        tags: ["glutamine", "recovery", "immune", "gut health"],
        servings: "60 servings",
        weight: "300 g",
        featured: false,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});
