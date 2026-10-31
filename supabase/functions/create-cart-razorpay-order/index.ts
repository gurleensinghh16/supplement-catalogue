
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PRODUCTS_TABLE = "keep_products";
const COUPONS_TABLE = "coupons";
const ORDERS_TABLE = "orders";

const ID_COL = "productID";
const NAME_COL = "productName";
const PRICE_COL = "100475-The Diet Store-Price";
const STOCK_COL = "in_stock";
const STOCK_QTY_COL = "stock_quantity";

const MAX_QTY_PER_PRODUCT = 10;
const MAX_CART_LINES = 50;
const MAX_ORDER_AMOUNT_PAISE = 100_000_000;

type CartRequestItem = {
  productId: string;
  quantity: number;
};

type Customer = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  address1?: unknown;
  address2?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
};

type ProductRow = {
  productID: string;
  productName: string | null;
  brandName: string | null;
  sku: string | null;
  all_images_url: string | null;
  in_stock: boolean | null;
  stock_quantity: number | null;
  [key: string]: unknown;
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
  typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";

function parseRupeePrice(value: unknown): number | null {
  const raw =
    typeof value === "string"
      ? value.trim()
      : String(value ?? "");

  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    return null;
  }

  const price = Number(raw);

  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  const paise = Math.round(price * 100);

  return Number.isSafeInteger(paise) ? paise : null;
}

function calculateDiscount(
  subtotalPaise: number,
  discountType: string,
  discountValue: number,
  maxDiscountPaise: number | null,
): number {
  let discount = 0;

  if (discountType === "percentage") {
    discount = Math.round(
      (subtotalPaise * discountValue) / 100,
    );
  } else if (discountType === "fixed") {
    discount = Math.round(discountValue * 100);
  }

  if (maxDiscountPaise !== null) {
    discount = Math.min(discount, maxDiscountPaise);
  }

  return Math.min(
    Math.max(0, discount),
    subtotalPaise,
  );
}

function validDate(value: string | null): number | null {
  if (!value) return null;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      405,
    );
  }

  try {
    // --------------------------------------------------
    // 1. Parse request
    // --------------------------------------------------

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return json(
        { error: "Invalid JSON body" },
        400,
      );
    }

    const rawItems = body.items;

    const customer =
      body.customer &&
      typeof body.customer === "object" &&
      !Array.isArray(body.customer)
        ? (body.customer as Customer)
        : {};

    const couponCode = clean(
      body.couponCode,
      50,
    ).toUpperCase();

    if (
      !Array.isArray(rawItems) ||
      rawItems.length < 1 ||
      rawItems.length > MAX_CART_LINES
    ) {
      return json(
        {
          error:
            "Your cart is empty or contains too many products",
        },
        400,
      );
    }

    // --------------------------------------------------
    // 2. Validate and combine duplicate product IDs
    // --------------------------------------------------

    const quantityMap = new Map<string, number>();

    for (const entry of rawItems) {
      if (
        !entry ||
        typeof entry !== "object" ||
        Array.isArray(entry)
      ) {
        return json(
          { error: "Invalid cart item" },
          400,
        );
      }

      const item = entry as Record<string, unknown>;

      const productId = clean(
        item.productId,
        200,
      );

      const quantity = Number(item.quantity);

      if (
        !productId ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_QTY_PER_PRODUCT
      ) {
        return json(
          {
            error:
              "Invalid product or quantity in cart",
          },
          400,
        );
      }

      const combinedQuantity =
        (quantityMap.get(productId) ?? 0) +
        quantity;

      if (combinedQuantity > MAX_QTY_PER_PRODUCT) {
        return json(
          {
            error:
              "Maximum 10 units allowed per product",
          },
          400,
        );
      }

      quantityMap.set(
        productId,
        combinedQuantity,
      );
    }

    const productIds = [...quantityMap.keys()];

    const totalUnits = [
      ...quantityMap.values(),
    ].reduce(
      (sum, quantity) => sum + quantity,
      0,
    );

    // --------------------------------------------------
    // 3. Validate customer information
    // --------------------------------------------------

    const name = clean(customer.name, 120);
    const phone = clean(customer.phone, 30);
    const email = clean(customer.email, 254);
    const address1 = clean(customer.address1, 250);
    const address2 = clean(customer.address2, 250);
    const city = clean(customer.city, 100);
    const state = clean(customer.state, 100);
    const pincode = clean(customer.pincode, 20);

    if (
      !name ||
      !phone ||
      !email ||
      !address1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return json(
        {
          error:
            "Please provide all required delivery details",
        },
        400,
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[+()\d\s-]{7,30}$/.test(phone) ||
      !/^[1-9]\d{5}$/.test(pincode)
    ) {
      return json(
        {
          error:
            "Please check your email, phone number, and pincode",
        },
        400,
      );
    }

    // --------------------------------------------------
    // 4. Initialize Supabase and Razorpay credentials
    // --------------------------------------------------

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get(
      "RAZORPAY_KEY_SECRET",
    );

    if (
      !supabaseUrl ||
      !serviceKey ||
      !keyId ||
      !keySecret
    ) {
      console.error(
        "Cart checkout secrets are missing",
      );

      return json(
        {
          error:
            "Cart checkout is not configured",
        },
        500,
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // --------------------------------------------------
    // 5. Fetch products from Supabase
    //
    // IMPORTANT:
    // Use select("*") because the selling-price
    // column contains spaces and special characters.
    // Read its value using PRICE_COL below.
    // --------------------------------------------------

    const {
      data: products,
      error: productsError,
    } = await supabase
      .from(PRODUCTS_TABLE)
      .select("*")
      .in(ID_COL, productIds);

    if (productsError) {
      console.error(
        "Cart product lookup failed:",
        productsError.message,
      );

      return json(
        {
          error:
            "Could not validate cart products",
        },
        500,
      );
    }

    if (
      !products ||
      products.length !== productIds.length
    ) {
      return json(
        {
          error:
            "One or more cart products no longer exist",
        },
        400,
      );
    }

    const productById = new Map(
      (products as ProductRow[]).map(
        (product) => [
          String(product[ID_COL]),
          product,
        ],
      ),
    );

    // --------------------------------------------------
    // 6. Validate stock and calculate subtotal
    // --------------------------------------------------

    const orderItems: Array<{
      product_id: string;
      product_name: string;
      brand: string | null;
      sku: string | null;
      image_url: string | null;
      quantity: number;
      unit_price_paise: number;
      line_total_paise: number;
    }> = [];

    let subtotalPaise = 0;

    for (const [
      productId,
      quantity,
    ] of quantityMap.entries()) {
      const product = productById.get(productId);

      if (!product) {
        return json(
          {
            error:
              "A cart product could not be found",
          },
          400,
        );
      }

      const productName = String(
        product[NAME_COL] ?? "Product",
      );

      // Both availability flag and stock quantity
      // must confirm that the product is available.
      const stockQuantity = Number(
        product[STOCK_QTY_COL] ?? 0,
      );

      if (
        product[STOCK_COL] !== true ||
        !Number.isInteger(stockQuantity) ||
        stockQuantity < quantity
      ) {
        return json(
          {
            error:
              stockQuantity <= 0
                ? `${productName} is out of stock`
                : `Insufficient stock for ${productName}. Available: ${Math.max(0, stockQuantity)}`,
          },
          400,
        );
      }

      // Exact database column name:
      // 100475-The Diet Store-Price
      const unitPricePaise = parseRupeePrice(
        product[PRICE_COL],
      );

      if (unitPricePaise === null) {
        console.error(
          "Invalid selling price:",
          productId,
          product[PRICE_COL],
        );

        return json(
          {
            error:
              `A valid selling price is not configured for ${productName}`,
          },
          400,
        );
      }

      const lineTotalPaise =
        unitPricePaise * quantity;

      if (
        !Number.isSafeInteger(lineTotalPaise)
      ) {
        return json(
          { error: "Invalid product amount" },
          400,
        );
      }

      subtotalPaise += lineTotalPaise;

      orderItems.push({
        product_id: productId,
        product_name: productName,

        brand:
          product.brandName == null
            ? null
            : String(product.brandName),

        sku:
          product.sku == null
            ? null
            : String(product.sku),

        image_url:
          product.all_images_url == null
            ? null
            : String(product.all_images_url),

        quantity,
        unit_price_paise: unitPricePaise,
        line_total_paise: lineTotalPaise,
      });
    }

    if (
      !Number.isSafeInteger(subtotalPaise) ||
      subtotalPaise <= 0
    ) {
      return json(
        { error: "Invalid cart subtotal" },
        400,
      );
    }

    // --------------------------------------------------
    // 7. Validate coupon
    // --------------------------------------------------

    let appliedCoupon: string | null = null;
    let discountPaise = 0;

    if (couponCode) {
      const {
        data: coupon,
        error: couponError,
      } = await supabase
        .from(COUPONS_TABLE)
        .select(
          "code,discount_type,discount_value,min_order_value_paise,min_item_count,max_discount_paise,starts_at,expires_at,is_active",
        )
        .eq("code", couponCode)
        .maybeSingle();

      if (couponError) {
        console.error(
          "Coupon lookup failed:",
          couponError.message,
        );

        return json(
          { error: "Could not validate coupon" },
          500,
        );
      }

      if (!coupon) {
        return json(
          { error: "Invalid coupon code" },
          400,
        );
      }

      const now = Date.now();

      if (coupon.is_active !== true) {
        return json(
          { error: "This coupon is inactive" },
          400,
        );
      }

      const startsAt = validDate(
        coupon.starts_at,
      );

      const expiresAt = validDate(
        coupon.expires_at,
      );

      if (
        coupon.starts_at &&
        startsAt === null
      ) {
        return json(
          { error: "Invalid coupon start date" },
          400,
        );
      }

      if (
        coupon.expires_at &&
        expiresAt === null
      ) {
        return json(
          { error: "Invalid coupon expiry date" },
          400,
        );
      }

      if (
        startsAt !== null &&
        startsAt > now
      ) {
        return json(
          {
            error:
              "This coupon is not active yet",
          },
          400,
        );
      }

      if (
        expiresAt !== null &&
        expiresAt <= now
      ) {
        return json(
          { error: "This coupon has expired" },
          400,
        );
      }

      const minimumOrderPaise = Number(
        coupon.min_order_value_paise,
      );

      const minimumUnits = Number(
        coupon.min_item_count,
      );

      const discountValue = Number(
        coupon.discount_value,
      );

      if (
        !Number.isSafeInteger(minimumOrderPaise) ||
        minimumOrderPaise < 0 ||
        !Number.isInteger(minimumUnits) ||
        minimumUnits < 1 ||
        !Number.isFinite(discountValue) ||
        discountValue <= 0
      ) {
        console.error(
          "Coupon has invalid configuration",
        );

        return json(
          {
            error:
              "Coupon configuration is invalid",
          },
          500,
        );
      }

      if (
        subtotalPaise < minimumOrderPaise
      ) {
        return json(
          {
            error:
              `This coupon requires a minimum order of ₹${(
                minimumOrderPaise / 100
              ).toLocaleString("en-IN")}`,
          },
          400,
        );
      }

      if (totalUnits < minimumUnits) {
        return json(
          {
            error:
              `Add at least ${minimumUnits} total units to use this coupon`,
          },
          400,
        );
      }

      if (
        coupon.discount_type !== "percentage" &&
        coupon.discount_type !== "fixed"
      ) {
        return json(
          {
            error:
              "Coupon discount type is invalid",
          },
          500,
        );
      }

      if (
        coupon.discount_type === "percentage" &&
        discountValue > 100
      ) {
        return json(
          {
            error:
              "Coupon percentage is invalid",
          },
          500,
        );
      }

      const maxDiscountPaise =
        coupon.max_discount_paise == null
          ? null
          : Number(coupon.max_discount_paise);

      if (
        maxDiscountPaise !== null &&
        (
          !Number.isSafeInteger(maxDiscountPaise) ||
          maxDiscountPaise < 0
        )
      ) {
        return json(
          {
            error:
              "Coupon maximum discount is invalid",
          },
          500,
        );
      }

      discountPaise = calculateDiscount(
        subtotalPaise,
        coupon.discount_type,
        discountValue,
        maxDiscountPaise,
      );

      appliedCoupon = couponCode;
    }

    // --------------------------------------------------
    // 8. Calculate final amount
    // --------------------------------------------------

    const amountPaise =
      subtotalPaise - discountPaise;

    if (
      !Number.isSafeInteger(amountPaise) ||
      amountPaise <= 0 ||
      amountPaise > MAX_ORDER_AMOUNT_PAISE
    ) {
      return json(
        { error: "Invalid final order amount" },
        400,
      );
    }

    // --------------------------------------------------
    // 9. Create Razorpay order
    // --------------------------------------------------

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            "Basic " +
            btoa(`${keyId}:${keySecret}`),
        },

        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",

          receipt:
            `cart_${crypto.randomUUID()}`,

          notes: {
            item_count: String(orderItems.length),
            total_units: String(totalUnits),
            coupon_code: appliedCoupon ?? "",
          },
        }),

        signal: AbortSignal.timeout(15000),
      },
    );

    let razorpayOrder: Record<string, unknown>;

    try {
      razorpayOrder = await razorpayResponse.json();
    } catch {
      console.error(
        "Razorpay returned invalid JSON",
      );

      return json(
        {
          error:
            "Invalid response from payment gateway",
        },
        502,
      );
    }

    if (
      !razorpayResponse.ok ||
      typeof razorpayOrder.id !== "string"
    ) {
      console.error(
        "Razorpay order creation failed:",
        razorpayResponse.status,
        razorpayOrder,
      );

      return json(
        {
          error:
            "Could not create payment order. Please try again.",
        },
        502,
      );
    }

    // --------------------------------------------------
    // 10. Save order in Supabase
    // --------------------------------------------------

    const firstItem = orderItems[0];

    const {
      error: insertError,
    } = await supabase
      .from(ORDERS_TABLE)
      .insert({
        // Preserve legacy order fields.
        product_id: firstItem.product_id,

        product_name:
          orderItems.length === 1
            ? firstItem.product_name
            : `${firstItem.product_name} and ${orderItems.length - 1} more`,

        quantity: totalUnits,

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

        // Cart-specific fields.
        order_items: orderItems,
        subtotal_paise: subtotalPaise,
        discount_paise: discountPaise,
        coupon_code: appliedCoupon,
      });

    if (insertError) {
      console.error(
        "Could not save cart order:",
        insertError.message,
      );

      return json(
        {
          error:
            "Could not save order. Please try again.",
        },
        500,
      );
    }

    // --------------------------------------------------
    // 11. Return payment details to frontend
    // --------------------------------------------------

    return json({
      order_id: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      key_id: keyId,

      name:
        `TheDietStore cart (${totalUnits} units)`,

      subtotal_paise: subtotalPaise,
      discount_paise: discountPaise,
      coupon_code: appliedCoupon,
    });

  } catch (error) {
    console.error(
      "Unexpected cart order error:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return json(
      {
        error:
          "Server error while creating cart order",
      },
      500,
    );
  }
});
