import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  paymentId: string;
  email: string;
  productName: string;
  amountLabel: string;
  onClose: () => void;
};

export default function OrderSuccessModal({
  paymentId,
  email,
  productName,
  amountLabel,
  onClose,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-[#2b2a27] bg-[#111111] p-6 sm:p-8 text-center"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#25D366] text-2xl text-[#25D366]">
          ✓
        </div>

        <h2 className="font-['Orbitron'] text-lg uppercase tracking-[0.15em] text-white">
          Order successful
        </h2>

        <p className="mt-3 text-sm text-[#999999]">
          Thank you for your order. Please check your email
          {email ? <span className="text-white"> ({email})</span> : null} for
          the payment confirmation.
        </p>

        <div className="mt-5 space-y-1 border border-[#2b2a27] bg-black p-4 text-left text-xs">
          <p className="text-[#999999]">
            Product: <span className="text-white">{productName}</span>
          </p>
          <p className="text-[#999999]">
            Amount paid: <span className="text-white">{amountLabel}</span>
          </p>
          <p className="break-all text-[#999999]">
            Payment ID: <span className="text-white">{paymentId}</span>
          </p>
        </div>

        <p className="mt-4 text-[11px] text-[#666666]">
          Save your payment ID in case you need to contact us about this order.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 block w-full cursor-pointer bg-[#c2202f] py-3 font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#de3746]"
        >
          Continue shopping
        </button>
      </div>
    </div>,
    document.body
  );
}