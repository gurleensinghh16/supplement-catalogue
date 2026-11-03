
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type HomepageCoupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value_paise: number;
  description: string | null;
  homepage_message: string | null;
  starts_at: string | null;
  expires_at: string | null;
};

export default function HomepageCoupons() {
  const [coupons, setCoupons] = useState<HomepageCoupon[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchCoupons() {
      const { data, error } = await supabase
        .from("coupons")
        .select(`
          id,
          code,
          discount_type,
          discount_value,
          min_order_value_paise,
          description,
          homepage_message,
          starts_at,
          expires_at
        `)
        .eq("class", "public")
        .eq("is_active", true)
        .eq("show_on_homepage", true);

      if (error) {
        console.error("Homepage coupons error:", error);
        return;
      }

      const now = Date.now();

      const validCoupons = (data ?? []).filter((coupon) => {
        const notStarted =
          coupon.starts_at &&
          new Date(coupon.starts_at).getTime() > now;

        const expired =
          coupon.expires_at &&
          new Date(coupon.expires_at).getTime() <= now;

        return !notStarted && !expired;
      });

      if (isMounted) {
        setCoupons(validCoupons as HomepageCoupon[]);
      }
    }

    void fetchCoupons();

    return () => {
      isMounted = false;
    };
  }, []);

  if (coupons.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 py-8 border-b border-[#2b2a27]">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5">
          <h2 className="font-['Orbitron'] text-xl sm:text-2xl tracking-wider uppercase">
            Exclusive <span className="text-[#c2202f]">Offers</span>
          </h2>
          <p className="text-sm text-[#999999] mt-2">
            Save more on your favourite supplements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="border border-[#2b2a27] bg-[#111111] p-5 hover:border-[#c2202f] transition-colors"
            >
              <p className="text-xs uppercase tracking-widest text-[#c2202f]">
                Special Offer
              </p>

              <h3 className="text-2xl font-bold text-white mt-2">
                {coupon.discount_type === "percentage"
                  ? `${coupon.discount_value}% OFF`
                  : `₹${coupon.discount_value} OFF`}
              </h3>

              {coupon.homepage_message && (
  <p className="text-sm text-gray-400 mt-2">
    {coupon.homepage_message}
  </p>
)}

              <p className="text-xs text-gray-500 mt-2">
                Minimum order: ₹
                {(coupon.min_order_value_paise / 100).toLocaleString("en-IN")}
              </p>

              <div className="flex items-center justify-between mt-5 gap-3">
                <div className="border border-dashed border-[#c2202f] px-4 py-2">
                  <span className="font-bold tracking-widest text-[#c2202f]">
                    {coupon.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(coupon.code);
                    } catch (error) {
                      console.error("Coupon copy failed:", error);
                    }
                  }}
                  className="text-xs font-semibold text-white hover:text-[#c2202f]"
                >
                  COPY CODE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
