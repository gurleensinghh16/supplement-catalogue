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

export const createProduct = mutation({
  args: {
    name: v.string(),
    brand: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    sku: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    servings: v.optional(v.string()),
    weight: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    stockQuantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", {
      name: args.name,
      brand: args.brand,
      category: args.category,
      description: args.description || "",
      price: args.price,
      compareAtPrice: args.compareAtPrice,
      sku: args.sku || "",
      inStock: args.inStock ?? true,
      imageUrl: args.imageUrl,
      tags: args.tags || [],
      servings: args.servings,
      weight: args.weight,
      featured: args.featured ?? false,
      stockQuantity: args.stockQuantity ?? 0,
    });
    return id;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
    return "deleted";
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

// Bulk import - accepts array of products and inserts them all
// Used to import large catalogs from JSONL data
export const bulkImport = mutation({
  args: {
    products: v.array(
      v.object({
        name: v.string(),
        brand: v.string(),
        category: v.string(),
        description: v.string(),
        price: v.number(),
        compareAtPrice: v.optional(v.number()),
        sku: v.optional(v.string()),
        inStock: v.boolean(),
        imageUrl: v.optional(v.string()),
        tags: v.array(v.string()),
        servings: v.optional(v.string()),
        weight: v.optional(v.string()),
        featured: v.optional(v.boolean()),
        stockQuantity: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let imported = 0;
    let updated = 0;
    for (const product of args.products) {
      // Check if product already exists by name
      const existing = await ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("name"), product.name))
        .first();
      if (existing) {
        // Update existing product
        await ctx.db.patch(existing._id, {
          brand: product.brand,
          category: product.category,
          description: product.description || "",
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sku: product.sku || "",
          inStock: product.inStock,
          imageUrl: product.imageUrl || existing.imageUrl,
          tags: product.tags || [],
          servings: product.servings || existing.servings,
          weight: product.weight || existing.weight,
          featured: product.featured || false,
          stockQuantity: product.stockQuantity || 0,
        });
        updated++;
      } else {
        // Insert new product
        await ctx.db.insert("products", {
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description || "",
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sku: product.sku || "",
          inStock: product.inStock,
          imageUrl: product.imageUrl,
          tags: product.tags || [],
          servings: product.servings,
          weight: product.weight,
          featured: product.featured || false,
          stockQuantity: product.stockQuantity || 0,
        });
        imported++;
      }
    }
    return `imported ${imported} new, updated ${updated} existing`;
  },
});

// Update a single product image
export const updateImage = mutation({
  args: {
    productId: v.id("products"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, { imageUrl: args.imageUrl });
    return "updated";
  },
});

// Bulk update images
export const bulkUpdateImages = mutation({
  args: {
    updates: v.array(
      v.object({
        productId: v.id("products"),
        imageUrl: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const u of args.updates) {
      await ctx.db.patch(u.productId, { imageUrl: u.imageUrl });
      count++;
    }
    return `updated ${count} images`;
  },
});

// Clear all products (admin only)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    for (const p of products) {
      await ctx.db.delete(p._id);
    }
    return `deleted ${products.length} products`;
  },
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
      {
        name: "Killer Labz Stim Reaper Black Pre-Workout",
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
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});
