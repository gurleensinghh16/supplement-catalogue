import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type CustomerDetails = {
  name: string;
  phone: string; // 10-digit Indian mobile, no +91
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
};

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const STORAGE_KEY = "tds_checkout_details";

const EMPTY: CustomerDetails = {
  name: "", phone: "", email: "", address1: "", address2: "", city: "", state: "", pincode: "",
};

const cleanPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
};

const loadSaved = (): CustomerDetails => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
};

type Errors = Partial<Record<keyof CustomerDetails, string>>;

function validate(d: CustomerDetails): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = "Enter your full name";
  if (!/^[6-9]\d{9}$/.test(d.phone)) e.phone = "Enter a valid 10-digit mobile number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = "Enter a valid email";
  if (d.address1.trim().length < 5) e.address1 = "Enter your full address";
  if (d.city.trim().length < 2) e.city = "Enter your city";
  if (!d.state) e.state = "Select your state";
  if (!/^[1-9]\d{5}$/.test(d.pincode)) e.pincode = "Enter a valid 6-digit pincode";
  return e;
}

// Defined OUTSIDE the form component so inputs keep focus while typing.
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
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-[#999999] mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#de3746]">{error}</p>}
    </div>
  );
}

const MAX_QTY = 10;

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

type Props = {
  productName: string;
  unitPrice: number;
  onSubmit: (details: CustomerDetails, quantity: number) => void;
  onClose: () => void;
};

export default function CheckoutForm({ productName, unitPrice, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<CustomerDetails>(loadSaved);
  const [errors, setErrors] = useState<Errors>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (field: keyof CustomerDetails, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

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
      /* storage unavailable, ignore */
    }
        onSubmit(clean, quantity);
  };

  const inputClass = (field: keyof CustomerDetails) =>
    `w-full bg-black border px-3 py-2.5 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#c2202f] ${
      errors[field] ? "border-[#c2202f]" : "border-[#2b2a27]"
    }`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#2b2a27] bg-[#111111] p-5 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-['Orbitron'] text-base tracking-[0.15em] uppercase text-white">
              Delivery details
            </h2>
            <p className="mt-1 text-xs text-[#999999] line-clamp-2">
                            {productName} · <span className="text-white">{inr(unitPrice)}</span> each
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#999999] hover:text-white text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
                      <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#999999] mb-1">
              Quantity
            </label>
            <div className="flex items-center justify-between border border-[#2b2a27] bg-black px-3 py-2">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="h-8 w-8 cursor-pointer text-lg text-white hover:text-[#c2202f] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
                  disabled={quantity >= MAX_QTY}
                  aria-label="Increase quantity"
                  className="h-8 w-8 cursor-pointer text-lg text-white hover:text-[#c2202f] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-[#999999]">
                Total{" "}
                <span className="font-semibold text-white">{inr(unitPrice * quantity)}</span>
              </p>
            </div>
          </div>
          <Field label="Full name" error={errors.name}>
            <input
              className={inputClass("name")}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="name"
              placeholder="Your name"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Mobile number" error={errors.phone}>
              <div className="flex">
                <span className="flex items-center border border-r-0 border-[#2b2a27] bg-black px-3 text-sm text-[#999999]">
                  +91
                </span>
                <input
                  className={inputClass("phone")}
                  value={values.phone}
                  onChange={(e) => set("phone", cleanPhone(e.target.value))}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10-digit number"
                />
              </div>
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                className={inputClass("email")}
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>
          </div>

          <Field label="Address (house no., street)" error={errors.address1}>
            <input
              className={inputClass("address1")}
              value={values.address1}
              onChange={(e) => set("address1", e.target.value)}
              autoComplete="address-line1"
              placeholder="House / flat no., street"
            />
          </Field>

          <Field label="Area / landmark (optional)" error={errors.address2}>
            <input
              className={inputClass("address2")}
              value={values.address2}
              onChange={(e) => set("address2", e.target.value)}
              autoComplete="address-line2"
              placeholder="Area, landmark"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City" error={errors.city}>
              <input
                className={inputClass("city")}
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
                autoComplete="address-level2"
              />
            </Field>

            <Field label="Pincode" error={errors.pincode}>
              <input
                className={inputClass("pincode")}
                value={values.pincode}
                onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="6 digits"
              />
            </Field>
          </div>

          <Field label="State" error={errors.state}>
            <select
              className={inputClass("state")}
              value={values.state}
              onChange={(e) => set("state", e.target.value)}
              autoComplete="address-level1"
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <button
          type="submit"
          className="mt-6 block w-full bg-[#c2202f] py-3 text-center font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#de3746] cursor-pointer"
        >
                    Continue to payment · {inr(unitPrice * quantity)}
        </button>
      </form>
    </div>,
    document.body
  );
}