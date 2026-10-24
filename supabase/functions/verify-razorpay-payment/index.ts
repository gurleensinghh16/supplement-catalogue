
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ORDERS_TABLE = "orders";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;

  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }

  return diff === 0;
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

    const razorpayOrderId = body.razorpay_order_id;
    const razorpayPaymentId = body.razorpay_payment_id;
    const razorpaySignature = body.razorpay_signature;

    if (
      typeof razorpayOrderId !== "string" ||
      !/^order_[A-Za-z0-9]+$/.test(razorpayOrderId) ||
      typeof razorpayPaymentId !== "string" ||
      !/^pay_[A-Za-z0-9]+$/.test(razorpayPaymentId) ||
      typeof razorpaySignature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpaySignature)
    ) {
      return json({ error: "Invalid payment details" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !serviceKey || !keyId || !keySecret) {
      console.error("Payment verification configuration is incomplete");
      return json(
        { error: "Payment verification is not configured" },
        500,
      );
    }

    // 1. Verify the Razorpay checkout signature.
    const encoder = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const expectedSignature = new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        encoder.encode(
          `${razorpayOrderId}|${razorpayPaymentId}`,
        ),
      ),
    );

    const suppliedSignature = hexToBytes(razorpaySignature);

    if (!safeEqual(expectedSignature, suppliedSignature)) {
      return json({ error: "Payment signature is invalid" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 2. Find the matching order in our own database.
    const { data: existing, error: lookupError } = await supabase
      .from(ORDERS_TABLE)
      .select(
        "id,status,razorpay_payment_id,amount_paise,currency",
      )
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (lookupError) {
      console.error("Order lookup failed:", lookupError.message);
      return json({ error: "Could not verify order" }, 500);
    }

    if (!existing) {
      return json({ error: "Order not found" }, 404);
    }

    // 3. Ask Razorpay directly for the payment's current status.
    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!paymentResponse.ok) {
      console.error(
        "Razorpay payment lookup failed with status:",
        paymentResponse.status,
      );

      return json(
        { error: "Could not confirm payment status. Please retry." },
        502,
      );
    }

    const payment = await paymentResponse.json();

    // 4. Confirm this payment belongs to this order and matches
    // the exact amount and currency stored on our server.
    if (
      payment.id !== razorpayPaymentId ||
      payment.order_id !== razorpayOrderId ||
      payment.amount !== existing.amount_paise ||
      payment.currency !== existing.currency
    ) {
      return json(
        { error: "Payment details do not match the order" },
        400,
      );
    }

    // Only a captured payment is accepted as paid.
    // An authorized-but-not-captured payment is not sufficient.
    if (payment.status !== "captured" || payment.captured !== true) {
      return json(
        {
          verified: false,
          error: "Payment is not captured yet",
        },
        409,
      );
    }

    // 5. Make retries safe, without allowing a different payment
    // to overwrite the payment already associated with this order.
    if (existing.status === "paid") {
      if (existing.razorpay_payment_id === razorpayPaymentId) {
        return json({ verified: true });
      }

      return json(
        { error: "Order already has a different payment" },
        409,
      );
    }

    if (existing.status !== "created") {
      return json({ error: "Order cannot be marked paid" }, 409);
    }

    // 6. Atomically claim the unpaid order.
    // The status condition prevents two requests from overwriting
    // one another. A database RPC can provide stronger transaction
    // guarantees if concurrent verification becomes an issue.
    const { data: updated, error: updateError } = await supabase
      .from(ORDERS_TABLE)
      .update({
        status: "paid",
        razorpay_payment_id: razorpayPaymentId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("status", "created")
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Order update failed:", updateError.message);
      return json({ error: "Could not update payment status" }, 500);
    }

    if (!updated) {
      // Another request may have completed verification first.
      const { data: latest, error: latestError } = await supabase
        .from(ORDERS_TABLE)
        .select("status,razorpay_payment_id")
        .eq("id", existing.id)
        .maybeSingle();

      if (latestError) {
        console.error("Order recheck failed:", latestError.message);
        return json({ error: "Could not confirm order status" }, 500);
      }

      if (
        latest?.status === "paid" &&
        latest.razorpay_payment_id === razorpayPaymentId
      ) {
        return json({ verified: true });
      }

      return json(
        { error: "Order status changed; please check the order" },
        409,
      );
    }

    return json({ verified: true });
  } catch (error) {
    console.error(
      "Payment verification failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return json({ error: "Could not verify payment" }, 500);
  }
});
