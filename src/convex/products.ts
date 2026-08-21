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
    compareAtPrice: v.optional(v.number()),
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
    // Clear old products and re-seed fresh data
    const existing = await ctx.db.query("products").collect();
    for (const p of existing) {
      await ctx.db.delete(p._id);
    }

    const products = [
      // ═══════════════════════════════════════════
      // WHEY PROTEIN
      // ═══════════════════════════════════════════
      {
        name: "Muscletech Nitrotech Performance Series 4 Lbs Chocolate",
        brand: "Muscletech",
        category: "Whey Protein",
        description: "Premium whey protein with 30g protein, 6.8g BCAAs, and 3g creatine per serving for lean muscle building and strength gains. Milk Chocolate flavor.",
        price: 7999,
        compareAtPrice: 12999,
        sku: "MT-NT-4LB-CHOC",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71Cp2-51wxL._AC_SX679.jpg?v=1721901541",
        tags: ["whey", "protein", "muscle building", "creatine"],
        servings: "40 servings",
        weight: "4 lbs",
        featured: true,
        stockQuantity: 15,
      },
      {
        name: "Dymitize Elite Whey 100% Protein Powder 5 LBS Rich Chocolate",
        brand: "Dymatize",
        category: "Whey Protein",
        description: "100% whey protein with 25g protein per serving, rich chocolate flavor. Fast-absorbing formula for muscle growth and recovery.",
        price: 11600,
        compareAtPrice: 13499,
        sku: "DYM-EW-5LB-CHOC",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500.jpg?v=1721899129",
        tags: ["whey", "protein", "muscle building"],
        servings: "68 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 10,
      },
      {
        name: "Hawk Labz Wat A Whey 4 Lbs",
        brand: "Hawk Labz",
        category: "Whey Protein",
        description: "Premium whey protein blend with 25g protein per serving for muscle growth and recovery. Great taste and easy mixing formula.",
        price: 6199,
        compareAtPrice: 7699,
        sku: "HL-WAW-4LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81_Hght1C-L._AC_SL1500.jpg?v=1721899130",
        tags: ["whey", "protein", "muscle building"],
        servings: "50 servings",
        weight: "4 lbs",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Transformers Protron Protein Blend",
        brand: "Transformers",
        category: "Whey Protein",
        description: "Premium protein blend with multiple protein sources for sustained amino acid delivery. Free prize inside each pack.",
        price: 6499,
        compareAtPrice: 9999,
        sku: "TF-PROTRON",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/transformers-energon-mixed-berry-kiwi_1800x1800_aff437c8-884d-4807-adb4-9472d2091514.jpg?v=1728237898",
        tags: ["whey", "protein", "blend", "muscle building"],
        servings: "30 servings",
        weight: "4 lbs",
        featured: false,
        stockQuantity: 12,
      },

      // ═══════════════════════════════════════════
      // ISOLATE PROTEIN
      // ═══════════════════════════════════════════
      {
        name: "Muscle & Strength India Perfect Whey Isolate",
        brand: "Muscle & Strength India",
        category: "Isolate Protein",
        description: "100% whey protein isolate with 27g protein per serving, zero sugar, and low fat. Designed for lean muscle growth.",
        price: 3999,
        compareAtPrice: 4999,
        sku: "MSI-WPI-5LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p_1564690e-4b1d-4f82-861e-0a6197e244f4.png?v=1782149086",
        tags: ["whey", "protein", "isolate"],
        servings: "40 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Unmatched Isolate Grass-Fed Whey Protein",
        brand: "Unmatched Supp",
        category: "Isolate Protein",
        description: "Grass-fed whey protein isolate for clean muscle building. Premium quality with no artificial fillers.",
        price: 6499,
        compareAtPrice: 9999,
        sku: "UN-ISOLATE-5LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/CREGAATINEFRONT.webp?v=1756534350",
        tags: ["whey", "protein", "isolate", "grass-fed"],
        servings: "30 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 15,
      },
      {
        name: "DY Nutrition Whey Protein Shadowhey Isolate 2Kg",
        brand: "DY Nutrition",
        category: "Isolate Protein",
        description: "Extremely high quality whey protein isolate, providing 84% protein content. 66 servings for sustained muscle building.",
        price: 8999,
        compareAtPrice: 15999,
        sku: "DYN-SHI-2KG",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/716sQhaYPWL.jpg?v=1742351491",
        tags: ["whey", "protein", "isolate"],
        servings: "66 servings",
        weight: "2 kg",
        featured: false,
        stockQuantity: 8,
      },
      {
        name: "Transparent Labs Grass-Fed Whey Protein Isolate",
        brand: "Transparent Labs",
        category: "Isolate Protein",
        description: "Grass-fed whey protein isolate with 28g protein per serving, no artificial sweeteners, food dyes, or fillers. 19+ flavors available.",
        price: 7499,
        compareAtPrice: 10999,
        sku: "TL-WPI-5LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394",
        tags: ["whey", "protein", "isolate", "grass-fed"],
        servings: "30 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 12,
      },

      // ═══════════════════════════════════════════
      // HYDROLYSED PROTEIN
      // ═══════════════════════════════════════════
      {
        name: "Dymatize ISO 100 Hydrolyzed 5LBS Gourmet Chocolate",
        brand: "Dymatize",
        category: "Hydrolysed Protein",
        description: "100% hydrolyzed whey protein isolate with 25g protein, 5.5g BCAAs, 0g sugar. Fast absorbing, easy digesting. The gold standard of protein.",
        price: 16999,
        compareAtPrice: 22999,
        sku: "DYM-ISO100-5LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/714JYoHrBNL._AC_SL1500.jpg?v=1721901569",
        tags: ["whey", "protein", "isolate", "hydrolyzed"],
        servings: "40 servings",
        weight: "5 lbs",
        featured: true,
        stockQuantity: 6,
      },

      // ═══════════════════════════════════════════
      // BCAA / EAA
      // ═══════════════════════════════════════════
      {
        name: "Muscle & Strength India Perfect EAA + BCAA",
        brand: "Muscle & Strength India",
        category: "BCAA / EAA",
        description: "Premium EAA + BCAA blend for muscle recovery and hydration during workouts. Complete amino acid profile. 30 servings.",
        price: 1299,
        compareAtPrice: 1999,
        sku: "MSI-EAA-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p_6f9b2bec-4d0c-43b3-ba3b-b61b4a193d8c.png?v=1782149124",
        tags: ["eaa", "bcaa", "amino acids", "recovery"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 40,
      },
      {
        name: "InnovaPharm RECOVER-EAA",
        brand: "InnovaPharm",
        category: "BCAA / EAA",
        description: "Complete essential amino acid formula for muscle recovery, hydration, and endurance during and after training sessions.",
        price: 6099,
        compareAtPrice: 6999,
        sku: "IP-RE-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81DFtRBkjcL._AC_SL1500.jpg?v=1721899130",
        tags: ["eaa", "recovery", "amino acids", "hydration"],
        servings: "30 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Hawk Labz Brutal EAA 30 Servings",
        brand: "Hawk Labz",
        category: "BCAA / EAA",
        description: "Complete EAA formula with all 9 essential amino acids for muscle protein synthesis, recovery, and sustained performance.",
        price: 2199,
        compareAtPrice: 2999,
        sku: "HL-BEAA-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71t0ibo_kEL._AC_SL1500.jpg?v=1721899130",
        tags: ["eaa", "amino acids", "recovery", "muscle"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 35,
      },
      {
        name: "Condemned Labz Confined EAA + BCAA 30 Servings",
        brand: "Condemned Labz",
        category: "BCAA / EAA",
        description: "High-performance EAA + BCAA formula for intense training sessions. Supports recovery and muscle growth.",
        price: 2899,
        compareAtPrice: 3499,
        sku: "CL-CEAA-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81Xz1zHFHAL._AC_SL1500.jpg?v=1721899130",
        tags: ["eaa", "bcaa", "amino acids", "recovery"],
        servings: "30 servings",
        weight: "320g",
        featured: false,
        stockQuantity: 18,
      },

      // ═══════════════════════════════════════════
      // PRE-WORKOUT
      // ═══════════════════════════════════════════
      {
        name: "Hawk Labz Crusher Pre Workout 30 Servings",
        brand: "Hawk Labz",
        category: "Pre-Workout",
        description: "High-energy pre-workout for extreme energy, focus, and pumps. Built for serious athletes.",
        price: 2199,
        compareAtPrice: 2999,
        sku: "HL-CRUSH-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71UBJB5YnWL._AC_SL1500.jpg?v=1721899130",
        tags: ["pre-workout", "energy", "pumps", "focus"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Killer Labz Stim Reaper Black High Stimulant Pre-Workout 30 Servings",
        brand: "Killer Labz",
        category: "Pre-Workout",
        description: "High stimulant pre-workout with extreme energy, focus, and long-lasting euphoria. Built for experienced stimulant users.",
        price: 2599,
        compareAtPrice: 3499,
        sku: "KL-SR-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81dVpMvgXLL._AC_SL1500.jpg?v=1721899130",
        tags: ["pre-workout", "high stimulant", "energy", "focus"],
        servings: "30 servings",
        weight: "250g",
        featured: true,
        stockQuantity: 25,
      },
      {
        name: "Blackstone Labs Dust Reloaded Pre-Workout 25 Servings",
        brand: "Blackstone Labs",
        category: "Pre-Workout",
        description: "High-performance pre-workout with clinical doses of citrulline, beta-alanine, and natural caffeine for explosive energy and pumps.",
        price: 2799,
        compareAtPrice: 4999,
        sku: "BSL-DR-25S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/DUSTRL2-SPFullSizeRender.jpg?v=1734516937",
        tags: ["pre-workout", "energy", "pumps"],
        servings: "25 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Vmi Sports KXR® Sport",
        brand: "VMI Sports",
        category: "Pre-Workout",
        description: "Advanced pre-workout formula with clinical doses for energy, focus, and muscle pumps. Built for serious athletes.",
        price: 2999,
        compareAtPrice: 3999,
        sku: "VMI-KXR-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500_abbdccfe-50dc-4cef-be9e-4873e88c6da5.jpg?v=1721901600",
        tags: ["pre-workout", "performance", "energy"],
        servings: "30 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 15,
      },
      {
        name: "Chemical Warfare The Reaper Pre-Workout Energy 30 Servings",
        brand: "Chemical Warfare",
        category: "Pre-Workout",
        description: "High-energy pre-workout formula with caffeine, beta-alanine, and citrulline for intense training sessions and maximum pumps.",
        price: 2399,
        compareAtPrice: 3499,
        sku: "CW-TR-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81Xz1zHFHAL._AC_SL1500.jpg?v=1721899130",
        tags: ["pre-workout", "energy", "focus"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 22,
      },
      {
        name: "Merica Labz Red, White & Boom 20 Servings",
        brand: "Merica Labz",
        category: "Pre-Workout",
        description: "Classic pre-workout with 3DPUMP Breakthrough® (fermented L-citrulline, glycerol, amla extract), beta-alanine, and caffeine for pumps and performance.",
        price: 4999,
        compareAtPrice: 6999,
        sku: "ML-RWB-20S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/Trump.webp?v=1741765777",
        tags: ["pre-workout", "pumps", "caffeine", "performance"],
        servings: "20 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 18,
      },
      {
        name: "Ultimate Nutrition Pre Gold Pre-Workout 30 Servings",
        brand: "Ultimate Nutrition",
        category: "Pre-Workout",
        description: "Pre-workout with 3g L-Citrulline for nitric oxide production, caffeine for energy, and beta-alanine for endurance. Blue Raspberry & Cherry Limeade.",
        price: 2699,
        compareAtPrice: 4499,
        sku: "UN-PRG-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/37065_PreGold250gBR-940x1018_f3f3e8a9-f531-4b93-8198-8cebbd417714-242641.webp?v=1754983358",
        tags: ["pre-workout", "energy", "pumps", "nitric oxide"],
        servings: "30 servings",
        weight: "250g",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Transformers® Allspark",
        brand: "Transformers",
        category: "Pre-Workout",
        description: "Premium pre-workout formula with Enfinity® Paraxanthine for euphoric energy and focus. Free prize inside.",
        price: 5999,
        compareAtPrice: 8999,
        sku: "TF-ALLSPARK",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/transformers-energon-mixed-berry-kiwi_1800x1800_aff437c8-884d-4807-adb4-9472d2091514.jpg?v=1728237898",
        tags: ["pre-workout", "energy", "focus", "paraxanthine"],
        servings: "20 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 10,
      },
      {
        name: "InnovaPharm GENESIS-1",
        brand: "InnovaPharm",
        category: "Pre-Workout",
        description: "Advanced pre-workout with premium patented ingredients for extreme energy, focus, and performance enhancement.",
        price: 5499,
        compareAtPrice: 7999,
        sku: "IP-GEN1-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81DFtRBkjcL._AC_SL1500.jpg?v=1721899130",
        tags: ["pre-workout", "energy", "focus", "performance"],
        servings: "30 servings",
        weight: "400g",
        featured: false,
        stockQuantity: 12,
      },
      {
        name: "JNX Sports The Curse! Pre Workout Powder",
        brand: "JNX Sports",
        category: "Pre-Workout",
        description: "Popular pre-workout powder for energy, focus, and muscle pumps. Available in multiple sizes.",
        price: 1799,
        compareAtPrice: 2999,
        sku: "JNX-CURSE",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/61WvVg4khnL._AC_SL1000.jpg?v=1741157432",
        tags: ["pre-workout", "energy", "pumps"],
        servings: "25 servings",
        weight: "227g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "DY Blood & Guts Pre-Workout 380g",
        brand: "DY Nutrition",
        category: "Pre-Workout",
        description: "Dorian Yates approved pre-workout with 350mg caffeine, 6000mg citrulline malate, 5500mg beta-alanine, and 4000mg arginine AKG.",
        price: 3299,
        compareAtPrice: 3999,
        sku: "DYN-BG-380G",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500.jpg?v=1721899129",
        tags: ["pre-workout", "energy", "pumps", "high caffeine"],
        servings: "30 servings",
        weight: "380g",
        featured: true,
        stockQuantity: 35,
      },
      {
        name: "Bull Nutrition 12 Strong Pre 30 Servings",
        brand: "Bull Nutrition",
        category: "Pre-Workout",
        description: "Clinically dosed pre-workout with 300mg caffeine, 6g citrulline, 10g glycerol for deep pumps, and 3.2g beta-alanine. No fillers, no crash.",
        price: 4999,
        compareAtPrice: 6999,
        sku: "BN-12S-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p.png?v=1782149032",
        tags: ["pre-workout", "energy", "pumps", "clinically dosed"],
        servings: "30 servings",
        weight: "400g",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Merica Labz Napalm Thermogenic Pre-Workout 20 Servings",
        brand: "Merica Labz",
        category: "Pre-Workout",
        description: "Thermogenic pre-workout with 3 patented ingredients: Cocoabuterol®, MitoBurn™, and ProGBB™. 350mg caffeine, nootropics, extreme pumps.",
        price: 4999,
        compareAtPrice: 6999,
        sku: "ML-NAP-20S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/tango-foxtrot.webp?v=1741765326",
        tags: ["pre-workout", "thermogenic", "fat loss", "caffeine"],
        servings: "20 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 15,
      },
      {
        name: "Unmatched Paraxanthine with L-Tyrosine 60 Servings",
        brand: "Unmatched Supp",
        category: "Pre-Workout",
        description: "Enfinity® Paraxanthine with fermented L-Tyrosine for clean energy and mental focus. Primary metabolite of caffeine.",
        price: 1999,
        compareAtPrice: 2999,
        sku: "UN-PARA-60S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/Paraxanthine_1_d8e27397-097e-4986-8053-74cea8e806c6.webp?v=1747725497",
        tags: ["pre-workout", "energy", "focus", "paraxanthine"],
        servings: "60 servings",
        weight: "150g",
        featured: false,
        stockQuantity: 40,
      },

      // ═══════════════════════════════════════════
      // POST-WORKOUT / RECOVERY
      // ═══════════════════════════════════════════
      {
        name: "JNX Sports The Jinx Hydra BCAA+ Post Workout Recovery Drink 30 Servings",
        brand: "JNX Sports",
        category: "Post-Workout",
        description: "Post-workout recovery drink with BCAAs, electrolytes, and hydration support for muscle repair and growth.",
        price: 1499,
        compareAtPrice: 3499,
        sku: "JNX-HYDRA-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/61WvVg4khnL._AC_SL1000.jpg?v=1741157432",
        tags: ["post-workout", "recovery", "bcaa", "hydration"],
        servings: "30 servings",
        weight: "360g",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Ultimate Nutrition Post Gold Post-Workout 30 Servings",
        brand: "Ultimate Nutrition",
        category: "Post-Workout",
        description: "Post-workout formula with BCAA, beta-alanine, betaine, GABA, and glutamine for muscle recovery and growth stimulation.",
        price: 2999,
        compareAtPrice: 4999,
        sku: "UN-PG-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/37078_PostGold387gChLime-940x1018_72a71d36-0a0e-45ab-92b6-be261640bc5d-850926.webp?v=1755160616",
        tags: ["post-workout", "recovery", "bcaa", "glutamine"],
        servings: "30 servings",
        weight: "387g",
        featured: false,
        stockQuantity: 18,
      },

      // ═══════════════════════════════════════════
      // GAINER
      // ═══════════════════════════════════════════
      {
        name: "Muscle & Strength India Perfect Gain",
        brand: "Muscle & Strength India",
        category: "Gainer",
        description: "High-calorie mass gainer with premium protein blend for serious size gains and weight management.",
        price: 2799,
        compareAtPrice: 3999,
        sku: "MSI-GAIN-5LB",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/p_eb20e6d8-cf13-4236-bb29-aec1ea815c4c.png?v=1782149102",
        tags: ["mass gainer", "calories", "bulking"],
        servings: "16 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 20,
      },

      // ═══════════════════════════════════════════
      // FAT BURNER
      // ═══════════════════════════════════════════
      {
        name: "Jacked Factory Burn-XT™ Clinically Studied Thermogenic Fat Burner",
        brand: "Jacked Factory",
        category: "Fat Burner",
        description: "Clinically studied thermogenic fat burner with green tea extract and caffeine. #1 best-seller on Amazon for 3+ years. 60 capsules.",
        price: 1999,
        compareAtPrice: 2999,
        sku: "JF-BXT-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71v_lBWlsGL._SL1500.jpg?v=1736581275",
        tags: ["fat burner", "thermogenic", "metabolism"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Panda Cuts Extreme Thermogenic Burner 60 Caps",
        brand: "Panda Supps",
        category: "Fat Burner",
        description: "Advanced multistage fat burner to boost metabolism, curb appetite, and provide superior focus and energy without the crash.",
        price: 3299,
        compareAtPrice: 4999,
        sku: "PS-CUTS-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/CUTS-2025.webp?v=1772177199",
        tags: ["fat burner", "thermogenic", "metabolism", "energy"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 15,
      },

      // ═══════════════════════════════════════════
      // SUPERFOOD / GREENS
      // ═══════════════════════════════════════════
      {
        name: "Jacked Factory Green Surge Superfood Powder 30 Servings",
        brand: "Jacked Factory",
        category: "Greens",
        description: "Packed with essential organic greens, micronutrients, probiotics, and digestive enzymes to optimize your nutrition. Keto friendly.",
        price: 2699,
        compareAtPrice: 3999,
        sku: "JF-GS-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71OUim4SgXL._AC_SL1500.jpg?v=1754552784",
        tags: ["greens", "superfood", "probiotics", "digestive enzymes"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Transparent Labs Prebiotic Greens 30 Servings",
        brand: "Transparent Labs",
        category: "Greens",
        description: "Clinically-dosed, fiber-packed greens powder with spirulina, chlorella, organic acacia fiber, green banana flour, and Jerusalem artichoke.",
        price: 4299,
        compareAtPrice: 5999,
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
        name: "Glaxon Super Greens Performance Formula",
        brand: "Glaxon",
        category: "Greens",
        description: "SuperGreens with IMMUSE™ post-biotic and SuperShrooms™ organic mushrooms for immunity, mental focus, and athletic performance.",
        price: 4999,
        compareAtPrice: 5499,
        sku: "GLX-SG",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/SUPERGREENS_BBACAI_FRONT_540x_d1cf631c-622c-45c9-b0bb-1bf361dc4a8b.png?v=1705739265",
        tags: ["greens", "superfood", "immunity", "performance"],
        servings: "30 servings",
        weight: "400g",
        featured: false,
        stockQuantity: 10,
      },

      // ═══════════════════════════════════════════
      // COLLAGEN
      // ═══════════════════════════════════════════
      {
        name: "Revive MD Collagen Powder",
        brand: "Revive MD",
        category: "Collagen",
        description: "Premium collagen powder for joint health, skin elasticity, gut health, and post-workout recovery support.",
        price: 4199,
        compareAtPrice: 4999,
        sku: "RMD-COLL",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71iVM2dZeHL._AC_SL1500.jpg?v=1721901584",
        tags: ["collagen", "recovery", "joints", "skin"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 15,
      },
      {
        name: "Allmax Collagen Peptides Powder + Vitamins 44 Servings",
        brand: "Allmax",
        category: "Collagen",
        description: "Collagen peptides with 10g collagen, 10,000mcg biotin, and 90mg vitamin C per serving. Supports joint & bone health, skin, hair & nail strength.",
        price: 3999,
        compareAtPrice: 5999,
        sku: "AM-CP-44S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/COLLAGEN-UNFL-main.jpg?v=1728731465",
        tags: ["collagen", "recovery", "vitamins", "joints"],
        servings: "44 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Glaxon Collagen - Connective Tissue Support",
        brand: "Glaxon",
        category: "Collagen",
        description: "Hydrolyzed Collagen Peptides with Milk Fat Globule Membrane for gut health. Includes Calcium, Biotin, Hyaluronic Acid, and Vitamin C with Astragin®.",
        price: 4999,
        compareAtPrice: 5499,
        sku: "GLX-COLL",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/Collagen_Naked_Front_540x_126d2553-9512-4051-85f9-92d03b44bed3.png?v=1705739259",
        tags: ["collagen", "gut health", "joints", "skin"],
        servings: "30 servings",
        weight: "400g",
        featured: false,
        stockQuantity: 8,
      },

      // ═══════════════════════════════════════════
      // GROWTH HORMONE SUPPORT
      // ═══════════════════════════════════════════
      {
        name: "Bucked Up Deer Antler Velvet Spray",
        brand: "Bucked Up",
        category: "Growth Hormone",
        description: "Deer antler velvet spray for natural growth hormone support, recovery, and athletic performance enhancement.",
        price: 3199,
        compareAtPrice: 3999,
        sku: "BU-DAV",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71iVM2dZeHL._AC_SL1500.jpg?v=1721901584",
        tags: ["growth hormone", "recovery", "performance"],
        servings: "60 servings",
        weight: "60ml",
        featured: false,
        stockQuantity: 10,
      },

      // ═══════════════════════════════════════════
      // TESTOSTERONE BOOSTER
      // ═══════════════════════════════════════════
      {
        name: "Merica Labz Liberty Ballz - Testosterone Support 180 Caps",
        brand: "Merica Labz",
        category: "Test Booster",
        description: "Natural testosterone support with Anacyclus pyrethrum extract (5:1), D-Aspartic Acid, and other research-backed ingredients.",
        price: 4999,
        compareAtPrice: 6999,
        sku: "ML-LB-180C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/LibertyBallz_1.webp?v=1740640014",
        tags: ["test booster", "testosterone", "strength", "vitality"],
        servings: "30 servings",
        weight: "200g",
        featured: false,
        stockQuantity: 15,
      },
      {
        name: "Transparent Labs LJ100 Tongkat Ali 60 Capsules",
        brand: "Transparent Labs",
        category: "Test Booster",
        description: "Patented LJ100® Eurycoma longifolia extract for natural testosterone support, enhanced vitality, and sexual wellness. 60 capsules.",
        price: 2599,
        compareAtPrice: 3999,
        sku: "TL-LJ100-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/TL_LJ100_60_1_1.webp?v=1778838190",
        tags: ["test booster", "tongkat ali", "testosterone", "vitality"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Blackstone Labs Apex Male Testosterone Booster 240 Count",
        brand: "Blackstone Labs",
        category: "Test Booster",
        description: "Natural testosterone booster with research-backed ingredients for muscle growth, strength, and male vitality.",
        price: 4799,
        compareAtPrice: 5999,
        sku: "BSL-AM-240C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/blackstone-labs-apex-male-APEX.jpg?v=1733730347",
        tags: ["test booster", "testosterone", "strength"],
        servings: "60 servings",
        weight: "180g",
        featured: false,
        stockQuantity: 10,
      },
      {
        name: "Ultimate Nutrition Bulgarian Tribulus 750mg 90 Caps",
        brand: "Ultimate Nutrition",
        category: "Test Booster",
        description: "Potent testosterone support supplement designed to increase strength, stamina, and sex drive - naturally. 90 capsules.",
        price: 1999,
        compareAtPrice: 2999,
        sku: "UN-TRIB-90C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/462_Tribulus750mg90Cap-940x1018-312222.webp?v=1755160002",
        tags: ["test booster", "testosterone", "tribulus", "strength"],
        servings: "90 capsules",
        weight: "120g",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Unmatched Longevity Test 30 Servings 180 Caps",
        brand: "Unmatched Supp",
        category: "Test Booster",
        description: "Comprehensive testosterone support for male vitality, strength, stamina, and metabolic health. 180 capsules.",
        price: 5499,
        compareAtPrice: 7999,
        sku: "UN-LTEST-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/LongevityTest.webp?v=1750053893",
        tags: ["test booster", "testosterone", "longevity", "vitality"],
        servings: "30 servings",
        weight: "200g",
        featured: false,
        stockQuantity: 12,
      },
      {
        name: "Muscle & Strength India Perfect X-Drive 100 Tablets",
        brand: "Muscle & Strength India",
        category: "Test Booster",
        description: "Testosterone support formula with key ingredients for male vitality, strength, and performance. 100 tablets.",
        price: 1999,
        compareAtPrice: 2999,
        sku: "MSI-XD-100T",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/prd_3596029-Muscle-Strength-Perfect-XDrive-100-tablets_o.webp?v=1754804728",
        tags: ["test booster", "testosterone", "strength", "performance"],
        servings: "50 servings",
        weight: "150g",
        featured: false,
        stockQuantity: 30,
      },

      // ═══════════════════════════════════════════
      // MULTIVITAMIN
      // ═══════════════════════════════════════════
      {
        name: "DY Nutrition Multivitamin Complex 60 Caps",
        brand: "DY Nutrition",
        category: "Multivitamin",
        description: "Complete multivitamin with 24 key vitamins and minerals, CoQ10, and Panax Ginseng adaptogens. 60 capsules for daily nutritional support.",
        price: 1699,
        compareAtPrice: 1999,
        sku: "DYN-MV-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71HJXhxSJVL._AC_SL1500.jpg?v=1721899130",
        tags: ["multivitamin", "vitamins", "minerals", "health"],
        servings: "30 servings",
        weight: "90g",
        featured: false,
        stockQuantity: 50,
      },
      {
        name: "Life Extension Advanced Milk Thistle 60 Softgels",
        brand: "Life Extension",
        category: "Multivitamin",
        description: "Concentrated milk thistle extracts delivered through advanced phospholipid-based system for enhanced bioavailability. Supports liver health.",
        price: 1999,
        compareAtPrice: 2999,
        sku: "LE-MT-60S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71BRaGeZipL._SX679.jpg?v=1772177772",
        tags: ["liver", "detox", "milk thistle", "health"],
        servings: "60 softgels",
        weight: "100g",
        featured: false,
        stockQuantity: 20,
      },

      // ═══════════════════════════════════════════
      // CREATINE
      // ═══════════════════════════════════════════
      {
        name: "Unmatched CreGAAtine Capsules 60 Servings",
        brand: "Unmatched Supp",
        category: "Creatine",
        description: "CreGAAtine combines creatine monohydrate with Guanidinoacetic Acid (GAA), clinically proven to increase muscle creatine levels by up to 16.9%.",
        price: 3299,
        compareAtPrice: 4999,
        sku: "UN-CGA-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/CREGAATINEFRONT.webp?v=1756534350",
        tags: ["creatine", "muscle building", "strength"],
        servings: "60 capsules",
        weight: "120g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Jacked Factory Creatine Monohydrate 30 Servings",
        brand: "Jacked Factory",
        category: "Creatine",
        description: "5,000mg unflavored pure creatine monohydrate per scoop. The gold standard for muscle growth, strength, and athletic performance.",
        price: 1599,
        compareAtPrice: 2499,
        sku: "JF-CREATINE-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/810uEQCVMRL._AC_SL1500.jpg?v=1742294499",
        tags: ["creatine", "muscle building", "strength", "performance"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 35,
      },

      // ═══════════════════════════════════════════
      // OMEGA & HEALTH
      // ═══════════════════════════════════════════
      {
        name: "Transparent Labs Krill Oil 60 Softgels",
        brand: "Transparent Labs",
        category: "Omega & Health",
        description: "Superba™ Antarctic krill oil with bioavailable EPA, DHA, and choline in phospholipid form. Supports heart, joint, cognitive, and eye health.",
        price: 2499,
        compareAtPrice: 3999,
        sku: "TL-KRILL-60S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/TL_KrillOil_60_1_0_1.webp?v=1778837544",
        tags: ["omega 3", "krill oil", "heart health", "joints"],
        servings: "60 softgels",
        weight: "120g",
        featured: false,
        stockQuantity: 40,
      },

      // ═══════════════════════════════════════════
      // NITRIC OXIDE
      // ═══════════════════════════════════════════
      {
        name: "Jacked Factory N.O. XT Nitric Oxide Supplement 90 Caps",
        brand: "Jacked Factory",
        category: "Nitric Oxide",
        description: "World's first scientifically-dosed nitric oxide booster with Nitrosigine, L-Arginine, and L-Citrulline. Enhances blood flow, pumps, and vascularity.",
        price: 4599,
        compareAtPrice: 5999,
        sku: "JF-NOXT-90C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/NOXT_90_2000x2000_1.webp?v=1742294135",
        tags: ["nitric oxide", "pumps", "vascularity", "pre-workout"],
        servings: "90 capsules",
        weight: "150g",
        featured: false,
        stockQuantity: 18,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});
