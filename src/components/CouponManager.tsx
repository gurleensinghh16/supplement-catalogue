
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Plus,
  Trash2,
  X,
  Save,
  RefreshCw,
} from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value_paise: number;
  min_item_count: number;
  max_discount_paise: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

type CouponForm = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_value: string;
  min_item_count: string;
  max_discount: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

const INITIAL_FORM: CouponForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_value: "20000",
  min_item_count: "2",
  max_discount: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

function formatRupees(paise: number | null): string {
  if (paise === null) return "No limit";

  return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function toLocalDateTime(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>({ ...INITIAL_FORM });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Coupon fetch error:", fetchError);
      setError(fetchError.message);
      setCoupons([]);
    } else {
      setCoupons((data ?? []) as Coupon[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCoupons();
  }, [fetchCoupons]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...INITIAL_FORM });
    setError("");
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...INITIAL_FORM });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (coupon: Coupon) => {
    setEditingId(coupon.id);

    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_value: String(
        Number(coupon.min_order_value_paise) / 100
      ),
      min_item_count: String(coupon.min_item_count),
      max_discount:
        coupon.max_discount_paise === null
          ? ""
          : String(Number(coupon.max_discount_paise) / 100),
      starts_at: toLocalDateTime(coupon.starts_at),
      expires_at: toLocalDateTime(coupon.expires_at),
      is_active: coupon.is_active,
    });

    setError("");
    setShowForm(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const code = form.code.trim().toUpperCase();
    const discountValue = Number(form.discount_value);
    const minOrder = Number(form.min_order_value);
    const minItems = Number(form.min_item_count);

    const maxDiscount =
      form.max_discount.trim() === ""
        ? null
        : Number(form.max_discount);

    // Validate coupon code.
    if (!/^[A-Z0-9_-]{3,50}$/.test(code)) {
      setError(
        "Use 3–50 characters for the coupon code. Only letters, numbers, _ and - are allowed."
      );
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setError("Enter a valid discount value.");
      return;
    }

    if (
      form.discount_type === "percentage" &&
      discountValue > 100
    ) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (!Number.isFinite(minOrder) || minOrder < 0) {
      setError("Enter a valid minimum order value.");
      return;
    }

    if (!Number.isInteger(minItems) || minItems < 1) {
      setError("Minimum total units must be at least 1.");
      return;
    }

    if (
      maxDiscount !== null &&
      (!Number.isFinite(maxDiscount) || maxDiscount <= 0)
    ) {
      setError("Maximum discount must be a positive amount.");
      return;
    }

    // Validate dates.
    const startsAtDate = form.starts_at
      ? new Date(form.starts_at)
      : null;

    const expiresAtDate = form.expires_at
      ? new Date(form.expires_at)
      : null;

    if (
      startsAtDate &&
      Number.isNaN(startsAtDate.getTime())
    ) {
      setError("Invalid start date.");
      return;
    }

    if (
      expiresAtDate &&
      Number.isNaN(expiresAtDate.getTime())
    ) {
      setError("Invalid expiry date.");
      return;
    }

    if (
      startsAtDate &&
      expiresAtDate &&
      expiresAtDate.getTime() <= startsAtDate.getTime()
    ) {
      setError("Expiry date must be later than the start date.");
      return;
    }

    const payload = {
      code,
      discount_type: form.discount_type,
      discount_value: discountValue,
      min_order_value_paise: Math.round(minOrder * 100),
      min_item_count: minItems,
      max_discount_paise:
        maxDiscount === null
          ? null
          : Math.round(maxDiscount * 100),
      starts_at: startsAtDate
        ? startsAtDate.toISOString()
        : null,
      expires_at: expiresAtDate
        ? expiresAtDate.toISOString()
        : null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from("coupons")
          .update(payload)
          .eq("id", editingId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("coupons")
          .insert(payload);

        if (insertError) throw insertError;
      }

      closeForm();
      await fetchCoupons();
    } catch (err) {
      console.error("Coupon save error:", err);

      const message =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Could not save coupon.";

      setError(
        message.includes("duplicate key") || message.includes("23505")
          ? "This coupon code already exists."
          : message
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    const { error: updateError } = await supabase
      .from("coupons")
      .update({
        is_active: !coupon.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", coupon.id);

    if (updateError) {
      alert(`Could not update coupon: ${updateError.message}`);
      return;
    }

    await fetchCoupons();
  };

  const deleteCoupon = async (coupon: Coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${coupon.code}?`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("coupons")
      .delete()
      .eq("id", coupon.id);

    if (deleteError) {
      alert(`Could not delete coupon: ${deleteError.message}`);
      return;
    }

    await fetchCoupons();
  };

  return (
    <section className="mb-10 border border-[#2b2a27] bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-[#2b2a27]">
        <div>
          <h2 className="font-['Orbitron'] text-base tracking-[0.15em] uppercase text-white">
            Coupon Management
          </h2>

          <p className="text-xs text-[#999999] mt-2">
            Create and manage customer discount coupons.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateForm}
          className="bg-[#c2202f] text-white hover:bg-[#de3746]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="p-6 border-b border-[#2b2a27]"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {editingId ? "Edit Coupon" : "Create New Coupon"}
            </h3>

            <button
              type="button"
              onClick={closeForm}
              className="text-[#999999] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Coupon code */}
            <div>
              <label className="text-xs text-[#999999]">
                Coupon Code *
              </label>

              <Input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="SAVE20"
                maxLength={50}
                className="mt-1 bg-[#111111] border-[#2b2a27] text-white"
                required
              />
            </div>

            {/* Discount type */}
            <div>
              <label className="text-xs text-[#999999]">
                Discount Type *
              </label>

              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount_type: e.target.value as "percentage" | "fixed",
                  })
                }
                className="mt-1 w-full h-10 px-3 bg-[#111111] border border-[#2b2a27] text-white text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            {/* Discount value */}
            <div>
              <label className="text-xs text-[#999999]">
                Discount Value *
              </label>

              <Input
                type="number"
                min="0.01"
                max={form.discount_type === "percentage" ? 100 : undefined}
                step="0.01"
                value={form.discount_value}
                onChange={(e) =>
                  setForm({ ...form, discount_value: e.target.value })
                }
                placeholder={
                  form.discount_type === "percentage" ? "10" : "500"
                }
                className="mt-1 bg-[#111111] border-[#2b2a27] text-white"
                required
              />
            </div>

            {/* Minimum order */}
            <div>
              <label className="text-xs text-[#999999]">
                Minimum Order Value (₹) *
              </label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.min_order_value}
                onChange={(e) =>
                  setForm({ ...form, min_order_value: e.target.value })
                }
                className="mt-1 bg-[#111111] border-[#2b2a27] text-white"
                required
              />
            </div>

            {/* Minimum units */}
            <div>
              <label className="text-xs text-[#999999]">
                Minimum Total Units *
              </label>

              <Input
                type="number"
                min="1"
                step="1"
                value={form.min_item_count}
                onChange={(e) =>
                  setForm({ ...form, min_item_count: e.target.value })
                }
                className="mt-1 bg-[#111111] border-[#2b2a27] text-white"
                required
              />

              <p className="text-[10px] text-[#777777] mt-1">
                Two units of the same product also count as two.
              </p>
            </div>

            {/* Maximum discount */}
            <div>
              <label className="text-xs text-[#999999]">
                Maximum Discount (₹)
              </label>

              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.max_discount}
                onChange={(e) =>
                  setForm({ ...form, max_discount: e.target.value })
                }
                placeholder="Optional"
                className="mt-1 bg-[#111111] border-[#2b2a27] text-white"
              />
            </div>

            {/* Start date */}
            <div>
              <label className="text-xs text-[#999999]">
                Start Date
              </label>

              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) =>
                  setForm({ ...form, starts_at: e.target.value })
                }
                className="mt-1 bg-[#111111] border-[#2b2a27] text-white"
              />
            </div>

            {/* Expiry */}
            <div>
              <label className="text-xs text-[#999999]">
                Expiry Date
              </label>

              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) =>
                  setForm({ ...form, expires_at: e.target.value })
                }
                className="mt-1 bg-[#111111] border-[#2b2a27] text-white"
              />
            </div>

            {/* Active */}
            <div className="flex items-center gap-3 pt-5">
              <input
                id="coupon-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4 accent-[#c2202f]"
              />

              <label
                htmlFor="coupon-active"
                className="text-sm text-white"
              >
                Coupon Active
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#c2202f] mt-4">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#c2202f] text-white hover:bg-[#de3746]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Coupon"
                  : "Create Coupon"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="border-[#2b2a27] text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Coupon List */}
      <div className="p-6">
        {error && !showForm && (
          <p className="text-sm text-[#c2202f] mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-[#999999]">
            Loading coupons...
          </p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-[#999999]">
            No coupons created yet. Create your first coupon.
          </p>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="border border-[#2b2a27] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white tracking-wider">
                      {coupon.code}
                    </h3>

                    <span
                      className={`text-[10px] uppercase px-2 py-1 border ${
                        coupon.is_active
                          ? "text-[#57a256] border-[#57a256]/30 bg-[#57a256]/10"
                          : "text-[#c2202f] border-[#c2202f]/30 bg-[#c2202f]/10"
                      }`}
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-sm text-[#cccccc] mt-2">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}% off`
                      : `₹${coupon.discount_value} off`}
                    {" · "}
                    Minimum order:{" "}
                    {formatRupees(coupon.min_order_value_paise)}
                    {" · "}
                    Minimum units: {coupon.min_item_count}
                  </p>

                  <p className="text-xs text-[#777777] mt-1">
                    Maximum discount:{" "}
                    {formatRupees(coupon.max_discount_paise)}
                    {" · "}
                    Expires:{" "}
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleString("en-IN")
                      : "No expiry"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(coupon)}
                    className="border-[#2b2a27] text-white"
                  >
                    {coupon.is_active ? "Deactivate" : "Activate"}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEditForm(coupon)}
                    className="border-[#2b2a27] text-white"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCoupon(coupon)}
                    className="border-[#2b2a27] text-[#c2202f]"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void fetchCoupons()}
            className="text-[#999999] hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Refresh Coupons
          </Button>
        </div>
      </div>
    </section>
  );
}
