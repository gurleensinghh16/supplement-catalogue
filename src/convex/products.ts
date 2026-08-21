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
      "CreGAAtine": "https://www.unmatchedsupps.com/cdn/shop/files/CGA_MAIN.png?v=1742515493&width=600",
      "Isolate": "https://www.unmatchedsupps.com/cdn/shop/files/ISO_MAIN.png?v=1742515555&width=600",
      "ElectraShred": "https://www.unmatchedsupps.com/cdn/shop/files/ES_PL_FRONT.png?v=1777929793&width=600",
      "Longevity EAA": "https://www.unmatchedsupps.com/cdn/shop/files/L_EAA_MAIN.png?v=1742515620&width=600",
      "BH2K": "https://www.unmatchedsupps.com/cdn/shop/files/BH2K_MAIN.png?v=1742515443&width=600",
      "Dileucine": "https://www.unmatchedsupps.com/cdn/shop/files/DIL_MAIN.png?v=1742515525&width=600",
      "Peptisize": "https://www.unmatchedsupps.com/cdn/shop/files/PS_MAIN.png?v=1742515585&width=600",
      "Stem Cell": "https://www.unmatchedsupps.com/cdn/shop/files/SC_MAIN.png?v=1742515710&width=600",
      "Longevity Greens+": "https://www.unmatchedsupps.com/cdn/shop/files/LG_MAIN.png?v=1742515655&width=600",
      "Outlier": "https://www.unmatchedsupps.com/cdn/shop/files/OUT_MAIN.png?v=1742515580&width=600",
      "Dissident": "https://www.unmatchedsupps.com/cdn/shop/files/DIS_MAIN.png?v=1742515520&width=600",
      "2Shred": "https://www.unmatchedsupps.com/cdn/shop/files/2S_MAIN.png?v=1742515410&width=600",
      "Intra": "https://www.unmatchedsupps.com/cdn/shop/files/INT_MAIN.png?v=1742515555&width=600",
      "Paraxanthine": "https://www.unmatchedsupps.com/cdn/shop/files/PARA_MAIN.png?v=1742515585&width=600",
      "Longevity Multi*": "https://www.unmatchedsupps.com/cdn/shop/files/LM_MAIN.png?v=1742515655&width=600",
      "Longevity Sleep": "https://www.unmatchedsupps.com/cdn/shop/files/LS_MAIN.png?v=1742515660&width=600",
      "Longevity Test": "https://www.unmatchedsupps.com/cdn/shop/files/LT_MAIN.png?v=1742515665&width=600",
      "Collagen Peptide-6": "https://www.unmatchedsupps.com/cdn/shop/files/COL_MAIN.png?v=1742515505&width=600",
      "Glutamine": "https://www.unmatchedsupps.com/cdn/shop/files/GLUT_MAIN.png?v=1742515550&width=600",
      "Cognishot (Cherry Limeade)": "https://www.unmatchedsupps.com/cdn/shop/files/COG_MAIN.png?v=1742515500&width=600",
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

    const USD_TO_INR = 83;

    const products = [
      {
        name: "CreGAAtine",
        brand: "Unmatched Supps",
        category: "Creatine",
        description: "CreGAAtine® is a unique combination of creatine monohydrate and its precursor, GAA. This blend has been shown to boost creatine levels in the muscle while also efficiently crossing the blood brain barrier for enhanced cognitive function.",
        price: Math.round(34.99 * USD_TO_INR),
        sku: "UMS-CGA-180G",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/CGA_MAIN.png?v=1742515493&width=600",
        tags: ["creatine", "strength", "cognitive", "muscle"],
        servings: "40 servings",
        weight: "180g",
        featured: true,
        stockQuantity: 200,
      },
      {
        name: "Isolate",
        brand: "Unmatched Supps",
        category: "Protein",
        description: "100% Grass-Fed Whey Protein Isolate. 24g protein, 0.5g fat, 1g sugar per serving with digestive enzymes for optimal absorption.",
        price: Math.round(59.99 * USD_TO_INR),
        sku: "UMS-ISO-2LB",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/ISO_MAIN.png?v=1742515555&width=600",
        tags: ["whey", "protein", "isolate", "grass-fed"],
        servings: "30 servings",
        weight: "2 lbs",
        featured: true,
        stockQuantity: 150,
      },
      {
        name: "ElectraShred",
        brand: "Unmatched Supps",
        category: "Hydration",
        description: "Advanced hydration formula with comprehensive electrolyte profile. Non-stimulant formula that increases metabolism, improves body composition, and stabilizes blood sugar levels.",
        price: Math.round(44.99 * USD_TO_INR),
        sku: "UMS-ESH-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/ES_PL_FRONT.png?v=1777929793&width=600",
        tags: ["hydration", "electrolyte", "metabolism", "non-stimulant"],
        servings: "30 servings",
        weight: "471g",
        featured: true,
        stockQuantity: 180,
      },
      {
        name: "Longevity EAA",
        brand: "Unmatched Supps",
        category: "Aminos",
        description: "Complete essential amino acid formula with all 9 EAAs for muscle protein synthesis, recovery, and longevity support.",
        price: Math.round(44.99 * USD_TO_INR),
        sku: "UMS-LEAA-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/L_EAA_MAIN.png?v=1742515620&width=600",
        tags: ["eaa", "amino acids", "recovery", "longevity"],
        servings: "30 servings",
        weight: "300g",
        featured: true,
        stockQuantity: 120,
      },
      {
        name: "BH2K",
        brand: "Unmatched Supps",
        category: "Performance",
        description: "Patented BHβK™ (Beta-Hydroxy-Beta-Methylbutyrate Ketone Ester) for enhanced performance, recovery, and body composition.",
        price: Math.round(59.99 * USD_TO_INR),
        sku: "UMS-BH2K-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/BH2K_MAIN.png?v=1742515443&width=600",
        tags: ["performance", "recovery", "body composition"],
        servings: "30 servings",
        weight: "150g",
        featured: false,
        stockQuantity: 90,
      },
      {
        name: "Dileucine",
        brand: "Unmatched Supps",
        category: "Aminos",
        description: "Next-generation leucine innovation. Dileucine is a patented dipeptide that provides superior muscle protein synthesis compared to standard leucine.",
        price: Math.round(59.99 * USD_TO_INR),
        sku: "UMS-DIL-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/DIL_MAIN.png?v=1742515525&width=600",
        tags: ["leucine", "amino acids", "muscle building", "recovery"],
        servings: "30 servings",
        weight: "120g",
        featured: false,
        stockQuantity: 100,
      },
      {
        name: "Peptisize",
        brand: "Unmatched Supps",
        category: "Muscle Building",
        description: "Muscle-building formula combining myHMB, PeptiStrong, and CreGAAtine to maximize growth, performance, and recovery from every workout.",
        price: Math.round(64.99 * USD_TO_INR),
        sku: "UMS-PS-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/PS_MAIN.png?v=1742515585&width=600",
        tags: ["muscle building", "growth", "performance", "hmb"],
        servings: "30 servings",
        weight: "222g",
        featured: true,
        stockQuantity: 75,
      },
      {
        name: "Stem Cell",
        brand: "Unmatched Supps",
        category: "Longevity",
        description: "Next-generation longevity formula with 500mg Cyanthox™, 250mg Maritech®, 100mg Senactiv®, and 500mg Cordyceps for cellular function and recovery.",
        price: Math.round(119.99 * USD_TO_INR),
        sku: "UMS-SC-60S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/SC_MAIN.png?v=1742515710&width=600",
        tags: ["longevity", "cellular", "stem cell", "recovery"],
        servings: "60 capsules",
        weight: "227g",
        featured: true,
        stockQuantity: 60,
      },
      {
        name: "Longevity Greens+",
        brand: "Unmatched Supps",
        category: "Immunity & Wellness",
        description: "Organic superfood greens blend with 150mg organic greens, 1500mg organic reds, 500mg mushroom complex, and 10 billion CFU probiotics.",
        price: Math.round(89.99 * USD_TO_INR),
        sku: "UMS-LG-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/LG_MAIN.png?v=1742515655&width=600",
        tags: ["greens", "superfood", "immunity", "probiotics"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 80,
      },
      {
        name: "Outlier",
        brand: "Unmatched Supps",
        category: "Pre-Workout",
        description: "Clean pre-workout formula with natural caffeine, L-theanine, and nootropic ingredients for sustained energy and focus without the crash.",
        price: Math.round(34.99 * USD_TO_INR),
        sku: "UMS-OUT-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/OUT_MAIN.png?v=1742515580&width=600",
        tags: ["pre-workout", "energy", "focus", "nootropic"],
        servings: "30 servings",
        weight: "150g",
        featured: false,
        stockQuantity: 110,
      },
      {
        name: "Dissident",
        brand: "Unmatched Supps",
        category: "Pre-Workout",
        description: "High-performance pre-workout with clinical doses of citrulline, beta-alanine, and natural caffeine for explosive workouts.",
        price: Math.round(49.99 * USD_TO_INR),
        sku: "UMS-DIS-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/DIS_MAIN.png?v=1742515520&width=600",
        tags: ["pre-workout", "strength", "pump", "energy"],
        servings: "30 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 95,
      },
      {
        name: "2Shred",
        brand: "Unmatched Supps",
        category: "Weight Management",
        description: "Premium fat burner with natural thermogenic ingredients to boost metabolism, suppress appetite, and support healthy weight management.",
        price: Math.round(119.99 * USD_TO_INR),
        sku: "UMS-2SH-30D",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/2S_MAIN.png?v=1742515410&width=600",
        tags: ["fat burner", "thermogenic", "weight loss", "metabolism"],
        servings: "30 day supply",
        weight: "200g",
        featured: false,
        stockQuantity: 65,
      },
      {
        name: "Intra",
        brand: "Unmatched Supps",
        category: "Intra-Workout",
        description: "Intra-workout formula with BCAAs, EAAs, and electrolytes to fuel performance during training and accelerate recovery.",
        price: Math.round(59.99 * USD_TO_INR),
        sku: "UMS-INT-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/INT_MAIN.png?v=1742515555&width=600",
        tags: ["intra-workout", "bcaa", "hydration", "endurance"],
        servings: "30 servings",
        weight: "400g",
        featured: false,
        stockQuantity: 85,
      },
      {
        name: "Paraxanthine",
        brand: "Unmatched Supps",
        category: "Pre-Workout",
        description: "Pure paraxanthine for clean, sustained energy and enhanced focus without the jittery side effects of caffeine.",
        price: Math.round(34.99 * USD_TO_INR),
        sku: "UMS-PARA-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/PARA_MAIN.png?v=1742515585&width=600",
        tags: ["paraxanthine", "energy", "focus", "nootropic"],
        servings: "30 servings",
        weight: "60g",
        featured: false,
        stockQuantity: 70,
      },
      {
        name: "Longevity Multi*",
        brand: "Unmatched Supps",
        category: "Vitamins & Minerals",
        description: "Comprehensive multi-vitamin with 24 essential vitamins and minerals, methylated B-vitamins, and bioavailable forms for optimal absorption.",
        price: Math.round(99.99 * USD_TO_INR),
        sku: "UMS-LM-60S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/LM_MAIN.png?v=1742515655&width=600",
        tags: ["multivitamin", "minerals", "longevity", "health"],
        servings: "60 capsules",
        weight: "120g",
        featured: false,
        stockQuantity: 140,
      },
      {
        name: "Longevity Sleep",
        brand: "Unmatched Supps",
        category: "Recovery",
        description: "Advanced sleep formula with melatonin, magnesium, L-theanine, and apigenin for deep, restorative sleep and recovery.",
        price: Math.round(49.99 * USD_TO_INR),
        sku: "UMS-LS-60S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/LS_MAIN.png?v=1742515660&width=600",
        tags: ["sleep", "recovery", "melatonin", "magnesium"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 100,
      },
      {
        name: "Longevity Test",
        brand: "Unmatched Supps",
        category: "Performance",
        description: "Natural testosterone support with Tongkat Ali, Fadogia Agrestis, and Ashwagandha for hormonal optimization and vitality.",
        price: Math.round(89.99 * USD_TO_INR),
        sku: "UMS-LT-60S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/LT_MAIN.png?v=1742515665&width=600",
        tags: ["testosterone", "hormones", "vitality", "performance"],
        servings: "60 capsules",
        weight: "100g",
        featured: false,
        stockQuantity: 55,
      },
      {
        name: "Collagen Peptide-6",
        brand: "Unmatched Supps",
        category: "Recovery",
        description: "Multi-type collagen peptides (Types I, II, III, V, X) for joint health, skin elasticity, gut health, and recovery.",
        price: Math.round(54.99 * USD_TO_INR),
        sku: "UMS-CP6-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/COL_MAIN.png?v=1742515505&width=600",
        tags: ["collagen", "joints", "skin", "gut health"],
        servings: "30 servings",
        weight: "250g",
        featured: false,
        stockQuantity: 90,
      },
      {
        name: "Glutamine",
        brand: "Unmatched Supps",
        category: "Recovery",
        description: "L-Glutamine powder for immune function, gut health, and post-workout muscle recovery.",
        price: Math.round(19.99 * USD_TO_INR),
        sku: "UMS-GLUT-60S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/GLUT_MAIN.png?v=1742515550&width=600",
        tags: ["glutamine", "recovery", "immune", "gut health"],
        servings: "60 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 130,
      },
      {
        name: "Cognishot",
        brand: "Unmatched Supps",
        category: "Longevity",
        description: "Cherry Limeade flavored cognitive enhancement formula with nootropic ingredients for focus, memory, and brain health.",
        price: Math.round(64.99 * USD_TO_INR),
        sku: "UMS-COG-30S",
        inStock: true,
        imageUrl: "https://www.unmatchedsupps.com/cdn/shop/files/COG_MAIN.png?v=1742515500&width=600",
        tags: ["nootropic", "cognitive", "focus", "brain health"],
        servings: "30 servings",
        weight: "180g",
        featured: false,
        stockQuantity: 70,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});
