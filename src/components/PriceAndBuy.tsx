
import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import CheckoutForm, {
  type CustomerDetails,
} from "@/components/CheckoutForm";
import OrderSuccessModal from "@/components/OrderSuccessModal";
import { useCart } from "@/context/CartContext";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const FUNCTIONS_URL =
  "https://dkzwzmfdialcmurnagfs.supabase.co/functions/v1";

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const MAX_QTY = 10;

type PriceProduct = {
  name: string;
  brand: string;
  sku?: string | null;
  productId?: string | number | null;
  inStock: boolean;
  stockQuantity?: number | null;
  price?: string | number | null;
  mrp?: string | number | null;
  imageUrl?: string;
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

export default function PriceAndBuy({
  product,
}: {
  product: PriceProduct;
}) {
  const { addToCart, items, updateQuantity } = useCart();

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stockMessage, setStockMessage] = useState("");

  const [success, setSuccess] = useState<{
    paymentId: string;
    email: string;
    quantity: number;
    total: number;
  } | null>(null);

  const price = Number(product.price);
  const mrp = Number(product.mrp);

  const hasPrice = Number.isFinite(price) && price > 0;
  const hasMrp = Number.isFinite(mrp) && mrp > price;

  // Stock is expected to come from keep_products.stock_quantity.
  // Missing or invalid stock is treated as unavailable.
  const availableStock =
    product.stockQuantity !== null &&
    product.stockQuantity !== undefined &&
    Number.isFinite(Number(product.stockQuantity))
      ? Math.max(0, Math.floor(Number(product.stockQuantity)))
      : 0;

  const maxQuantity = Math.min(MAX_QTY, availableStock);

  const canBuy =
    hasPrice && product.inStock && maxQuantity > 0;

  const productId =
    String(product.productId ?? "").trim() ||
    String(product.sku ?? "").trim();

  const cartItem = items.find((item) => item.id === productId);

  const currentCartQuantity = cartItem?.quantity ?? 0;

  const remainingStock = Math.max(
    0,
    availableStock - currentCartQuantity
  );

  const handleAddToCart = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setStockMessage("");

    if (!canBuy) {
      setStockMessage("This product is currently out of stock.");
      return;
    }

    if (!productId) {
      setStockMessage("Product ID is missing.");
      return;
    }

    if (currentCartQuantity >= maxQuantity) {
      setStockMessage(
        `Only ${maxQuantity} unit(s) can be added to your cart.`
      );
      return;
    }

    addToCart({
      id: productId,
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      price,
      mrp: hasMrp ? mrp : undefined,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
      stockQuantity: availableStock,
    });

    setStockMessage("");
  };

  const changeQuantity = (
    event: React.MouseEvent<HTMLButtonElement>,
    nextQuantity: number
  ) => {
    event.stopPropagation();

    if (!cartItem) return;

    if (nextQuantity > maxQuantity) {
      setStockMessage(
        `Only ${maxQuantity} unit(s) are available.`
      );
      return;
    }

    setStockMessage("");
    updateQuantity(productId, nextQuantity);
  };

  const handleBuy = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (loading) return;

    if (!canBuy) {
      setStockMessage("This product is currently out of stock.");
      return;
    }

    if (!window.Razorpay) {
      alert(
        "Razorpay checkout has not loaded. Please refresh the page and try again."
      );
      return;
    }

    if (!productId) {
      alert(
        "This product has no product ID or SKU. Please contact the store."
      );
      return;
    }

    setStockMessage("");
    setShowForm(true);
  };

  const startPayment = async (
    customer: CustomerDetails,
    quantity: number
  ) => {
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > maxQuantity
    ) {
      setStockMessage(
        `You can purchase a maximum of ${maxQuantity} unit(s).`
      );
      setShowForm(false);
      return;
    }

    setShowForm(false);
    setLoading(true);

    try {
      const order = await callFunction<RazorpayOrderResponse>(
        "create-razorpay-order",
        {
          productId,
          quantity,
          customer,
        }
      );

      if (
        !order.order_id ||
        !order.key_id ||
        !Number.isFinite(order.amount) ||
        order.amount <= 0
      ) {
        throw new Error(
          "The server returned an invalid payment order."
        );
      }

      if (
        order.amount !==
        Math.round(price * 100) * quantity
      ) {
        throw new Error(
          "The product price has changed. Please refresh the catalogue and try again."
        );
      }

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

        handler: async (payment: RazorpayPaymentResponse) => {
          try {
            const result = await callFunction<{
              verified: boolean;
            }>("verify-razorpay-payment", payment);

            if (result.verified) {
              setSuccess({
                paymentId: payment.razorpay_payment_id,
                email: customer.email,
                quantity,
                total: price * quantity,
              });
            } else {
              alert(
                "Payment verification was unsuccessful. Please contact the store before trying to pay again."
              );
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

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

        alert(
          "Payment failed. Please check the payment details or try again."
        );
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
        <p className="mb-2 text-xs text-[#999999]">
          Price on request
        </p>
      )}

      {canBuy ? (
        <>
          {cartItem ? (
            <>
              <div className="mb-2 flex w-full items-center justify-between border border-[#c2202f] bg-[#171010] px-3 py-1.5">
                <button
                  type="button"
                  onClick={(event) =>
                    changeQuantity(
                      event,
                      cartItem.quantity - 1
                    )
                  }
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-white transition-colors hover:text-[#c2202f]"
                >
                  <Minus size={16} />
                </button>

                <span className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ShoppingCart
                    size={14}
                    className="text-[#c2202f]"
                  />
                  {cartItem.quantity}
                </span>

                <button
                  type="button"
                  onClick={(event) =>
                    changeQuantity(
                      event,
                      cartItem.quantity + 1
                    )
                  }
                  disabled={
                    cartItem.quantity >= maxQuantity
                  }
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-white transition-colors hover:text-[#c2202f] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="mb-2 text-center text-xs text-gray-400">
                {remainingStock > 0
                  ? `${remainingStock} unit(s) remaining`
                  : "Maximum available quantity reached"}
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="mb-2 flex w-full cursor-pointer items-center justify-center gap-2 border border-[#c2202f] bg-transparent py-2.5 text-center font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#c2202f]/15"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          )}

          <button
            type="button"
            onClick={handleBuy}
            disabled={loading}
            className="mb-2 block w-full cursor-pointer bg-[#c2202f] py-2.5 text-center font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#de3746] disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Buy Now"}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled
          className="mb-2 block w-full cursor-not-allowed bg-[#2b2a27] py-2.5 text-center font-['Orbitron'] text-xs uppercase tracking-wider text-[#999999]"
        >
          {!product.inStock || availableStock === 0
            ? "Sold Out"
            : "Unavailable"}
        </button>
      )}

      {stockMessage && (
        <p className="mb-2 text-xs text-red-400">
          {stockMessage}
        </p>
      )}

      {showForm && (
        <CheckoutForm
          productName={product.name}
          unitPrice={price}
          initialQuantity={cartItem?.quantity ?? 1}
          maxQuantity={maxQuantity}
          onSubmit={startPayment}
          onClose={() => setShowForm(false)}
        />
      )}

      {success && (
        <OrderSuccessModal
          paymentId={success.paymentId}
          email={success.email}
          productName={
            success.quantity > 1
              ? `${product.name} × ${success.quantity}`
              : product.name
          }
          amountLabel={formatPrice(success.total)}
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
}
