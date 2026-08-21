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
      // ── Transparent Labs ──
      {
        name: "Transparent Labs Whey Protein Isolate",
        brand: "Transparent Labs",
        category: "Protein",
        description: "Grass-fed whey protein isolate with 28g protein per serving, no artificial sweeteners, food dyes, or fillers. Available in 19+ flavors. Sourced from grass-fed cattle raised humanely without growth hormones.",
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
        description: "Clinically-dosed, fiber-packed greens powder with spirulina, chlorella, organic acacia fiber, green banana flour, and Jerusalem artichoke. Supports gut, metabolic, and immune health. 30 servings.",
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
        description: "Patented LJ100® Eurycoma longifolia extract for natural testosterone support, enhanced vitality, and sexual wellness. Standardized bioactive quassinoids. 60 capsules.",
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
        name: "Transparent Labs Krill Oil",
        brand: "Transparent Labs",
        category: "Omega & Health",
        description: "Superba™ Antarctic krill oil with bioavailable EPA, DHA, and choline in phospholipid form. Supports heart, joint, cognitive, and eye health. 50+ clinical studies. No fish burps.",
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

      // ── DY Nutrition ──
      {
        name: "DY Blood & Guts Pre-Workout",
        brand: "DY Nutrition",
        category: "Pre-Workout",
        description: "Dorian Yates approved pre-workout with 350mg caffeine, 6000mg citrulline malate, 5500mg beta-alanine, and 4000mg arginine AKG. Explosive energy, sustained pumps, muscular resistance.",
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
        category: "Vitamins",
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

      // ── Killer Labz ──
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

      // ── Blackstone Labs ──
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
        name: "Blackstone Labs Superstrol-7",
        brand: "Blackstone Labs",
        category: "Muscle Building",
        description: "Advanced muscle builder with proprietary blend for lean mass gains, strength enhancement, and recovery support. 60 tablets.",
        price: 4799,
        sku: "BSL-SS7-60T",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/blackstone-labs-superstrol7_2000x_80ef3c66-05d0-4c96-9b49-0f7cb5c8c537.png?v=1733732926",
        tags: ["muscle building", "anabolic", "strength"],
        servings: "60 tablets",
        weight: "100g",
        featured: false,
        stockQuantity: 15,
      },

      // ── Merica Labz ──
      {
        name: "Merica Labz Red White & Boom Napalm",
        brand: "Merica Labz",
        category: "Pre-Workout",
        description: "Thermogenic pre-workout with 3 patented ingredients: Cocoabuterol®, MitoBurn™, and ProGBB™. 350mg caffeine, nootropics, extreme pumps and thermogenesis.",
        price: 4999,
        sku: "ML-NAP-20S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/tango-foxtrot.webp?v=1741765326",
        tags: ["pre-workout", "thermogenic", "fat loss", "caffeine"],
        servings: "20 servings",
        weight: "350g",
        featured: true,
        stockQuantity: 0,
      },
      {
        name: "Merica Labz Red White & Boom",
        brand: "Merica Labz",
        category: "Pre-Workout",
        description: "Classic pre-workout with 3DPUMP Breakthrough® (fermented L-citrulline, glycerol, amla extract), beta-alanine, and caffeine for pumps and performance.",
        price: 4999,
        sku: "ML-RWB-20S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/Trump.webp?v=1741765777",
        tags: ["pre-workout", "pumps", "caffeine", "performance"],
        servings: "20 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Merica Labz F-Bomb Extreme Stim",
        brand: "Merica Labz",
        category: "Pre-Workout",
        description: "Extreme stimulant pre-workout for advanced users. Maximum caffeine, nootropics, and performance ingredients for the most intense training sessions.",
        price: 4999,
        sku: "ML-FB-20S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/fbomb-catscratchfever.webp?v=1741764542",
        tags: ["pre-workout", "high stimulant", "extreme energy"],
        servings: "20 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Merica Labz Z-Bomb Pre-Workout",
        brand: "Merica Labz",
        category: "Pre-Workout",
        description: "Zombie-themed pre-workout with powerful stimulants and nootropics for extreme energy, focus, and performance. 20 servings.",
        price: 4999,
        sku: "ML-ZB-20S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/bloodorange.webp?v=1741763782",
        tags: ["pre-workout", "energy", "focus", "stimulant"],
        servings: "20 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Merica Labz Liberty Ballz Test Booster",
        brand: "Merica Labz",
        category: "Test Booster",
        description: "Natural testosterone support with Anacyclus pyrethrum extract (5:1), D-Aspartic Acid, and other research-backed ingredients. 180 capsules.",
        price: 4999,
        sku: "ML-LB-180C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/LibertyBallz_1.webp?v=1740640014",
        tags: ["test booster", "testosterone", "strength", "vitality"],
        servings: "30 servings",
        weight: "200g",
        featured: false,
        stockQuantity: 15,
      },

      // ── Bull Nutrition ──
      {
        name: "Bull Nutrition 12 Strong Pre",
        brand: "Bull Nutrition",
        category: "Pre-Workout",
        description: "Clinically dosed pre-workout with 300mg caffeine, 6g citrulline, 10g glycerol for deep pumps, and 3.2g beta-alanine. No fillers, no crash. 4 flavors available.",
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

      // ── InnovaPharm ──
      {
        name: "InnovaPharm Recover-EAA",
        brand: "InnovaPharm",
        category: "Aminos",
        description: "Complete essential amino acid formula for muscle recovery, hydration, and endurance during and after training. Premium quality ingredients.",
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

      // ── Hawk Labz ──
      {
        name: "Hawk Labz Brutal EAA",
        brand: "Hawk Labz",
        category: "Aminos",
        description: "Complete EAA formula with all 9 essential amino acids for muscle protein synthesis, recovery, and sustained performance during training.",
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

      // ── Muscletech ──
      {
        name: "Muscletech Nitro-Tech 4 LBS",
        brand: "Muscletech",
        category: "Protein",
        description: "Premium whey protein with 30g protein, 6.8g BCAAs, and 3g creatine per serving for lean muscle building and strength gains. Milk Chocolate flavor.",
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

      // ── Dymatize ──
      {
        name: "Dymatize ISO 100 Hydrolyzed 5 LBS",
        brand: "Dymatize",
        category: "Protein",
        description: "100% hydrolyzed whey protein isolate with 25g protein, 5.5g BCAAs, 0g sugar. Fast absorbing, easy digesting. The gold standard of protein supplements.",
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

      // ── Allmax ──
      {
        name: "Allmax Isoflex Whey Isolate 5 LBS",
        brand: "Allmax",
        category: "Protein",
        description: "Premium whey protein isolate with 27g protein, 0g sugar, and cold-process micro-filtration for maximum purity and muscle recovery.",
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
        description: "Collagen peptides with 10g collagen, 10,000mcg biotin, and 90mg vitamin C per serving. Supports joint & bone health, skin, hair & nail strength.",
        price: 3999,
        sku: "AM-CP-44S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/COLLAGEN-UNFL-main.jpg?v=1728731465",
        tags: ["collagen", "recovery", "vitamins", "joints"],
        servings: "44 servings",
        weight: "350g",
        featured: false,
        stockQuantity: 70,
      },

      // ── Jacked Factory ──
      {
        name: "Jacked Factory Nitrosurge",
        brand: "Jacked Factory",
        category: "Pre-Workout",
        description: "Clean pre-workout with beta-alanine, caffeine, and NO boosters for energy, focus, and muscle pumps without the crash. 30 servings.",
        price: 2299,
        sku: "JF-NS-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71u7UXG-sBL._AC_SL1500.jpg?v=1736579214",
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
        description: "Clinically studied thermogenic fat burner with green tea extract and caffeine. #1 best-seller on Amazon for 3+ years. Supports metabolism and weight management.",
        price: 1999,
        sku: "JF-BXT-60C",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71v_lBWlsGL._SL1500.jpg?v=1736581275",
        tags: ["fat burner", "thermogenic", "metabolism"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Jacked Factory Creatine Monohydrate",
        brand: "Jacked Factory",
        category: "Creatine",
        description: "5,000mg unflavored pure creatine monohydrate per scoop. The gold standard for muscle growth, strength, and athletic performance. 30 servings.",
        price: 1599,
        sku: "JF-CREATINE-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/810uEQCVMRL._AC_SL1500.jpg?v=1742294499",
        tags: ["creatine", "muscle building", "strength", "performance"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Jacked Factory N.O. XT Nitric Oxide",
        brand: "Jacked Factory",
        category: "Pre-Workout",
        description: "World's first scientifically-dosed nitric oxide booster with Nitrosigine, L-Arginine, and L-Citrulline. Enhances blood flow, pumps, and vascularity.",
        price: 4599,
        sku: "JF-NOXT-90C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/NOXT_90_2000x2000_1.webp?v=1742294135",
        tags: ["nitric oxide", "pumps", "vascularity", "pre-workout"],
        servings: "90 capsules",
        weight: "150g",
        featured: false,
        stockQuantity: 20,
      },
      {
        name: "Jacked Factory Authentic Iso Whey",
        brand: "Jacked Factory",
        category: "Protein",
        description: "Clean, grass-fed whey protein isolate for rapid absorption and lean muscle support. No artificial fillers, easy to digest. 2 lb.",
        price: 5999,
        sku: "JF-AISO-2LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71tBbu9ojUL._AC_SL1500.jpg?v=1742025876",
        tags: ["whey", "protein", "isolate", "grass-fed"],
        servings: "30 servings",
        weight: "2 lbs",
        featured: false,
        stockQuantity: 0,
      },

      // ── Ultimate Nutrition ──
      {
        name: "Ultimate Nutrition Whey Gold 5 LBS",
        brand: "Ultimate Nutrition",
        category: "Protein",
        description: "Gold standard whey protein with 20g fast-acting protein per serving. Hydrolyzed whey protein isolate + concentrate blend for unparalleled absorption.",
        price: 6499,
        sku: "UN-WG-5LB",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/356_WheyGold2.27kgVan-940x1018_a8c36233-b754-439f-af1d-1c1b4aa69b46-887379.webp?v=1754984347",
        tags: ["whey", "protein", "muscle building"],
        servings: "68 servings",
        weight: "5 lbs",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "Ultimate Nutrition Post Gold",
        brand: "Ultimate Nutrition",
        category: "Post-Workout",
        description: "Post-workout formula with BCAA, beta-alanine, betaine, GABA, and glutamine for muscle recovery and growth stimulation. 30 servings.",
        price: 2999,
        sku: "UN-PG-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/37078_PostGold387gChLime-940x1018_72a71d36-0a0e-45ab-92b6-be261640bc5d-850926.webp?v=1755160616",
        tags: ["post-workout", "recovery", "bcaa", "glutamine"],
        servings: "30 servings",
        weight: "387g",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Ultimate Nutrition Pre Gold",
        brand: "Ultimate Nutrition",
        category: "Pre-Workout",
        description: "Pre-workout with 3g L-Citrulline for nitric oxide production, caffeine for energy, and beta-alanine for endurance. Blue Raspberry & Cherry Limeade.",
        price: 2699,
        sku: "UN-PRG-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/37065_PreGold250gBR-940x1018_f3f3e8a9-f531-4b93-8198-8cebbd417714-242641.webp?v=1754983358",
        tags: ["pre-workout", "energy", "pumps", "nitric oxide"],
        servings: "30 servings",
        weight: "250g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Ultimate Nutrition Intra Gold",
        brand: "Ultimate Nutrition",
        category: "Aminos",
        description: "Intra-workout formula for hydration, muscle protection, and mental focus. Push harder, last longer, and recover faster with powerful electrolytes.",
        price: 2999,
        sku: "UN-IG-30S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/37080_IntraGold360gApl-940x1018-758807.webp?v=1754982942",
        tags: ["intra-workout", "hydration", "amino acids", "bcaa"],
        servings: "30 servings",
        weight: "360g",
        featured: false,
        stockQuantity: 20,
      },

      // ── Unmatched Supps ──
      {
        name: "Unmatched CreGAAtine Capsules",
        brand: "Unmatched Supp",
        category: "Creatine",
        description: "CreGAAtine combines creatine monohydrate with Guanidinoacetic Acid (GAA), clinically proven to increase muscle creatine levels by up to 16.9% more than creatine alone.",
        price: 3299,
        sku: "UN-CGA-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/CREGAATINEFRONT.webp?v=1756534350",
        tags: ["creatine", "muscle building", "strength"],
        servings: "60 capsules",
        weight: "120g",
        featured: false,
        stockQuantity: 40,
      },
      {
        name: "Unmatched Paraxanthine",
        brand: "Unmatched Supp",
        category: "Pre-Workout",
        description: "Enfinity® Paraxanthine with fermented L-Tyrosine for clean energy and mental focus. Primary metabolite of caffeine with numerous benefits over standard caffeine. 60 servings.",
        price: 1999,
        sku: "UN-PARA-60S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/Paraxanthine_1_d8e27397-097e-4986-8053-74cea8e806c6.webp?v=1747725497",
        tags: ["pre-workout", "energy", "focus", "paraxanthine"],
        servings: "60 servings",
        weight: "150g",
        featured: false,
        stockQuantity: 50,
      },

      // ── Cellucor ──
      {
        name: "C4 Original Pre-Workout",
        brand: "Cellucor",
        category: "Pre-Workout",
        description: "#1 global pre-workout brand. 5th generation formula with explosive energy, focus, and pumps. Naturally & artificially flavored.",
        price: 3699,
        sku: "CC-C4-30S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/8_e64f4ace-b2cc-4847-b44d-881e5a7da482.jpg?v=1746175144",
        tags: ["pre-workout", "energy", "focus", "pumps"],
        servings: "30 servings",
        weight: "300g",
        featured: false,
        stockQuantity: 0,
      },

      // ── Other brands ──
      {
        name: "Life Extension Advanced Milk Thistle",
        brand: "Life Extension",
        category: "Liver Health",
        description: "Concentrated milk thistle extracts delivered through advanced phospholipid-based system for enhanced bioavailability. Supports liver health and detoxification.",
        price: 1999,
        sku: "LE-MT-60S",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71BRaGeZipL._SX679.jpg?v=1772177772",
        tags: ["liver", "detox", "milk thistle", "health"],
        servings: "60 softgels",
        weight: "100g",
        featured: false,
        stockQuantity: 30,
      },
      {
        name: "Panda Cuts Extreme Thermogenic Burner",
        brand: "Panda Supps",
        category: "Fat Burners",
        description: "Advanced multistage fat burner to boost metabolism, curb appetite, and provide superior focus and energy without the crash. No proprietary blend.",
        price: 3299,
        sku: "PS-CUTS-60C",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/CUTS-2025.webp?v=1772177199",
        tags: ["fat burner", "thermogenic", "metabolism", "energy"],
        servings: "60 capsules",
        weight: "90g",
        featured: false,
        stockQuantity: 25,
      },
      {
        name: "Ryse Stim Daddy Pre-Workout",
        brand: "Ryse Supp",
        category: "Pre-Workout",
        description: "Noel Deyzel's Signature Series. 21+ grams actives, 400mg caffeine. Extreme energy and focus for the most demanding training sessions. 40 servings.",
        price: 5999,
        sku: "RYSE-SD-40S",
        inStock: false,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71SjXTJnKAL._AC_SL1500.jpg?v=1732611854",
        tags: ["pre-workout", "high stimulant", "energy", "focus"],
        servings: "40 servings",
        weight: "450g",
        featured: false,
        stockQuantity: 0,
      },
      {
        name: "M&S India Perfect X-Drive",
        brand: "Muscle & Strength India",
        category: "Test Booster",
        description: "Testosterone support formula with key ingredients for male vitality, strength, and performance. 100 tablets.",
        price: 1999,
        sku: "MSI-XD-100T",
        inStock: true,
        imageUrl: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/prd_3596029-Muscle-Strength-Perfect-XDrive-100-tablets_o.webp?v=1754804728",
        tags: ["test booster", "testosterone", "strength", "performance"],
        servings: "50 servings",
        weight: "150g",
        featured: false,
        stockQuantity: 30,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});
