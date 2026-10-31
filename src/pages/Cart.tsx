
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Tag,
  X,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import CartCheckoutForm from "../components/CartCheckoutForm";
import OrderSuccessModal from "../components/OrderSuccessModal";
import type { CustomerDetails } from "../components/CheckoutForm";

const FUNCTIONS_URL =
  "https://dkzwzmfdialcmurnagfs.supabase.co/functions/v1";

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const MAX_QTY = 10;

type CouponResult = {
  valid: boolean;
  couponCode: string;
  subtotal_paise: number;
  discount_paise: number;
  payable_paise: number;
  message?: string;
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

function getMaxQuantity(item: {
  inStock: boolean;
  stockQuantity?: number | null;
}) {
  if (!item.inStock) return 0;

  if (
    item.stockQuantity !== null &&
    item.stockQuantity !== undefined &&
    Number.isFinite(Number(item.stockQuantity))
  ) {
    return Math.max(
      0,
      Math.min(MAX_QTY, Math.floor(Number(item.stockQuantity)))
    );
  }

  // Fallback for older cart entries without saved stock information.
  return MAX_QTY;
}

export default function Cart() {
  const navigate = useNavigate();

  const {
    items,
    subtotal,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [stockMessage, setStockMessage] = useState("");

  const [successDetails, setSuccessDetails] = useState<{
    paymentId: string;
    email: string;
    productName: string;
    amountLabel: string;
  } | null>(null);

  const total = Math.max(0, subtotal - discount);

  const formatPrice = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const callFunction = async (
    functionName: string,
    body: unknown
  ): Promise<any> => {
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
      throw new Error(
        data.error || data.message || "Something went wrong."
      );
    }

    return data;
  };

  const cartItemsForServer = items.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
  }));

  const hasStockIssues = items.some((item) => {
    const maxQuantity = getMaxQuantity(item);

    return (
      maxQuantity <= 0 ||
      item.quantity > maxQuantity
    );
  });

  const invalidateCoupon = () => {
    setAppliedCoupon("");
    setDiscount(0);
    setCouponMessage("");
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (items.length === 0) {
      setCouponMessage("Your cart is empty.");
      return;
    }

    if (hasStockIssues) {
      setCouponMessage(
        "Please resolve the stock issues in your cart first."
      );
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      const result: CouponResult = await callFunction(
        "validate-cart-coupon",
        {
          items: cartItemsForServer,
          couponCode: code,
        }
      );

      if (!result.valid) {
        throw new Error("This coupon could not be applied.");
      }

      setAppliedCoupon(result.couponCode);
      setCouponInput(result.couponCode);
      setDiscount(result.discount_paise / 100);

      setCouponMessage(
        result.message || "Coupon applied successfully."
      );
    } catch (error) {
      invalidateCoupon();

      setCouponMessage(
        error instanceof Error
          ? error.message
          : "Unable to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    invalidateCoupon();
    setCouponInput("");
  };

  const handleQuantityChange = (
    id: string,
    quantity: number
  ) => {
    const item = items.find((product) => product.id === id);

    if (!item) return;

    const maxQuantity = getMaxQuantity(item);

    if (quantity > maxQuantity) {
      setStockMessage(
        `Only ${maxQuantity} unit(s) of ${item.name} are available.`
      );
      return;
    }

    if (quantity < 1) return;

    setStockMessage("");
    invalidateCoupon();
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    setStockMessage("");
    invalidateCoupon();
    removeFromCart(id);
  };

  const handleCheckout = async (
    customer: CustomerDetails
  ) => {
    if (paymentLoading) return;

    if (hasStockIssues) {
      setPaymentError(
        "Some products exceed their available stock. Please update your cart."
      );
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay is not loaded. Please refresh the page and try again."
        );
      }

      // Server independently verifies prices, stock and coupon.
      const order = await callFunction(
        "create-cart-razorpay-order",
        {
          items: cartItemsForServer,
          couponCode: appliedCoupon || null,
          customer,
        }
      );

      if (
        !order.order_id ||
        !order.key_id ||
        !Number.isFinite(Number(order.amount)) ||
        Number(order.amount) <= 0
      ) {
        throw new Error(
          "Invalid payment order received from server."
        );
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || "INR",
        name: order.name || "The Diet Store",
        description: "Cart purchase",
        order_id: order.order_id,

        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },

        notes: {
          coupon_code: order.coupon_code || "",
        },

        theme: {
          color: "#c2202f",
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },

        handler: async (
          paymentResponse: RazorpayPaymentResponse
        ) => {
          try {
            const verification = await callFunction(
              "verify-razorpay-payment",
              {
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (
              !verification.success &&
              !verification.verified
            ) {
              throw new Error(
                verification.error ||
                  "Payment verification failed."
              );
            }

            clearCart();
            invalidateCoupon();
            setShowCheckout(false);

            setSuccessDetails({
              paymentId: paymentResponse.razorpay_payment_id,
              email: customer.email,
              productName: `Cart order (${itemCount} units)`,
              amountLabel: formatPrice(
                Number(order.amount) / 100
              ),
            });
          } catch (error) {
            setPaymentError(
              error instanceof Error
                ? error.message
                : "Payment verification failed. Please contact support."
            );
          } finally {
            setPaymentLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (failure: any) => {
        setPaymentError(
          failure?.error?.description ||
            "Payment failed. Please try again."
        );

        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to start checkout."
      );

      setPaymentLoading(false);
    }
  };

  if (successDetails) {
    return (
      <OrderSuccessModal
        paymentId={successDetails.paymentId}
        email={successDetails.email}
        productName={successDetails.productName}
        amountLabel={successDetails.amountLabel}
        onClose={() => {
          setSuccessDetails(null);
          navigate("/catalogue");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/catalogue")}
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </button>

        <h1 className="mb-2 text-3xl font-bold">
          Your Cart
        </h1>

        <p className="mb-8 text-sm text-gray-400">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </p>

        {items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#111] px-6 py-16 text-center">
            <ShoppingBag
              className="mx-auto mb-4 text-gray-500"
              size={48}
            />

            <h2 className="mb-2 text-xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mb-6 text-gray-400">
              Add products to your cart to continue.
            </p>

            <button
              onClick={() => navigate("/catalogue")}
              className="rounded-lg bg-[#c2202f] px-6 py-3 font-semibold hover:bg-red-700"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => {
                const maxQuantity = getMaxQuantity(item);
                const remainingStock = Math.max(
                  0,
                  maxQuantity - item.quantity
                );

                const stockExceeded =
                  item.quantity > maxQuantity ||
                  maxQuantity === 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#111] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ShoppingBag
                          className="text-gray-400"
                          size={30}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {item.name}
                      </h3>

                      {item.brand && (
                        <p className="mt-1 text-sm text-gray-400">
                          {item.brand}
                        </p>
                      )}

                      <p className="mt-2 font-semibold text-[#e34b59]">
                        {formatPrice(item.price)}
                      </p>

                      {stockExceeded ? (
                        <p className="mt-2 text-xs text-red-400">
                          {maxQuantity === 0
                            ? "Currently out of stock. Remove this item to continue."
                            : `Only ${maxQuantity} units are available. Reduce quantity to continue.`}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">
                          {remainingStock > 0
                            ? `${remainingStock} more unit(s) available`
                            : "Maximum available stock reached"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center gap-3 rounded-lg border border-white/10 px-2 py-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="p-1 text-gray-300 disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="min-w-5 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.quantity >= maxQuantity ||
                            maxQuantity === 0
                          }
                          className="p-1 text-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-500 transition hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="text-right font-semibold sm:w-28">
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </div>
                  </div>
                );
              })}

              {stockMessage && (
                <p className="rounded-lg bg-red-950/40 p-3 text-sm text-red-400">
                  {stockMessage}
                </p>
              )}
            </div>

            <aside className="h-fit rounded-xl border border-white/10 bg-[#111] p-5">
              <h2 className="mb-5 text-xl font-bold">
                Order Summary
              </h2>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Coupon Code
                </label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-700/50 bg-green-950/30 p-3">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <Tag size={16} />
                      <span>{appliedCoupon} applied</span>
                    </div>

                    <button
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-white"
                      aria-label="Remove coupon"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(event) =>
                        setCouponInput(
                          event.target.value.toUpperCase()
                        )
                      }
                      placeholder="Enter coupon code"
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-[#c2202f]"
                    />

                    <button
                      onClick={handleApplyCoupon}
                      disabled={
                        couponLoading || hasStockIssues
                      }
                      className="rounded-lg bg-[#c2202f] px-4 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {couponLoading ? "Checking..." : "Apply"}
                    </button>
                  </div>
                )}

                {couponMessage && (
                  <p
                    className={`mt-2 text-xs ${
                      appliedCoupon
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount</span>
                    <span>- {formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {paymentError && (
                <p className="mt-4 rounded-lg bg-red-950/40 p-3 text-sm text-red-400">
                  {paymentError}
                </p>
              )}

              <button
                onClick={() => {
                  setPaymentError("");
                  setShowCheckout(true);
                }}
                disabled={
                  paymentLoading ||
                  hasStockIssues ||
                  items.length === 0
                }
                className="mt-6 w-full rounded-lg bg-[#c2202f] py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hasStockIssues
                  ? "Resolve Stock Issues"
                  : "Proceed to Checkout"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Secure payment powered by Razorpay
              </p>
            </aside>
          </div>
        )}
      </div>

      {showCheckout && (
        <CartCheckoutForm
          items={items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))}
          subtotal={subtotal}
          discount={discount}
          total={total}
          couponCode={appliedCoupon}
          onSubmit={handleCheckout}
          onClose={() => {
            setShowCheckout(false);
            setPaymentError("");
        }}
        />
      )}
    </div>
  );
}
