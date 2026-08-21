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
        name: "Transparent Labs Grass-Fed Whey Protein Isolate",
        brand: "Transparent Labs",
        category: "Protein",
        description: "100% grass-fed whey protein isolate sourced from grass-fed cattle, raised humanely without growth hormones. 28g protein per serving, no artificial sweeteners, food dyes, or fillers. Available in 19+ flavors.",
        price: 7499,
        sku: "TL-WPI-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394",
        tags: ["whey", "protein", "isolate", "grass-fed"],
        servings: "30 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Transparent Labs Prebiotic Greens",
        brand: "Transparent Labs",
        category: "Greens",
        description: "Clinically-dosed, fiber-packed greens powder with spirulina, chlorella, organic acacia fiber, green banana flour, and Jerusalem artichoke. Supports gut, metabolic, and immune health.",
        price: 4299,
        sku: "TL-GREENS-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/61-P8eSFddL._AC_SL1500.jpg?v=1778831803",
        tags: ["greens", "superfood", "probiotics", "gut health"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Transparent Labs LJ100 Tongkat Ali",
        brand: "Transparent Labs",
        category: "Test Booster",
        description: "Patented LJ100® Eurycoma longifolia extract for natural testosterone support, enhanced vitality, and sexual wellness. 60 capsules per bottle.",
        price: 2599,
        sku: "TL-LJ100-60C",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/TL_LJ100_60_1_1.webp?v=1778838190",
        tags: ["test booster", "tongkat ali", "testosterone", "vitality"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Transparent Labs Krill Oil 60 Softgels",
        brand: "Transparent Labs",
        category: "Omega & Health",
        description: "Superba™ Antarctic krill oil with bioavailable EPA, DHA, and choline in phospholipid form. Supports heart, joint, cognitive, and eye health. No fish burps.",
        price: 2499,
        sku: "TL-KRILL-60S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/TL_KrillOil_60_1_0_1.webp?v=1778837544",
        tags: ["omega 3", "krill oil", "heart health", "joints"],
        servings: "60 softgels",
        weight: "120g",
        featured: false,
        stockQuantity: 40,
      },
      {
        name: "DY Blood & Guts Pre-Workout",
        brand: "DY Nutrition",
        category: "Pre-Workout",
        description: "Dorian Yates approved pre-workout with 350mg caffeine, 6000mg citrulline malate, 5500mg beta-alanine, and 4000mg arginine AKG. Designed for intense workouts.",
        price: 3299,
        sku: "DYN-BG-380G",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500.jpg?v=1721899129",
        tags: ["pre-workout", "energy", "pumps", "high caffeine"],
        servings: "30 servings",
        weight: "380g",
        featured: true,
        stockQuantity: 45,
      },
      {
        name: "DY Nutrition Multivitamin Complex",
        brand: "DY Nutrition",
        category: "Vitamins & Minerals",
        description: "Complete multivitamin with 24 key vitamins and minerals, CoQ10, and Panax Ginseng adaptogens. 60 capsules for daily nutritional support.",
        price: 1699,
        sku: "DYN-MV-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71HJXhxSJVL._AC_SL1500.jpg?v=1721899130",
        tags: ["multivitamin", "vitamins", "minerals", "health"],
        servings: "30 servings",
        weight: "90g",
        featured: false,
        stockQuantity: 80,
      },
      {
        name: "Killer Labz Stim Reaper Black",
        brand: "Killer Labz",
        category: "Pre-Workout",
        description: "High stimulant pre-workout with extreme energy, focus, and long-lasting euphoria. Built for experienced stimulant users who demand maximum intensity.",
        price: 2599,
        sku: "KL-SR-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81dVpMvgXLL._AC_SL1500.jpg?v=1721899130",
        tags: ["pre-workout", "high stimulant", "energy", "focus"],
        servings: "30 servings",
        weight: "250g",
        featured: true,
        stockQuantity: 50,
      },
      {
        name: "Blackstone Labs Dust Reloaded",
        brand: "Blackstone Labs",
        category: "Pre-Workout",
        description: "High-performance pre-workout with clinical doses of citrulline, beta-alanine, and natural caffeine for explosive energy and pumps.",
        price: 2799,
        sku: "BSL-DR-25S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71UBJB5YnWL._AC_SL1500.jpg?v=1721899130",
        tags: ["pre-workout", "energy", "pumps"],
        servings: "25 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Merica Labz Red White & Boom Napalm",
        brand: "Merica Labz",
        category: "Pre-Workout",
        description: "Thermogenic pre-workout with 3 patented ingredients: Cocoabuterol®, MitoBurn™, and ProGBB™. 350mg caffeine, nootropics, and extreme pumps.",
        price: 4999,
        sku: "ML-RWB-20S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/tango-foxtrot.webp?v=1741765326",
        tags: ["pre-workout", "thermogenic", "fat loss", "caffeine"],
        servings: "20 servings",
        weight: "350g",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "BULL NUTRITION 12 STRONG PRE",
        brand: "Bull Nutrition",
        category: "Pre-Workout",
        description: "Clinically dosed pre-workout with 300mg caffeine, 6g citrulline, 10g glycerol, and 3.2g beta-alanine. No fillers, no crash.",
        price: 4999,
        sku: "BN-12S-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032",
        tags: ["pre-workout", "energy", "pumps", "clinically dosed"],
        servings: "30 servings",
        weight: "400g",
        featured: false,
        stockQuantity: 35,
      },
      {
        name: "InnovaPharm Recover-EAA",
        brand: "InnovaPharm",
        category: "Aminos",
        description: "Complete essential amino acid formula for muscle recovery, hydration, and endurance during and after training sessions.",
        price: 6099,
        sku: "IP-RE-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81DFtRBkjcL._AC_SL1500.jpg?v=1721899130",
        tags: ["eaa", "recovery", "amino acids", "hydration"],
        servings: "30 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 40,
      },
      {
        name: "Hawk Labz Brutal EAA",
        brand: "Hawk Labz",
        category: "Aminos",
        description: "Complete EAA formula with all 9 essential amino acids for muscle protein synthesis, recovery, and sustained performance.",
        price: 2199,
        sku: "HL-BEAA-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71t0ibo_kEL._AC_SL1500.jpg?v=1721899130",
        tags: ["eaa", "amino acids", "recovery", "muscle"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 45,
      },
      {
        name: "Hawk Labz Wat A Whey 4 LBS",
        brand: "Hawk Labz",
        category: "Protein",
        description: "Premium whey protein blend with 25g protein per serving for muscle growth and recovery. Great taste and easy mixing formula.",
        price: 6199,
        sku: "HL-WAW-4LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81_Hght1C-L._AC_SL1500.jpg?v=1721899130",
        tags: ["whey", "protein", "muscle building"],
        servings: "50 servings",
        weight: "4 lbs",
        featured: false,
        stockQuantity: 35,
      },
      {
        name: "Muscletech Nitrotech 4 LBS",
        brand: "Muscletech",
        category: "Protein",
        description: "Premium whey protein with 30g protein, 6.8g BCAAs, and 3g creatine per serving for lean muscle building and strength gains.",
        price: 7999,
        sku: "MT-NT-4LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71Cp2-51wxL._AC_SX679.jpg?v=1721901541",
        tags: ["whey", "protein", "muscle building", "creatine"],
        servings: "40 servings",
        weight: "4 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Dymatize ISO 100 5 LBS",
        brand: "Dymatize",
        category: "Protein",
        description: "100% hydrolyzed whey protein isolate with 25g protein, 0g sugar, and fast absorption. The gold standard of protein supplements.",
        price: 16999,
        sku: "DYM-ISO100-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/714JYoHrBNL._AC_SL1500.jpg?v=1721901569",
        tags: ["whey", "protein", "isolate", "hydrolyzed"],
        servings: "40 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Allmax Isoflex Whey Isolate",
        brand: "Allmax",
        category: "Protein",
        description: "Premium whey protein isolate with 27g protein, 0g sugar, and cold-process micro-filtration for maximum purity.",
        price: 8999,
        sku: "AM-IF-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71qy1lgCYzL._AC_SL1500.jpg?v=1721901683",
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
        description: "Collagen peptides with added vitamins for joint health, skin elasticity, gut health, and post-workout recovery support.",
        price: 3999,
        sku: "AM-CP-44S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71iVM2dZeHL._AC_SL1500.jpg?v=1721901584",
        tags: ["collagen", "recovery", "vitamins", "joints"],
        servings: "44 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 70,
      },
      {
        name: "Jacked Factory Nitrosurge",
        brand: "Jacked Factory",
        category: "Pre-Workout",
        description: "Clean pre-workout with beta-alanine, caffeine, and NO boosters for energy, focus, and muscle pumps without the crash.",
        price: 2299,
        sku: "JF-NS-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/716WIzWKR2L._AC_SL1500.jpg?v=1721901618",
        tags: ["pre-workout", "energy", "focus", "pumps"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Jacked Factory Burn-XT Thermogenic",
        brand: "Jacked Factory",
        category: "Fat Burners",
        description: "Clinically studied thermogenic fat burner with green tea extract and caffeine for metabolism support and weight management.",
        price: 1999,
        sku: "JF-BXT-60C",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71RS94MpYgL._AC_SL1500.jpg?v=1721901636",
        tags: ["fat burner", "thermogenic", "metabolism"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "VMI Sports KXR Sport",
        brand: "VMI Sports",
        category: "Performance",
        description: "Advanced pre-workout formula with clinical doses for energy, focus, and muscle pumps. Built for serious athletes.",
        price: 2999,
        sku: "VMI-KXR-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500_abbdccfe-50dc-4cef-be9e-4873e88c6da5.jpg?v=1721901600",
        tags: ["pre-workout", "performance", "energy"],
        servings: "30 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 60,
      },
      {
        name: "Chemical Warfare The Reaper",
        brand: "Chemical Warfare",
        category: "Pre-Workout",
        description: "High-energy pre-workout formula with caffeine, beta-alanine, and citrulline for intense training sessions and maximum pumps.",
        price: 2399,
        sku: "CW-TR-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81Xz1zHFHAL._AC_SL1500.jpg?v=1721899130",
        tags: ["pre-workout", "energy", "focus"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "M&S India Perfect Whey Isolate",
        brand: "Muscle & Strength India",
        category: "Protein",
        description: "100% whey protein isolate with 27g protein per serving, zero sugar, and low fat. Designed for lean muscle growth.",
        price: 3999,
        sku: "MSI-WPI-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p_1564690e-4b1d-4f82-861e-0a6197e244f4.png?v=1782149086",
        tags: ["whey", "protein", "isolate"],
        servings: "40 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "M&S India Perfect Gain",
        brand: "Muscle & Strength India",
        category: "Mass Gainers",
        description: "High-calorie mass gainer with premium protein blend for serious size gains and weight management.",
        price: 2799,
        sku: "MSI-GAIN-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p_eb20e6d8-cf13-4236-bb29-aec1ea815c4c.png?v=1782149102",
        tags: ["mass gainer", "calories", "bulking"],
        servings: "16 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "M&S India Perfect EAA + BCAA",
        brand: "Muscle & Strength India",
        category: "Aminos",
        description: "Premium EAA + BCAA blend for muscle recovery and hydration during workouts. Complete amino acid profile.",
        price: 1299,
        sku: "MSI-EAA-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p_6f9b2bec-4d0c-43b3-ba3b-b61b4a193d8c.png?v=1782149124",
        tags: ["eaa", "bcaa", "amino acids", "recovery"],
        servings: "30 servings",
        weight: "300g",
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
