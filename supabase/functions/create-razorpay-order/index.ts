
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PRODUCTS_TABLE = "keep_products";
const ORDERS_TABLE = "orders";

const ID_COL = "productID";
const NAME_COL = "productName";
const PRICE_COL = "prices";
const STOCK_COL = "in_stock";
const STOCK_QTY_COL = "stock_quantity";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // Parse and validate request body.
    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const productId = clean(body.productId, 200);
    const quantity = body.quantity ?? 1;
    const customer =
      body.customer && typeof body.customer === "object" &&
      !Array.isArray(body.customer)
        ? body.customer as Record<string, unknown>
        : {};

    if (!productId) {
      return json({ error: "Invalid productId" }, 400);
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      return json({ error: "Quantity must be between 1 and 10" }, 400);
    }

    // Load server-side secrets.
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

    // Fetch the product using its text ID.
    const { data: product, error: productError } = await supabase
      .from(PRODUCTS_TABLE)
      .select(
        `${ID_COL},${NAME_COL},${PRICE_COL},${STOCK_COL},${STOCK_QTY_COL}`,
      )
      .eq(ID_COL, productId)
      .maybeSingle();

    if (productError) {
      console.error("Product lookup failed:", productError.message);
      return json({ error: "Could not look up product" }, 500);
    }

    if (!product) {
      return json({ error: "Product not found" }, 404);
    }

    // Enforce available stock when stock data is configured.
    if (product[STOCK_COL] === false) {
      return json({ error: "Product is out of stock" }, 400);
    }

    const stockQuantity = product[STOCK_QTY_COL];

    if (
      typeof stockQuantity === "number" &&
      stockQuantity < qty
    ) {
      return json({ error: "Insufficient stock" }, 400);
    }

    // Parse the stored price in rupees.
    // Accept numeric strings such as "7000" or "7000.00".
    // Reject formatted strings such as "₹7,000".
    const rawPrice = product[PRICE_COL];
    const priceString =
      typeof rawPrice === "string" ? rawPrice.trim() : String(rawPrice ?? "");

    if (!/^\d+(\.\d{1,2})?$/.test(priceString)) {
      return json(
        { error: "Product price is not configured as a valid rupee amount" },
        400,
      );
    }

    const price = Number(priceString);

    if (!Number.isFinite(price) || price <= 0) {
      return json({ error: "Product has no valid price" }, 400);
    }

    const unitPricePaise = Math.round(price * 100);
    const amountPaise = unitPricePaise * qty;

    if (
      !Number.isSafeInteger(unitPricePaise) ||
      !Number.isSafeInteger(amountPaise) ||
      amountPaise <= 0
    ) {
      return json({ error: "Invalid order amount" }, 400);
    }

    // Validate and sanitize delivery details.
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
      return json(
        { error: "Please provide all required delivery details" },
        400,
      );
    }

    if (!validEmail || !validPhone || !validPincode) {
      return json(
        { error: "Please check your email, phone number, and pincode" },
        400,
      );
    }

    // Create the Razorpay order using the server-calculated amount.
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
            productId,
            quantity: String(qty),
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

    // Save the order and delivery details server-side.
    const { error: insertError } = await supabase
      .from(ORDERS_TABLE)
      .insert({
        product_id: productId,
        product_name: product[NAME_COL] ?? null,
        quantity: qty,
        amount_paise: amountPaise,
        currency: "INR",
        status: "created",
        razorpay_order_id: razorpayOrder.id,
        customer_email: email,
        customer_phone: phone,
        name,
        phone,
        email,
        address1,
        address2: address2 || null,
        city,
        state,
        pincode,
      });

    if (insertError) {
      // Avoid logging customer information or secret values.
      console.error("Could not save order:", insertError.message);

      // Prevent an unrecorded order from being used for checkout.
      return json(
        { error: "Could not save order. Please try again." },
        500,
      );
    }

    return json({
      order_id: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      key_id: keyId,
      name: product[NAME_COL] ?? "Order",
    });
  } catch (error) {
    console.error(
      "Unexpected order creation error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return json({ error: "Server error while creating order" }, 500);
  }
});
