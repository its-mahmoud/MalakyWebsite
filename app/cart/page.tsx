"use client";

import { useCart } from "@/context/CartContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F5F5]">
      <Navbar variant="floating" />

      <main className="max-w-4xl mx-auto px-4 py-10 mt-14">
        <h1 className="text-3xl font-extrabold mb-6">سلة الطلب</h1>

        {items.length === 0 ? (
          <p className="text-center text-gray-500">السلة فارغة</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow flex gap-4"
                >
                  <img
                    src={item.image}
                    className="w-20 h-20 rounded object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>

                    {/* Options */}
                    {item.options.length > 0 && (
                      <ul className="text-sm text-gray-600 mt-1">
                        {item.options.map((opt) => (
                          <li key={opt.optionId}>• {opt.label}</li>
                        ))}
                      </ul>
                    )}

                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        📝 {item.notes}
                      </p>
                    )}

                    {/* Quantity Row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        {/* Minus */}
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-[#DC2B3F] text-white rounded-md flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>

                        {/* Quantity */}
                        <div className="w-10 h-8 border rounded-md flex items-center justify-center font-bold">
                          {item.quantity}
                        </div>

                        {/* Plus */}
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-[#DC2B3F] text-white rounded-md flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Delete (Opposite Side) */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 border rounded-md flex items-center justify-center text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="font-bold text-[#DC2B3F] whitespace-nowrap">
                    {item.totalPrice} ₪
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow h-fit">
              <h2 className="font-bold text-lg mb-4">ملخص الطلب</h2>

              <div className="flex justify-between mb-2">
                <span>المجموع</span>
                <span>{subtotal} ₪</span>
              </div>

              {/* لاحقًا */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>التوصيل</span>
                <span>—</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between font-extrabold text-lg">
                <span>الإجمالي</span>
                <span className="text-[#DC2B3F]">{subtotal} ₪</span>
              </div>

              <button
                onClick={() => router.push("/cart/checkout")}
                className="w-full bg-[#DC2B3F] text-white py-3 rounded-lg font-bold"
              >
                تأكيد الطلب
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
