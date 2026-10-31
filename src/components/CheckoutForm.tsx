
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type CustomerDetails = {
  name: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
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
const MAX_QTY = 10;

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
    maximumFractionDigits: 0,
  }).format(value);

const cleanPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
};

const loadSaved = (): CustomerDetails => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return EMPTY;

    const parsed = JSON.parse(raw);

    return {
      ...EMPTY,
      ...parsed,
    };
  } catch {
    return EMPTY;
  }
};

type Errors = Partial<Record<keyof CustomerDetails, string>>;

function validate(details: CustomerDetails): Errors {
  const errors: Errors = {};

  if (details.name.trim().length < 2) {
    errors.name = "Enter your full name";
  }

  if (!/^[6-9]\d{9}$/.test(details.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (details.address1.trim().length < 5) {
    errors.address1 = "Enter your full address";
  }

  if (details.city.trim().length < 2) {
    errors.city = "Enter your city";
  }

  if (!details.state) {
    errors.state = "Select your state";
  }

  if (!/^[1-9]\d{5}$/.test(details.pincode)) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  return errors;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[11px] uppercase tracking-wider text-[#999999]">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-[#de3746]">
          {error}
        </p>
      )}
    </div>
  );
}

type Props = {
  productName: string;
  unitPrice: number;
  initialQuantity?: number;
  maxQuantity?: number;
  onSubmit: (details: CustomerDetails, quantity: number) => void;
  onClose: () => void;
};

export default function CheckoutForm({
  productName,
  unitPrice,
  initialQuantity = 1,
  maxQuantity = MAX_QTY,
  onSubmit,
  onClose,
}: Props) {
  const stockLimit = Math.max(
    0,
    Math.min(
      MAX_QTY,
      Math.floor(Number(maxQuantity) || 0)
    )
  );

  const [values, setValues] = useState<CustomerDetails>(loadSaved);
  const [errors, setErrors] = useState<Errors>({});

  const [quantity, setQuantity] = useState(() =>
    Math.min(
      stockLimit,
      Math.max(1, Math.floor(Number(initialQuantity) || 1))
    )
  );

  const [submitting, setSubmitting] = useState(false);

  const total = unitPrice * quantity;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, submitting]);

  const updateField = (
    field: keyof CustomerDetails,
    value: string
  ) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) =>
      Math.min(stockLimit, previous + 1)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    if (stockLimit < 1) {
      alert("This product is currently out of stock.");
      return;
    }

    if (quantity < 1 || quantity > stockLimit) {
      alert(
        `Only ${stockLimit} unit(s) are available for this product.`
      );
      return;
    }

    const foundErrors = validate(values);

    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      return;
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0 ||
      !Number.isFinite(total)
    ) {
      alert("Invalid product price. Please refresh and try again.");
      return;
    }

    const clean: CustomerDetails = {
      name: values.name.trim(),
      phone: values.phone,
      email: values.email.trim(),
      address1: values.address1.trim(),
      address2: values.address2.trim(),
      city: values.city.trim(),
      state: values.state,
      pincode: values.pincode,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // Continue checkout if browser storage is unavailable.
    }

    setSubmitting(true);

    try {
      onSubmit(clean, quantity);
    } catch (error) {
      setSubmitting(false);
      console.error("Checkout submission error:", error);
    }
  };

  const inputClass = (field: keyof CustomerDetails) =>
    `w-full min-w-0 border bg-black px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#666666] focus:border-[#c2202f] ${
      errors[field] ? "border-[#c2202f]" : "border-[#2b2a27]"
    }`;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 sm:p-4"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        noValidate
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-[#2b2a27] bg-[#111111] p-4 sm:p-7"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-['Orbitron'] text-base uppercase tracking-[0.15em] text-white">
              Delivery Details
            </h2>

            <p className="mt-1 line-clamp-2 text-xs text-[#999999]">
              {productName} ·{" "}
              <span className="text-white">
                {formatPrice(unitPrice)} each
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close checkout"
            className="shrink-0 cursor-pointer text-xl leading-none text-[#999999] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Quantity */}
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-[#999999]">
              Quantity
            </label>

            <div className="flex items-center justify-between border border-[#2b2a27] bg-black px-3 py-2">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || submitting}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-lg text-white hover:text-[#c2202f] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                <span className="w-10 text-center text-sm font-semibold text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    quantity >= stockLimit || submitting
                  }
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-lg text-white hover:text-[#c2202f] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <p className="text-xs text-[#999999]">
                Total{" "}
                <span className="font-semibold text-white">
                  {formatPrice(total)}
                </span>
              </p>
            </div>

            <p className="mt-1 text-[10px] text-[#777777]">
              {stockLimit > 0
                ? `Available stock: ${stockLimit} unit(s).`
                : "This product is currently out of stock."}
            </p>
          </div>

          {/* Name */}
          <Field label="Full Name" error={errors.name}>
            <input
              className={inputClass("name")}
              value={values.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              autoComplete="name"
              placeholder="Your full name"
              disabled={submitting}
            />
          </Field>

          {/* Phone and Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Mobile Number" error={errors.phone}>
              <div className="flex min-w-0">
                <span className="flex shrink-0 items-center border border-r-0 border-[#2b2a27] bg-black px-3 text-sm text-[#999999]">
                  +91
                </span>

                <input
                  className={inputClass("phone")}
                  value={values.phone}
                  onChange={(event) =>
                    updateField("phone", cleanPhone(event.target.value))
                  }
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10-digit number"
                  disabled={submitting}
                />
              </div>
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                className={inputClass("email")}
                value={values.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={submitting}
              />
            </Field>
          </div>

          {/* Address */}
          <Field
            label="Address (House No., Street)"
            error={errors.address1}
          >
            <input
              className={inputClass("address1")}
              value={values.address1}
              onChange={(event) =>
                updateField("address1", event.target.value)
              }
              autoComplete="address-line1"
              placeholder="House / flat no., street"
              disabled={submitting}
            />
          </Field>

          <Field label="Area / Landmark (Optional)">
            <input
              className={inputClass("address2")}
              value={values.address2}
              onChange={(event) =>
                updateField("address2", event.target.value)
              }
              autoComplete="address-line2"
              placeholder="Area, landmark"
              disabled={submitting}
            />
          </Field>

          {/* City and Pincode */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="City" error={errors.city}>
              <input
                className={inputClass("city")}
                value={values.city}
                onChange={(event) =>
                  updateField("city", event.target.value)
                }
                autoComplete="address-level2"
                placeholder="Your city"
                disabled={submitting}
              />
            </Field>

            <Field label="Pincode" error={errors.pincode}>
              <input
                className={inputClass("pincode")}
                value={values.pincode}
                onChange={(event) =>
                  updateField(
                    "pincode",
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="6-digit pincode"
                disabled={submitting}
              />
            </Field>
          </div>

          {/* State */}
          <Field label="State" error={errors.state}>
            <select
              className={inputClass("state")}
              value={values.state}
              onChange={(event) =>
                updateField("state", event.target.value)
              }
              autoComplete="address-level1"
              disabled={submitting}
            >
              <option value="">Select State</option>

              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || stockLimit < 1}
          className="mt-6 block w-full cursor-pointer bg-[#c2202f] py-3 text-center font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#de3746] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Processing..."
            : stockLimit < 1
              ? "Out of Stock"
              : `Continue to Payment · ${formatPrice(total)}`}
        </button>

        <p className="mt-3 text-center text-[10px] text-[#777777]">
          Your delivery details are saved on this device for your next visit.
        </p>
      </form>
    </div>,
    document.body
  );
}
