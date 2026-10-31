
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartProduct = {
  id: string;
  name: string;
  brand: string;
  sku?: string | null;
  price: number;
  mrp?: number;
  imageUrl?: string;
  inStock: boolean;
  stockQuantity?: number | null;
  quantity: number;
};

type CartContextType = {
  items: CartProduct[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Omit<CartProduct, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "thedietstore_cart";
const MAX_QTY = 10;

const CartContext = createContext<CartContextType | undefined>(undefined);

function getStockLimit(product: {
  inStock: boolean;
  stockQuantity?: number | null;
}) {
  if (!product.inStock) return 0;

  const stock = product.stockQuantity;

  // If inventory is supplied, use it as the actual limit.
  if (stock !== null && stock !== undefined && Number.isFinite(Number(stock))) {
    return Math.max(0, Math.min(MAX_QTY, Math.floor(Number(stock))));
  }

  // Fallback until the product's inventory is passed from the database.
  return MAX_QTY;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item): item is CartProduct =>
          item &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          Number.isFinite(Number(item.price)) &&
          Number(item.price) > 0 &&
          Number.isInteger(Number(item.quantity)) &&
          Number(item.quantity) > 0
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [items]);

  const addToCart = useCallback(
    (product: Omit<CartProduct, "quantity">, quantity = 1) => {
      const stockLimit = getStockLimit(product);

      if (
        stockLimit <= 0 ||
        !Number.isFinite(product.price) ||
        product.price <= 0
      ) {
        return;
      }

      const safeQuantity = Math.max(1, Math.floor(quantity));

      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);

        if (existing) {
          const newQuantity = Math.min(
            stockLimit,
            existing.quantity + safeQuantity
          );

          return current.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  ...product,
                  quantity: newQuantity,
                }
              : item
          );
        }

        return [
          ...current,
          {
            ...product,
            quantity: Math.min(stockLimit, safeQuantity),
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const safeQuantity = Math.floor(quantity);

    if (safeQuantity <= 0) {
      setItems((current) => current.filter((item) => item.id !== id));
      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const stockLimit = getStockLimit(item);

        return {
          ...item,
          quantity: Math.min(stockLimit, safeQuantity),
        };
      })
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
