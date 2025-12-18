"use client";

import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/context/CartUIContext";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { items, removeFromCart, clearCart, updateQuantity } = useCart();
  const { open, closeCart } = useCartUI();

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <>
      {open && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/40 z-[900]"
        />
      )}

      <div
        dir="rtl"
        className={`
          fixed top-0 left-0 h-full
          w-[90%] sm:w-[420px]
          bg-white z-[1000] shadow-2xl
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={20} />
            السلة
          </h2>
          <button onClick={closeCart}>
            <X />
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {items.length === 0 && (
            <p className="text-center text-gray-500">السلة فارغة</p>
          )}

          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 flex gap-3">
              <img
                src={item.image || "/images/fallbackimage.jpg"}
                className="w-16 h-16 rounded object-cover"
                alt={item.name}
              />

              <div className="flex-1">
                <h4 className="font-bold text-sm">{item.name}</h4>

                {/* Options */}
                {item.options.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {item.options.map((opt, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-600 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 bg-[#DC2B3F] rounded-full" />
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}

                {/* quantity controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 bg-[#DC2B3F] text-white rounded flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>

                  <span className="text-sm font-bold w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 bg-[#DC2B3F] text-white rounded flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>
                </div>

                {item.notes && (
                  <p className="text-xs text-gray-500 mt-2">📝 {item.notes}</p>
                )}

                <p className="text-sm font-bold text-[#DC2B3F] mt-2">
                  {item.totalPrice} ₪
                </p>
              </div>

              <button onClick={() => removeFromCart(item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer (مثبّت) */}
        <div className="border-t p-4">
          <div className="flex justify-between font-bold mb-4">
            <span>المجموع</span>
            <span className="text-[#DC2B3F]">{total} ₪</span>
          </div>

          <button
            onClick={() => {
              closeCart();
              router.push("/cart"); // ✅ بدل ما نكمّل من الدروار
            }}
            className="w-full bg-[#DC2B3F] text-white py-3 rounded-lg"
          >
            إتمام الطلب
          </button>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full mt-2 text-sm text-gray-500"
            >
              تفريغ السلة
            </button>
          )}
        </div>
      </div>
    </>
  );
}
