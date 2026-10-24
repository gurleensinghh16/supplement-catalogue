import { useState } from "react";
import CheckoutForm, { type CustomerDetails } from "@/components/CheckoutForm";
import OrderSuccessModal from "@/components/OrderSuccessModal";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const FUNCTIONS_URL =
  "https://dkzwzmfdialcmurnagfs.supabase.co/functions/v1";

// Supabase anon/publishable key is intended for frontend use.
// Never put your Razorpay secret key in this file.
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrend6bWZkaWFsY211cm5hZ3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzIwMDUsImV4cCI6MjEwMzE0ODAwNX0.h3ZsdSnkExkq0qFt86_7UX2eZpXTTpT_ld8hkfCetlE";

type PriceProduct = {
  name: string;
  brand: string;
  sku?: string | null;
  productId?: string | number | null;
  inStock: boolean;
  price?: string | number | null;
  mrp?: string | number | null;
};

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOrderResponse = {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  name?: string;
};

type FunctionError = {
  error?: string;
  message?: string;
};

const callFunction = async <T,>(
  functionName: string,
  body: unknown
): Promise<T> => {
  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorData = data as FunctionError;

    throw new Error(
      errorData.error ||
      errorData.message ||
      `Request failed (${response.status})`
    );
  }

  return data as T;
};

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PriceAndBuy({ product }: { product: PriceProduct }) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState<{ paymentId: string; email: string } | null>(null);

  const price = Number(product.price);
  const mrp = Number(product.mrp);

  const hasPrice = Number.isFinite(price) && price > 0;
  const hasMrp = Number.isFinite(mrp) && mrp > price;
  const canBuy = hasPrice && product.inStock;

  // Prefer the real Supabase productID.
  // An empty string must not prevent fallback to the SKU.
  const productId =
    String(product.productId ?? "").trim() || String(product.sku ?? "").trim();

  // Step 1: Buy now checks the basics, then opens the delivery form.
  const handleBuy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (loading) return;

    if (!canBuy) {
      alert("This product is currently unavailable.");
      return;
    }

    if (!window.Razorpay) {
      alert(
        "Razorpay checkout has not loaded. Please refresh the page and try again."
      );
      return;
    }

    if (!productId) {
      alert("This product has no product ID or SKU. Please contact the store.");
      return;
    }

    setShowForm(true);
  };

  // Step 2: the form was submitted, so create the order and open Razorpay.
  const startPayment = async (customer: CustomerDetails) => {
    setShowForm(false);
    setLoading(true);

    try {
      // 1. Create the order using the server-side product price.
      const order = await callFunction<RazorpayOrderResponse>(
        "create-razorpay-order",
        {
          productId,
          quantity: 1,
          customer,
        }
      );

      if (
        !order.order_id ||
        !order.key_id ||
        !Number.isFinite(order.amount) ||
        order.amount <= 0
      ) {
        throw new Error("The server returned an invalid payment order.");
      }

      // Prevent checkout if the displayed price differs from
      // the amount returned by the backend.
      if (order.amount !== Math.round(price * 100)) {
        alert(
          "The product price has changed. Please refresh the catalogue and try again."
        );
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout.
      const razorpay = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.order_id,
        name: "TheDietStore",
        description: order.name || product.name,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: `+91${customer.phone}`,
        },
        theme: {
          color: "#c2202f",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        // 3. Verify payment on the server.
        handler: async (payment: RazorpayPaymentResponse) => {
          try {
            const result = await callFunction<{ verified: boolean }>(
              "verify-razorpay-payment",
              payment
            );

            if (result.verified) {
              setSuccess({
                paymentId: payment.razorpay_payment_id,
                email: customer.email,
              });
            } else {
              alert(
                "Payment verification was unsuccessful. Please contact the store before trying to pay again."
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);

            alert(
              "Payment verification could not be confirmed. Do not pay again immediately. Contact the store with your payment ID: " +
              payment.razorpay_payment_id
            );
          } finally {
            setLoading(false);
          }
        },
      });

      razorpay.on("payment.failed", () => {
        setLoading(false);
        alert("Payment failed. Please check the payment details or try again.");
      });

      razorpay.open();
    } catch (error) {
      console.error("Create payment order error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="mb-2">
      {hasPrice ? (
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-base font-semibold text-white">
            {formatPrice(price)}
          </span>

          {hasMrp && (
            <>
              <span className="text-xs text-[#999999] line-through">
                {formatPrice(mrp)}
              </span>

              <span className="text-[10px] font-medium text-[#25D366]">
                {Math.round((1 - price / mrp) * 100)}% off
              </span>
            </>
          )}
        </div>
      ) : (
        <p className="mb-2 text-xs text-[#999999]">Price on request</p>
      )}

      {canBuy ? (
        <button
          type="button"
          onClick={handleBuy}
          disabled={loading}
          className="mb-2 block w-full cursor-pointer bg-[#c2202f] py-2.5 text-center font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#de3746] disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Buy now"}
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="mb-2 block w-full cursor-not-allowed bg-[#2b2a27] py-2.5 text-center font-['Orbitron'] text-xs uppercase tracking-wider text-[#999999]"
        >
          {product.inStock ? "Unavailable" : "Sold out"}
        </button>
      )}

      {showForm && (
        <CheckoutForm
          productName={product.name}
          amountLabel={formatPrice(price)}
          onSubmit={startPayment}
          onClose={() => setShowForm(false)}
        />
      )}

      {success && (
        <OrderSuccessModal
          paymentId={success.paymentId}
          email={success.email}
          productName={product.name}
          amountLabel={formatPrice(price)}
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
}