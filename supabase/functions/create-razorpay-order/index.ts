import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ---- CONFIG: matches your existing table, no changes needed to it ----
const PRODUCTS_TABLE = "keep_products";
const ID_COL = "productID";
const NAME_COL = "productName";
const PRICE_COL = "prices"; // rupees, e.g. 7000.00
const STATUS_COL = "status"; // must be "Active" to be bought
// ----------------------------------------------------------------------

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { productId, quantity = 1, email = null, phone = null } =
      await req.json();

    const id = Number(productId);
    const qty = Number(quantity);
    if (!Number.isInteger(id)) return json({ error: "Invalid productId" }, 400);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      return json({ error: "Invalid quantity" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Price always comes from the database, never from the browser
    const { data: product, error: pErr } = await supabase
      .from(PRODUCTS_TABLE)
      .select("*")
      .eq(ID_COL, id)
      .maybeSingle();

    if (pErr) throw pErr;
    if (!product) return json({ error: "Product not found" }, 404);
    if (STATUS_COL in product && product[STATUS_COL] !== "Active") {
      return json({ error: "Product unavailable" }, 400);
    }

    const price = Number(product[PRICE_COL]);
    if (!(price > 0)) return json({ error: "Product has no price" }, 400);

    const amountPaise = Math.round(price * 100) * qty;

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { productId: String(id) },
      }),
    });

    const order = await rzpRes.json();
    if (!rzpRes.ok) {
      console.error("Razorpay error", order);
      return json({ error: "Could not create order" }, 502);
    }

    const { error: iErr } = await supabase.from("orders").insert({
      product_id: String(id),
      product_name: product[NAME_COL] ?? null,
      quantity: qty,
      amount_paise: amountPaise,
      currency: "INR",
      status: "created",
      razorpay_order_id: order.id,
      customer_email: email,
      customer_phone: phone,
    });
    if (iErr) throw iErr;

    return json({
      order_id: order.id,
      amount: amountPaise,
      currency: "INR",
      key_id: keyId,
      name: product[NAME_COL] ?? "Order",
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Server error" }, 500);
  }
});

