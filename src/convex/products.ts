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

export const fixImages = mutation({
  args: {},
  handler: async () => "no-op",
});

export const reseed = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    for (const p of products) {
      await ctx.db.delete(p._id);
    }
    return `deleted ${products.length} products`;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) return "already_seeded";

    const products = [
      {
        name: "M&S India Perfect EAA + BCAA",
        brand: "Muscle & Strength India",
        category: "Aminos",
        description: "Premium EAA + BCAA blend for muscle recovery and hydration during workouts.",
        price: 1299,
        sku: "MSI-EAA-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["eaa", "bcaa", "amino acids", "recovery"],
        servings: "30 servings",
        weight: "300g",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "M&S India Perfect Gain",
        brand: "Muscle & Strength India",
        category: "Mass Gainers",
        description: "High-calorie mass gainer with premium protein blend for serious size gains.",
        price: 2799,
        sku: "MSI-GAIN-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["mass gainer", "calories", "bulking"],
        servings: "16 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "M&S India Perfect Whey Isolate",
        brand: "Muscle & Strength India",
        category: "Protein",
        description: "100% whey protein isolate with 27g protein per serving, zero sugar and low fat.",
        price: 3999,
        sku: "MSI-WPI-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "isolate"],
        servings: "40 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Hawk Labz Crusher Pre Workout",
        brand: "Hawk Labz",
        category: "Pre-Workout",
        description: "High-energy pre-workout with 300mg caffeine, citrulline, and beta-alanine for extreme pumps and focus.",
        price: 2199,
        sku: "HL-CRUSH-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "energy", "pumps", "caffeine"],
        servings: "30 servings",
        weight: "350g",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Muscletech Nitrotech 4 Lbs",
        brand: "Muscletech",
        category: "Protein",
        description: "Premium whey protein with 30g protein, 6.8g BCAAs, and 3g creatine per serving for lean muscle.",
        price: 7999,
        sku: "MT-NT-4LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "muscle building"],
        servings: "40 servings",
        weight: "4 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Killer Labz Stim Reaper Black",
        brand: "Killer Labz",
        category: "Pre-Workout",
        description: "High stimulant pre-workout with extreme energy, focus, and long-lasting euphoria and muscle pumps.",
        price: 2599,
        sku: "KL-SR-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "high stimulant", "energy", "focus"],
        servings: "30 servings",
        weight: "250g",
        featured: true,
        stockQuantity: 50,
      },
      {
        name: "Jacked Factory Burn-XT Thermogenic",
        brand: "Jacked Factory",
        category: "Fat Burners",
        description: "Clinically studied thermogenic fat burner with green tea extract and caffeine for metabolism support.",
        price: 1999,
        sku: "JF-BXT-60C",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["fat burner", "thermogenic", "metabolism"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Jacked Factory Green Surge Superfood",
        brand: "Jacked Factory",
        category: "Greens",
        description: "Keto-friendly greens drink with spirulina, wheat grass, barley grass, probiotics, and digestive enzymes.",
        price: 2699,
        sku: "JF-GS-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/61-P8eSFddL._AC_SL1500.jpg?v=1778831803&width=600",
        tags: ["greens", "superfood", "probiotics", "digestive"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Blackstone Labs Dust Reloaded",
        brand: "Blackstone Labs",
        category: "Pre-Workout",
        description: "High-performance pre-workout with clinical doses of citrulline, beta-alanine, and natural caffeine.",
        price: 2799,
        sku: "BSL-DR-25S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "energy", "pumps"],
        servings: "25 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "InnovaPharm Recover-EAA",
        brand: "InnovaPharm",
        category: "Aminos",
        description: "Complete essential amino acid formula for muscle recovery, hydration, and endurance.",
        price: 6099,
        sku: "IP-RE-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["eaa", "recovery", "amino acids", "hydration"],
        servings: "30 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 40,
      },
      {
        name: "Dymitize Elite Whey 5 LBS",
        brand: "Dymitize",
        category: "Protein",
        description: "Premium whey protein isolate with 25g protein, 5.5g BCAAs, and 0g added sugar per serving.",
        price: 11600,
        sku: "DYM-EW-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "isolate", "chocolate"],
        servings: "60 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "VMI Sports KXR Sport",
        brand: "VMI Sports",
        category: "Performance",
        description: "Advanced pre-workout formula with clinical doses for energy, focus, and muscle pumps.",
        price: 2999,
        sku: "VMI-KXR-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "performance", "energy"],
        servings: "30 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 60,
      },
      {
        name: "Revive MD Collagen Powder",
        brand: "Revive MD",
        category: "Recovery",
        description: "Premium collagen peptides for joint health, skin elasticity, gut health, and recovery.",
        price: 4199,
        sku: "RMD-COL-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["collagen", "recovery", "joints", "skin"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Hawk Labz Brutal EAA",
        brand: "Hawk Labz",
        category: "Aminos",
        description: "Complete EAA formula with 9 essential amino acids for muscle protein synthesis and recovery.",
        price: 2199,
        sku: "HL-BEAA-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["eaa", "amino acids", "recovery", "muscle"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 45,
      },
      {
        name: "Chemical Warfare The Reaper",
        brand: "Chemical Warfare",
        category: "Pre-Workout",
        description: "High-energy pre-workout formula with caffeine, beta-alanine, and citrulline for intense training.",
        price: 2399,
        sku: "CW-TR-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "energy", "focus"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Hawk Labz Wat A Whey 4 LBS",
        brand: "Hawk Labz",
        category: "Protein",
        description: "Premium whey protein blend with 25g protein per serving for muscle growth and recovery.",
        price: 6199,
        sku: "HL-WAW-4LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "muscle building"],
        servings: "50 servings",
        weight: "4 lbs",
        featured: false,
        stockQuantity: 35,
      },
      {
        name: "Transparent Labs Whey Protein Isolate",
        brand: "Transparent Labs",
        category: "Protein",
        description: "100% grass-fed whey protein isolate with 28g protein, no artificial sweeteners, dyes, or fillers.",
        price: 7499,
        sku: "TL-WPI-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "isolate", "grass-fed"],
        servings: "30 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Dymatize ISO 100 5 LBS",
        brand: "Dymatize",
        category: "Protein",
        description: "100% hydrolyzed whey protein isolate with 25g protein, 0g sugar, and fast absorption.",
        price: 16999,
        sku: "DYM-ISO100-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "isolate", "hydrolyzed"],
        servings: "40 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "DY Nutrition Multivitamin Complex",
        brand: "DY Nutrition",
        category: "Vitamins & Minerals",
        description: "Complete multivitamin with 24 key vitamins, minerals, CoQ10, and Panax Ginseng adaptogens.",
        price: 1699,
        sku: "DYN-MV-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["multivitamin", "vitamins", "minerals", "health"],
        servings: "30 servings",
        weight: "90g",
        featured: false,
        stockQuantity: 80,
      },
      {
        name: "DY Blood & Guts Pre-Workout",
        brand: "DY Nutrition",
        category: "Pre-Workout",
        description: "High-strength pre-workout with 350mg caffeine, citrulline malate, beta-alanine, and arginine.",
        price: 3299,
        sku: "DYN-BG-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "energy", "pumps", "high caffeine"],
        servings: "30 servings",
        weight: "380g",
        featured: false,
        stockQuantity: 45,
      },
      {
        name: "Jacked Factory Nitrosurge",
        brand: "Jacked Factory",
        category: "Pre-Workout",
        description: "Clean pre-workout with beta-alanine, caffeine, and NO boosters for energy, focus, and pumps.",
        price: 2299,
        sku: "JF-NS-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "energy", "focus", "pumps"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Allmax Isoflex Whey Isolate",
        brand: "Allmax",
        category: "Protein",
        description: "Premium whey protein isolate with 27g protein, 0g sugar, and cold-process micro-filtration.",
        price: 8999,
        sku: "AM-IF-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "isolate"],
        servings: "45 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Allmax Collagen Peptides",
        brand: "Allmax",
        category: "Recovery",
        description: "Collagen peptides with added vitamins for joint health, skin, and gut support.",
        price: 3999,
        sku: "AM-CP-44S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["collagen", "recovery", "vitamins", "joints"],
        servings: "44 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 70,
      },
      {
        name: "JNX Sports The Curse Pre-Workout",
        brand: "JNX Sports",
        category: "Pre-Workout",
        description: "Iconic pre-workout with 200mg caffeine, beta-alanine, and arginine for explosive energy.",
        price: 1799,
        sku: "JNX-CURSE-50S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "energy", "caffeine"],
        servings: "50 servings",
        weight: "225g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "BSN N.O.-XPLODE Pre-Workout",
        brand: "BSN",
        category: "Pre-Workout",
        description: "Legendary pre-workout with creatine, beta-alanine, and energy blend for pumps and focus.",
        price: 3399,
        sku: "BSN-NOX-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032&width=600",
        tags: ["pre-workout", "creatine", "energy", "pumps"],
        servings: "30 servings",
        weight: "450g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "DY Nutrition Shadowhey Isolate 2KG",
        brand: "DY Nutrition",
        category: "Protein",
        description: "Premium whey protein isolate with 27g protein per serving for lean muscle growth.",
        price: 8999,
        sku: "DYN-SHI-2KG",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394&width=600",
        tags: ["whey", "protein", "isolate", "lean muscle"],
        servings: "66 servings",
        weight: "2 kg",
        featured: false,
        stockQuantity: 0,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});
