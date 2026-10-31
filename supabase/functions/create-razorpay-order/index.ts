
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PRODUCTS_TABLE = "keep_products";
const ORDERS_TABLE = "orders";
const ITEMS_TABLE = "order_items";
const COUPONS_TABLE = "coupons";

const ID_COL = "productID";
const NAME_COL = "productName";
const PRICE_COL = "prices";
const STOCK_COL = "in_stock";
const STOCK_QTY_COL = "stock_quantity";

type CartItem = {
  productId: string;
  quantity: number;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const clean = (value: unknown, maxLength: number): string =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

function parsePrice(value: unknown): number | null {
  const str = typeof value === "string"
    ? value.trim()
    : String(value ?? "");

  if (!/^\d+(\.\d{1,2})?$/.test(str)) return null;

  const price = Number(str);

  return Number.isFinite(price) && price > 0 ? price : null;
}

function validateCustomer(customer: Record<string, unknown>) {
  const name = clean(customer.name, 120);
  const phone = clean(customer.phone, 30);
  const email = clean(customer.email, 254);
  const address1 = clean(customer.address1, 250);
  const address2 = clean(customer.address2, 250);
  const city = clean(customer.city, 100);
  const state = clean(customer.state, 100);
  const pincode = clean(customer.pincode, 20);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validPhone = /^[+()\d\s-]{7,30}$/.test(phone);
  const validPincode = /^[A-Za-z0-9 -]{4,10}$/.test(pincode);

  if (
    !name || !phone || !email || !address1 ||
    !city || !state || !pincode
  ) {
    throw new Error("Please provide all required delivery details");
  }

  if (!validEmail || !validPhone || !validPincode) {
    throw new Error("Please check your email, phone number, and pincode");
  }

  return {
    name,
    phone,
    email,
    address1,
    address2,
    city,
    state,
    pincode,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const customerInput =
      body.customer && typeof body.customer === "object" &&
      !Array.isArray(body.customer)
        ? body.customer as Record<string, unknown>
        : {};

    let items: CartItem[] = [];

    // Backward compatibility: existing Buy Now requests.
    if (Array.isArray(body.items)) {
      if (body.items.length < 1 || body.items.length > 20) {
        return json({ error: "Cart must contain between 1 and 20 products" }, 400);
      }

      for (const item of body.items) {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return json({ error: "Invalid cart item" }, 400);
        }

        const row = item as Record<string, unknown>;
        const productId = clean(row.productId, 200);
        const quantity = Number(row.quantity);

        if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
          return json({ error: "Invalid product or quantity in cart" }, 400);
        }

        items.push({ productId, quantity });
      }
    } else {
      const productId = clean(body.productId, 200);
      const quantity = Number(body.quantity ?? 1);

      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return json({ error: "Invalid product or quantity" }, 400);
      }

      items = [{ productId, quantity }];
    }

    // Do not allow duplicate product IDs in the request.
    const productIds = items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      return json({ error: "Duplicate products found in cart" }, 400);
    }

    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

    if (totalUnits > 100) {
      return json({ error: "Cart quantity is too large" }, 400);
    }

    const couponCode = clean(body.couponCode, 50).toUpperCase();

    const customer = validateCustomer(customerInput);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !serviceKey || !keyId || !keySecret) {
      console.error("Required order-creation secrets are missing");
      return json({ error: "Order creation is not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch all products and calculate prices from the database.
    const orderItems: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price_paise: number;
      line_total_paise: number;
    }> = [];

    let subtotalPaise = 0;

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from(PRODUCTS_TABLE)
        .select(`${ID_COL},${NAME_COL},${PRICE_COL},${STOCK_COL},${STOCK_QTY_COL}`)
        .eq(ID_COL, item.productId)
        .maybeSingle();

      if (productError) {
        console.error("Product lookup failed:", productError.message);
        return json({ error: "Could not look up cart products" }, 500);
      }

      if (!product) {
        return json({ error: `Product not found: ${item.productId}` }, 404);
      }

      if (product[STOCK_COL] === false) {
        return json({ error: `${product[NAME_COL] ?? "Product"} is out of stock` }, 400);
      }

      const stockQuantity = product[STOCK_QTY_COL];

      if (
        typeof stockQuantity === "number" &&
        stockQuantity < item.quantity
      ) {
        return json({ error: `Insufficient stock for ${product[NAME_COL] ?? "product"}` }, 400);
      }

      const price = parsePrice(product[PRICE_COL]);

      if (price === null) {
        return json({ error: `Invalid price for ${product[NAME_COL] ?? "product"}` }, 400);
      }

      const unitPricePaise = Math.round(price * 100);
      const lineTotalPaise = unitPricePaise * item.quantity;

      if (
        !Number.isSafeInteger(unitPricePaise) ||
        !Number.isSafeInteger(lineTotalPaise)
      ) {
        return json({ error: "Invalid product amount" }, 400);
      }

      subtotalPaise += lineTotalPaise;

      orderItems.push({
        product_id: item.productId,
        product_name: String(product[NAME_COL] ?? "Product"),
        quantity: item.quantity,
        unit_price_paise: unitPricePaise,
        line_total_paise: lineTotalPaise,
      });
    }

    if (!Number.isSafeInteger(subtotalPaise) || subtotalPaise <= 0) {
      return json({ error: "Invalid subtotal" }, 400);
    }

    // Validate coupon entirely on the server.
    let discountPaise = 0;
    let appliedCoupon: string | null = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from(COUPONS_TABLE)
        .select(
          "code,discount_type,discount_value,min_order_value_paise,min_item_count,max_discount_paise,starts_at,expires_at,is_active",
        )
        .eq("code", couponCode)
        .maybeSingle();

      if (couponError) {
        console.error("Coupon lookup failed:", couponError.message);
        return json({ error: "Could not validate coupon" }, 500);
      }

      if (!coupon || coupon.is_active !== true) {
        return json({ error: "Invalid or inactive coupon code" }, 400);
      }

      const now = Date.now();

      if (coupon.starts_at && Date.parse(coupon.starts_at) > now) {
        return json({ error: "This coupon is not active yet" }, 400);
      }

      if (coupon.expires_at && Date.parse(coupon.expires_at) <= now) {
        return json({ error: "This coupon has expired" }, 400);
      }

      if (totalUnits < Number(coupon.min_item_count)) {
        return json({
          error: `Add at least ${coupon.min_item_count} total units to use this coupon`,
        }, 400);
      }

      if (subtotalPaise < Number(coupon.min_order_value_paise)) {
        const requiredRupees =
          (Number(coupon.min_order_value_paise) / 100).toFixed(2);

        return json({
          error: `Minimum order value for this coupon is ₹${requiredRupees}`,
        }, 400);
      }

      const discountValue = Number(coupon.discount_value);

      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        return json({ error: "Coupon discount is not configured correctly" }, 400);
      }

      if (coupon.discount_type === "percentage") {
        if (discountValue > 100) {
          return json({ error: "Invalid percentage discount configuration" }, 400);
        }

        discountPaise = Math.round(subtotalPaise * discountValue / 100);
      } else if (coupon.discount_type === "fixed") {
        discountPaise = Math.round(discountValue * 100);
      } else {
        return json({ error: "Invalid coupon discount type" }, 400);
      }

      if (coupon.max_discount_paise !== null) {
        discountPaise = Math.min(
          discountPaise,
          Number(coupon.max_discount_paise),
        );
      }

      discountPaise = Math.min(discountPaise, subtotalPaise);

      if (!Number.isSafeInteger(discountPaise) || discountPaise < 0) {
        return json({ error: "Invalid coupon discount amount" }, 400);
      }

      appliedCoupon = couponCode;
    }

    const amountPaise = subtotalPaise - discountPaise;

    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      return json({ error: "Invalid final order amount" }, 400);
    }

    // Create one Razorpay order for the entire cart.
    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `rcpt_${crypto.randomUUID()}`,
          notes: {
            itemCount: String(items.length),
            totalUnits: String(totalUnits),
            couponCode: appliedCoupon ?? "",
          },
        }),
      },
    );

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayResponse.ok || typeof razorpayOrder.id !== "string") {
      console.error(
        "Razorpay order creation failed with status:",
        razorpayResponse.status,
      );
      return json({ error: "Could not create payment order" }, 502);
    }

    // Keep legacy single-product fields populated for Buy Now.
    const singleItem = orderItems.length === 1 ? orderItems[0] : null;

    const { data: savedOrder, error: insertError } = await supabase
      .from(ORDERS_TABLE)
      .insert({
        product_id: singleItem?.product_id ?? null,
        product_name: singleItem?.product_name ?? "Cart order",
        quantity: singleItem?.quantity ?? null,
        amount_paise: amountPaise,
        subtotal_paise: subtotalPaise,
        discount_paise: discountPaise,
        coupon_code: appliedCoupon,
        order_type: items.length === 1 && !Array.isArray(body.items)
          ? "single"
          : "cart",
        currency: "INR",
        status: "created",
        razorpay_order_id: razorpayOrder.id,
        customer_email: customer.email,
        customer_phone: customer.phone,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address1: customer.address1,
        address2: customer.address2 || null,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
      })
      .select("id")
      .single();

    if (insertError || !savedOrder) {
      console.error("Could not save order:", insertError?.message);
      return json({ error: "Could not save order. Please try again." }, 500);
    }

    const { error: itemInsertError } = await supabase
      .from(ITEMS_TABLE)
      .insert(
        orderItems.map((item) => ({
          ...item,
          order_id: savedOrder.id,
        })),
      );

    if (itemInsertError) {
      console.error("Could not save order items:", itemInsertError.message);

      await supabase
        .from(ORDERS_TABLE)
        .delete()
        .eq("id", savedOrder.id);

      return json({ error: "Could not save cart items. Please try again." }, 500);
    }

    return json({
      order_id: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      key_id: keyId,
      name: singleItem?.product_name ?? "The Diet Store",
      subtotal_paise: subtotalPaise,
      discount_paise: discountPaise,
      coupon_code: appliedCoupon,
      item_count: totalUnits,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Please provide all required delivery details" ||
      message === "Please check your email, phone number, and pincode"
    ) {
      return json({ error: message }, 400);
    }

    console.error("Order creation error:", message);
    return json({ error: "Server error while creating order" }, 500);
  }
});
