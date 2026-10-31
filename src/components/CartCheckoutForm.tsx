
import { useState } from "react";
import { createPortal } from "react-dom";
import type { CustomerDetails } from "@/components/CheckoutForm";

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Props = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string;
  onSubmit: (customer: CustomerDetails) => void | Promise<void>;
  onClose: () => void;
};

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const STORAGE_KEY = "tds_checkout_details";

const EMPTY: CustomerDetails = {
  name: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

function loadSaved(): CustomerDetails {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved
      ? { ...EMPTY, ...JSON.parse(saved) }
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

export default function CartCheckoutForm({
  items,
  subtotal,
  discount,
  total,
  couponCode,
  onSubmit,
  onClose,
}: Props) {
  const [values, setValues] = useState<CustomerDetails>(loadSaved);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (
    field: keyof CustomerDetails,
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    const customer: CustomerDetails = {
      name: values.name.trim(),

      phone: values.phone
        .replace(/\D/g, "")
        .replace(/^91/, "")
        .replace(/^0/, "")
        .slice(0, 10),

      email: values.email.trim(),
      address1: values.address1.trim(),
      address2: values.address2.trim(),
      city: values.city.trim(),
      state: values.state,
      pincode: values.pincode.trim(),
    };

    // Validate customer details.
    if (customer.name.length < 2) {
      setError("Enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(customer.phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
    ) {
      setError("Enter a valid email address.");
      return;
    }

    if (
      customer.address1.length < 5 ||
      customer.city.length < 2
    ) {
      setError("Enter your complete delivery address.");
      return;
    }

    if (
      !customer.state ||
      !/^[1-9]\d{5}$/.test(customer.pincode)
    ) {
      setError(
        "Select your state and enter a valid 6-digit pincode."
      );
      return;
    }

    if (
      !items.length ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      setError("Your cart or payable amount is invalid.");
      return;
    }

    // Save delivery information.
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(customer)
      );
    } catch {
      // Continue checkout if local storage is unavailable.
    }

    setSubmitting(true);

    try {
      // Wait for the parent checkout handler.
      await onSubmit(customer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start checkout. Please try again."
      );
    } finally {
      // Always reset the form loading state.
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-[#2b2a27] bg-black px-3 py-3 text-sm text-white outline-none focus:border-[#c2202f] placeholder:text-[#666] disabled:opacity-60";

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 sm:p-5"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto border border-[#2b2a27] bg-[#101010] p-5 sm:p-7"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-['Orbitron'] text-lg uppercase tracking-wider">
              Cart Checkout
            </h2>

            <p className="mt-1 text-xs text-[#999]">
              Confirm your delivery details
            </p>
          </div>

          {/* Always enabled close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="flex h-8 w-8 items-center justify-center text-2xl text-[#999] transition hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Order summary */}
        <div className="mb-6 border border-[#2b2a27] bg-black p-4">
          <h3 className="mb-3 text-xs uppercase tracking-wider text-[#999]">
            Order Items
          </h3>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="text-[#ccc]">
                  {item.name} × {item.quantity}
                </span>

                <span className="shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="my-4 border-t border-[#2b2a27]" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#999]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {couponCode && (
              <div className="flex justify-between text-green-500">
                <span>Coupon ({couponCode})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-[#2b2a27] pt-3 font-semibold text-white">
              <span>Payable Amount</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Customer details */}
        <div className="space-y-4">
          <input
            className={inputClass}
            placeholder="Full Name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            disabled={submitting}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="10-digit Mobile Number"
              value={values.phone}
              onChange={(e) =>
                update(
                  "phone",
                  e.target.value.replace(/\D/g, "").slice(0, 12)
                )
              }
              inputMode="numeric"
              autoComplete="tel"
              disabled={submitting}
              required
            />

            <input
              className={inputClass}
              type="email"
              placeholder="Email Address"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
              disabled={submitting}
              required
            />
          </div>

          <input
            className={inputClass}
            placeholder="House No. / Street Address"
            value={values.address1}
            onChange={(e) => update("address1", e.target.value)}
            autoComplete="address-line1"
            disabled={submitting}
            required
          />

          <input
            className={inputClass}
            placeholder="Area / Landmark (Optional)"
            value={values.address2}
            onChange={(e) => update("address2", e.target.value)}
            autoComplete="address-line2"
            disabled={submitting}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="City"
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              autoComplete="address-level2"
              disabled={submitting}
              required
            />

            <input
              className={inputClass}
              placeholder="6-digit Pincode"
              value={values.pincode}
              onChange={(e) =>
                update(
                  "pincode",
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              inputMode="numeric"
              autoComplete="postal-code"
              disabled={submitting}
              required
            />
          </div>

          <select
            className={inputClass}
            value={values.state}
            onChange={(e) => update("state", e.target.value)}
            autoComplete="address-level1"
            disabled={submitting}
            required
          >
            <option value="">Select State</option>

            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded border border-red-900/50 bg-red-950/30 p-3 text-sm text-[#de3746]"
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full bg-[#c2202f] py-3 font-['Orbitron'] text-xs uppercase tracking-wider text-white transition hover:bg-[#de3746] disabled:cursor-wait disabled:opacity-50"
        >
          {submitting
            ? "Processing..."
            : `Continue to Payment · ${formatPrice(total)}`}
        </button>

        <p className="mt-3 text-center text-[10px] text-[#777]">
          Your delivery information is saved on this device.
        </p>
      </form>
    </div>,
    document.body
  );
}
