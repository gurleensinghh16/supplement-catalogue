
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Search,
    RefreshCw,
    ShoppingBag,
    IndianRupee,
    Clock3,
    CheckCircle2,
    MapPin,
    Phone,
    Mail,
    Package,
    ShieldAlert,
    LogOut,
} from "lucide-react";

type OrderStatus = "created" | "paid" | "failed";
type StatusFilter = "all" | OrderStatus;

type Order = {
    id: string;
    product_id: string;
    product_name: string | null;
    quantity: number;
    amount_paise: number;
    currency: string;
    status: OrderStatus;
    razorpay_order_id: string;
    razorpay_payment_id: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    created_at: string;
    paid_at: string | null;
    name: string | null;
    phone: string | null;
    email: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
};

const money = (paise: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format((Number(paise) || 0) / 100);

const dateTime = (value: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const statusStyles: Record<OrderStatus, string> = {
    created:
        "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    paid:
        "bg-green-500/10 text-green-400 border border-green-500/20",
    failed:
        "bg-[#c2202f]/10 text-[#c2202f] border border-[#c2202f]/20",
};

function StatusBadge({ status }: { status: string }) {
    const validStatus: OrderStatus =
        status === "paid" || status === "failed" ? status : "created";

    return (
        <Badge
            className={`${statusStyles[validStatus]} rounded-none px-2 py-1 text-[10px] uppercase tracking-wider`}
        >
            {validStatus}
        </Badge>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    icon: typeof ShoppingBag;
}) {
    return (
        <div className="border border-[#2b2a27] bg-[#0a0a0a] p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-[#999999]">
                    {title}
                </p>
                <Icon className="h-4 w-4 text-[#c2202f]" />
            </div>
            <p className="mt-3 font-['Orbitron'] text-2xl text-white">
                {value}
            </p>
        </div>
    );
}

export default function Orders() {
    const navigate = useNavigate();
    const {
        isLoading: authLoading,
        isAuthenticated,
        signOut,
    } = useAuth();

    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [errorMessage, setErrorMessage] = useState("");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Verify that the signed-in user is either a regular admin
    // or a separately authorized Orders admin.
    useEffect(() => {
        let active = true;

        async function checkAdmin() {
            if (authLoading) return;

            setCheckingAdmin(true);
            setIsAdmin(false);
            setOrders([]);
            setErrorMessage("");

            if (!isAuthenticated) {
                setCheckingAdmin(false);
                return;
            }

            try {
                const [adminResult, ordersAdminResult] = await Promise.all([
                    supabase.rpc("is_admin"),
                    supabase.rpc("is_orders_admin"),
                ]);

                if (adminResult.error || ordersAdminResult.error) {
                    console.error(
                        "Authorization check failed:",
                        adminResult.error || ordersAdminResult.error
                    );

                    if (active) {
                        setErrorMessage(
                            "Could not verify access. Check your Supabase authorization functions and permissions."
                        );
                    }

                    return;
                }

                if (active) {
                    setIsAdmin(
                        adminResult.data === true ||
                        ordersAdminResult.data === true
                    );
                }
            } catch (error) {
                console.error("Authorization check failed:", error);

                if (active) {
                    setErrorMessage(
                        "Could not verify access. Please try again."
                    );
                }
            } finally {
                if (active) {
                    setCheckingAdmin(false);
                }
            }
        }

        void checkAdmin();

        return () => {
            active = false;
        };
    }, [authLoading, isAuthenticated]);

    const fetchOrders = useCallback(async () => {
        if (!isAdmin) return;

        setLoadingOrders(true);
        setErrorMessage("");

        try {
            const { data, error } = await supabase
                .from("orders")
                .select(
                    [
                        "id",
                        "product_id",
                        "product_name",
                        "quantity",
                        "amount_paise",
                        "currency",
                        "status",
                        "razorpay_order_id",
                        "razorpay_payment_id",
                        "customer_email",
                        "customer_phone",
                        "created_at",
                        "paid_at",
                        "name",
                        "phone",
                        "email",
                        "address1",
                        "address2",
                        "city",
                        "state",
                        "pincode",
                    ].join(",")
                )
                .order("created_at", { ascending: false });

            if (error) throw error;

            setOrders((data ?? []) as unknown as Order[]);
        } catch (error) {
            console.error("Failed to load orders:", error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to load orders. Check your Supabase permissions."
            );
        } finally {
            setLoadingOrders(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            void fetchOrders();
        }
    }, [isAdmin, refreshKey, fetchOrders]);

    const filteredOrders = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesStatus =
                statusFilter === "all" || order.status === statusFilter;

            const searchable = [
                order.id,
                order.product_id,
                order.product_name ?? "",
                order.razorpay_order_id,
                order.razorpay_payment_id ?? "",
                order.name ?? "",
                order.email ?? "",
                order.customer_email ?? "",
                order.phone ?? "",
                order.customer_phone ?? "",
                order.pincode ?? "",
            ];

            const matchesSearch =
                !query ||
                searchable.some((value) =>
                    value.toLowerCase().includes(query)
                );

            return matchesStatus && matchesSearch;
        });
    }, [orders, searchQuery, statusFilter]);

    const paidOrders = useMemo(
        () => orders.filter((order) => order.status === "paid"),
        [orders]
    );

    const pendingOrders = useMemo(
        () => orders.filter((order) => order.status === "created"),
        [orders]
    );

    const failedOrders = useMemo(
        () => orders.filter((order) => order.status === "failed"),
        [orders]
    );

    const totalRevenue = paidOrders.reduce(
        (sum, order) => sum + (Number(order.amount_paise) || 0),
        0
    );

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/admin");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Unable to sign out. Please try again.");
        }
    };

    if (authLoading || checkingAdmin) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-sm text-[#999999]">
                    Verifying access...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
                <div className="max-w-sm text-center">
                    <ShieldAlert className="h-10 w-10 text-[#c2202f] mx-auto mb-4" />

                    <h1 className="font-['Orbitron'] text-xl uppercase tracking-wider">
                        Sign In Required
                    </h1>

                    <p className="text-sm text-[#999999] mt-3">
                        Sign in through the admin panel to continue.
                    </p>

                    <Button
                        onClick={() => navigate("/admin")}
                        className="mt-6 bg-[#c2202f] text-white hover:bg-[#de3746]"
                    >
                        Go to Admin Login
                    </Button>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <ShieldAlert className="h-10 w-10 text-[#c2202f] mx-auto mb-4" />

                    <h1 className="font-['Orbitron'] text-xl uppercase tracking-wider">
                        Access Denied
                    </h1>

                    <p className="text-sm text-[#999999] mt-3">
                        Your account does not have permission to view customer orders.
                    </p>

                    {errorMessage && (
                        <p className="text-xs text-amber-400 mt-4 break-words">
                            {errorMessage}
                        </p>
                    )}

                    <div className="mt-6 flex justify-center gap-3">
                        <Button
                            onClick={() => setRefreshKey((key) => key + 1)}
                            variant="outline"
                            className="border-[#2b2a27] bg-[#111111] text-white hover:bg-[#222222]"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>

                        <Button
                            onClick={() => navigate("/admin")}
                            className="bg-[#c2202f] text-white hover:bg-[#de3746]"
                        >
                            Product Management
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="sticky top-0 z-40 border-b border-[#2b2a27] bg-black/90 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <span className="font-['Orbitron'] text-sm sm:text-base tracking-[0.12em] uppercase">
                            TheDietStore
                        </span>

                        <Badge className="bg-[#c2202f]/10 text-[#c2202f] border border-[#c2202f]/20 text-[10px]">
                            Orders
                        </Badge>
                    </button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/admin")}
                            className="text-[#999999] hover:text-white hover:bg-[#111111]"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Products</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-[#999999] hover:text-white hover:bg-[#111111]"
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-['Orbitron'] text-2xl font-normal tracking-[0.12em] uppercase">
                            Orders Dashboard
                        </h1>

                        <p className="mt-2 text-sm text-[#999999]">
                            Review customer orders, payment statuses, and delivery details.
                        </p>
                    </div>

                    <Button
                        onClick={() => setRefreshKey((key) => key + 1)}
                        disabled={loadingOrders}
                        className="bg-[#c2202f] text-white hover:bg-[#de3746]"
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${loadingOrders ? "animate-spin" : ""}`}
                        />
                        Refresh Orders
                    </Button>
                </div>

                {errorMessage && (
                    <div className="mb-6 border border-[#c2202f]/30 bg-[#c2202f]/5 p-4">
                        <p className="text-sm text-[#ff737d]">
                            Could not load orders: {errorMessage}
                        </p>

                        <p className="text-xs text-[#999999] mt-2">
                            Confirm that your authorization functions and orders SELECT policy are configured correctly in Supabase.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Orders"
                        value={orders.length}
                        icon={ShoppingBag}
                    />

                    <StatCard
                        title="Paid Orders"
                        value={paidOrders.length}
                        icon={CheckCircle2}
                    />

                    <StatCard
                        title="Awaiting Payment"
                        value={pendingOrders.length}
                        icon={Clock3}
                    />

                    <StatCard
                        title="Paid Revenue"
                        value={money(totalRevenue)}
                        icon={IndianRupee}
                    />
                </div>

                <div className="mb-5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />

                        <Input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search order, product, customer, phone..."
                            className="h-10 pl-9 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/60"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                ["all", "All Orders"],
                                ["created", "Created"],
                                ["paid", "Paid"],
                                ["failed", "Failed"],
                            ] as [StatusFilter, string][]
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => setStatusFilter(value)}
                                className={`px-3 py-2 text-xs uppercase tracking-wider border transition-colors ${statusFilter === value
                                    ? "border-[#c2202f] bg-[#c2202f]/10 text-white"
                                    : "border-[#2b2a27] bg-[#0a0a0a] text-[#999999] hover:text-white"
                                    }`}
                            >
                                {label}
                                {value === "all"
                                    ? ` (${orders.length})`
                                    : ` (${orders.filter((order) => order.status === value).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {loadingOrders && orders.length === 0 ? (
                    <div className="border border-[#2b2a27] py-20 text-center text-sm text-[#999999]">
                        Loading orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="border border-[#2b2a27] bg-[#0a0a0a] py-20 px-6 text-center">
                        <Package className="h-10 w-10 text-[#999999]/30 mx-auto mb-4" />

                        <h2 className="font-['Orbitron'] text-sm uppercase tracking-wider">
                            No Orders Found
                        </h2>

                        <p className="mt-2 text-sm text-[#999999]">
                            {orders.length === 0
                                ? "Orders will appear here after they are recorded in Supabase."
                                : "Try changing your search or status filter."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const isExpanded = expandedOrder === order.id;
                            const customerEmail = order.email || order.customer_email;
                            const customerPhone = order.phone || order.customer_phone;
                            const customerName = order.name || "Customer name unavailable";

                            const address = [
                                order.address1,
                                order.address2,
                                order.city,
                                order.state,
                                order.pincode,
                            ].filter(Boolean);

                            return (
                                <section
                                    key={order.id}
                                    className="border border-[#2b2a27] bg-[#080808]"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedOrder(
                                                isExpanded ? null : order.id
                                            )
                                        }
                                        aria-expanded={isExpanded}
                                        className="w-full text-left p-4 sm:p-5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="font-['Orbitron'] text-sm text-white">
                                                        {order.product_name ||
                                                            `Product ${order.product_id}`}
                                                    </span>

                                                    <StatusBadge status={order.status} />
                                                </div>

                                                <p className="text-xs text-[#999999] mt-2 break-all">
                                                    Order: {order.razorpay_order_id}
                                                </p>

                                                <p className="text-xs text-[#999999]/70 mt-1">
                                                    {dateTime(order.created_at)}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between xl:justify-end gap-5">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-[#999999]">
                                                        Quantity
                                                    </p>

                                                    <p className="mt-1 text-sm text-white">
                                                        {order.quantity}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase tracking-wider text-[#999999]">
                                                        Order Amount
                                                    </p>

                                                    <p className="mt-1 font-['Orbitron'] text-base text-white">
                                                        {money(order.amount_paise, order.currency)}
                                                    </p>
                                                </div>

                                                <span className="text-xs text-[#999999]">
                                                    {isExpanded ? "−" : "+"}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-[#2b2a27] p-4 sm:p-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-xs uppercase tracking-wider text-[#c2202f] mb-4">
                                                        Customer Details
                                                    </h3>

                                                    <p className="text-sm text-white font-medium">
                                                        {customerName}
                                                    </p>

                                                    <p className="flex items-start gap-2 text-sm text-[#999999] mt-3 break-all">
                                                        <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                                                        {customerEmail || "Email unavailable"}
                                                    </p>

                                                    <p className="flex items-start gap-2 text-sm text-[#999999] mt-3">
                                                        <Phone className="h-4 w-4 shrink-0 mt-0.5" />
                                                        {customerPhone || "Phone unavailable"}
                                                    </p>

                                                    <div className="mt-5">
                                                        <h4 className="text-xs uppercase tracking-wider text-[#999999] mb-2">
                                                            Delivery Address
                                                        </h4>

                                                        <p className="flex items-start gap-2 text-sm text-[#cccccc]">
                                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#c2202f]" />
                                                            <span>
                                                                {address.length
                                                                    ? address.join(", ")
                                                                    : "Address unavailable"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-xs uppercase tracking-wider text-[#c2202f] mb-4">
                                                        Payment Details
                                                    </h3>

                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-[#999999]">Product ID</span>
                                                            <span className="text-white break-all text-right">
                                                                {order.product_id}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-[#999999]">Quantity</span>
                                                            <span className="text-white">
                                                                {order.quantity}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-[#999999]">Payment Status</span>
                                                            <StatusBadge status={order.status} />
                                                        </div>

                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-[#999999]">Payment ID</span>
                                                            <span className="text-white text-right break-all max-w-[65%]">
                                                                {order.razorpay_payment_id || "Not available"}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-[#999999]">Paid At</span>
                                                            <span className="text-white text-right">
                                                                {dateTime(order.paid_at)}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-[#999999]">Order Record ID</span>
                                                            <span className="text-white text-right break-all max-w-[65%]">
                                                                {order.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}

                <div className="mt-5 flex items-center justify-between text-xs text-[#999999]">
                    <span>
                        Showing {filteredOrders.length} of {orders.length} orders
                    </span>

                    <button
                        onClick={() => navigate("/admin")}
                        className="hover:text-white transition-colors"
                    >
                        Back to Product Management →
                    </button>
                </div>
            </main>
        </div>
    );
}
