import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PRICE_COLUMN = "100475-The Diet Store-Price";

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  // Supports values such as 1299, "1299", "₹1,299", and "1,299.00".
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return response({ error: "Method not allowed." }, 405);
  }

  try {
    const body = await req.json();

    const couponCode = String(body.couponCode || "")
      .trim()
      .toUpperCase();

    const incomingItems = body.items;

    if (!couponCode) {
      return response({ error: "Please enter a coupon code." }, 400);
    }

    if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
      return response({ error: "Your cart is empty." }, 400);
    }

    // Merge duplicate product IDs and validate quantities.
    const quantityMap = new Map<string, number>();

    for (const item of incomingItems) {
      const productId = String(item.productId || "").trim();
      const quantity = Number(item.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return response({ error: "Invalid cart item or quantity." }, 400);
      }

      quantityMap.set(
        productId,
        (quantityMap.get(productId) || 0) + quantity,
      );
    }

    const items = Array.from(quantityMap.entries()).map(
      ([productId, quantity]) => ({ productId, quantity }),
    );

    for (const item of items) {
      if (item.quantity > 10) {
        return response({
          error: "Maximum quantity per product is 10.",
        }, 400);
      }
    }

    const productIds = items.map((item) => item.productId);

    // Always fetch prices from Supabase. Never trust prices sent by the browser.
    const { data: products, error: productsError } = await supabase
      .from("keep_products")
      .select(
        `productID, productName, "${PRICE_COLUMN}", in_stock, stock_quantity`,
      )
      .in("productID", productIds);

    if (productsError) {
      console.error("Product lookup error:", productsError);
      return response({ error: "Unable to validate your cart." }, 500);
    }

    if (!products || products.length !== productIds.length) {
      return response({
        error: "One or more products in your cart could not be found.",
      }, 400);
    }

    const productMap = new Map(
      products.map((product: any) => [String(product.productID), product]),
    );

    let subtotalPaise = 0;
    let totalUnits = 0;

    for (const item of items) {
      const product: any = productMap.get(item.productId);

      if (!product) {
        return response({ error: "A product in your cart was not found." }, 400);
      }

      if (product.in_stock === false) {
        return response({
          error: `${product.productName || "A product"} is out of stock.`,
        }, 400);
      }

      if (
        product.stock_quantity !== null &&
        product.stock_quantity !== undefined &&
        Number(product.stock_quantity) < item.quantity
      ) {
        return response({
          error: `Insufficient stock for ${product.productName || "a product"}.`,
        }, 400);
      }

      const price = parsePrice(product[PRICE_COLUMN]);

      if (price === null) {
        return response({
          error: `Price is unavailable for ${product.productName || "a product"}.`,
        }, 400);
      }

      subtotalPaise += Math.round(price * 100) * item.quantity;
      totalUnits += item.quantity;
    }

    // Fetch the coupon using its normalized code.
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select(
        "id, code, discount_type, discount_value, min_order_value_paise, min_item_count, max_discount_paise, starts_at, expires_at, is_active",
      )
      .eq("code", couponCode)
      .maybeSingle();

    if (couponError) {
      console.error("Coupon lookup error:", couponError);
      return response({ error: "Unable to validate this coupon." }, 500);
    }

    if (!coupon) {
      return response({ error: "Invalid coupon code." }, 400);
    }

    if (!coupon.is_active) {
      return response({ error: "This coupon is currently inactive." }, 400);
    }

    const now = Date.now();

    if (coupon.starts_at && now < new Date(coupon.starts_at).getTime()) {
      return response({ error: "This coupon is not active yet." }, 400);
    }

    if (coupon.expires_at && now > new Date(coupon.expires_at).getTime()) {
      return response({ error: "This coupon has expired." }, 400);
    }

    const minimumOrder = Number(coupon.min_order_value_paise || 0);
    const minimumUnits = Number(coupon.min_item_count || 0);

    if (subtotalPaise < minimumOrder) {
      return response({
        error: `Minimum order value for this coupon is ₹${(
          minimumOrder / 100
        ).toFixed(2)}.`,
      }, 400);
    }

    if (totalUnits < minimumUnits) {
      return response({
        error: `Add at least ${minimumUnits} total units to use this coupon.`,
      }, 400);
    }

    const discountValue = Number(coupon.discount_value);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return response({ error: "This coupon has an invalid discount." }, 400);
    }

    let discountPaise = 0;

    if (coupon.discount_type === "percentage") {
      discountPaise = Math.round(
        (subtotalPaise * discountValue) / 100,
      );
    } else if (coupon.discount_type === "fixed") {
      // Fixed discount_value is stored in rupees.
      discountPaise = Math.round(discountValue * 100);
    } else {
      return response({ error: "Unsupported coupon discount type." }, 400);
    }

    if (
      coupon.max_discount_paise !== null &&
      coupon.max_discount_paise !== undefined
    ) {
      discountPaise = Math.min(
        discountPaise,
        Number(coupon.max_discount_paise),
      );
    }

    // A discount cannot exceed the cart subtotal.
    discountPaise = Math.min(discountPaise, subtotalPaise);

    const payablePaise = subtotalPaise - discountPaise;

    return response({
      valid: true,
      couponCode: coupon.code,
      subtotal_paise: subtotalPaise,
      discount_paise: discountPaise,
      payable_paise: payablePaise,
      total_units: totalUnits,
      message: "Coupon applied successfully.",
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return response({ error: "Something went wrong while validating the coupon." }, 500);
  }
});