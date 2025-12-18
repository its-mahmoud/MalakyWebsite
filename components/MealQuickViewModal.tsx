"use client";

import { X, Plus, Minus } from "lucide-react";
import { useMealQuickView } from "@/context/MealQuickViewContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function MealQuickViewModal() {
  const { mealId, closeMeal } = useMealQuickView();
  const { addToCart } = useCart();

  const [meal, setMeal] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    if (!mealId) return;

    // إعادة تعيين الحالة عند فتح المودال
    setQuantity(1);
    setNotes("");
    setSelectedOptions({});
  }, [mealId]);

  useEffect(() => {
    if (!mealId) return;

    supabase
      .from("menu_items")
      .select(
        "id, name, price, description, options, menu_item_images(image_url)"
      )
      .eq("id", mealId)
      .single()
      .then(({ data }) => setMeal(data));
  }, [mealId]);

  if (!mealId || !meal) return null;

  // ===== حساب سعر الإضافات =====
  const optionsPrice =
    meal.options?.reduce((sum: number, opt: any) => {
      const selected = selectedOptions[opt.id];
      const found = opt.values.find((v: any) => v.value === selected);
      return sum + (found?.priceModifier || 0);
    }, 0) || 0;

  const totalPrice = (meal.price + optionsPrice) * quantity;

  return (
    <>
      {/* Overlay */}
      <div onClick={closeMeal} className="fixed inset-0 bg-black/40 z-[1000]" />

      {/* Modal (Centered) */}
      <div className="fixed inset-0 z-[1100] flex items-center justify-center">
        <div
          dir="rtl"
          className="w-[90%] max-w-[420px] bg-white rounded-2xl shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">{meal.name}</h3>
            <button onClick={closeMeal}>
              <X />
            </button>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-square overflow-hidden rounded-xl mb-4 bg-gray-100">
            <img
              src={
                meal.menu_item_images?.[0]?.image_url ||
                "/images/fallbackimage.jpg"
              }
              className="absolute inset-0 w-full h-full object-cover"
              alt={meal.name}
            />
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">{meal.description}</p>

          {/* Options */}
          {meal.options?.map((option: any) => (
            <div key={option.id} className="mb-4">
              <h4 className="font-bold text-sm mb-2">{option.label}</h4>

              <div className="flex flex-wrap gap-2">
                {option.values.map((v: any) => (
                  <button
                    key={v.value}
                    onClick={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [option.id]: v.value,
                      }))
                    }
                    className={`px-3 py-1 rounded-lg border text-sm ${
                      selectedOptions[option.id] === v.value
                        ? "border-[#DC2B3F] bg-[#DC2B3F]/10 text-[#DC2B3F]"
                        : "border-gray-200"
                    }`}
                  >
                    {v.label}
                    {v.priceModifier > 0 && (
                      <span className="text-xs mr-1">+{v.priceModifier} ₪</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 bg-[#DC2B3F] text-white rounded flex items-center justify-center"
            >
              <Plus size={16} />
            </button>

            <span className="font-bold">{quantity}</span>

            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 bg-[#DC2B3F] text-white rounded flex items-center justify-center"
            >
              <Minus size={16} />
            </button>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات على الطلب"
            className="w-full border rounded-lg p-2 text-sm mb-4"
          />

          {/* Add to Cart */}
          <button
            onClick={() => {
              addToCart({
                mealId: meal.id,
                name: meal.name,
                image:
                  meal.menu_item_images?.[0]?.image_url ||
                  "/images/fallbackimage.jpg",

                quantity,
                notes,

                options: Object.entries(selectedOptions).map(
                  ([optionId, value]) => {
                    const option = meal.options?.find(
                      (o: any) => o.id === optionId
                    );
                    const selectedValue = option?.values.find(
                      (v: any) => v.value === value
                    );

                    return {
                      optionId,
                      value,
                      label: selectedValue?.label || value,
                    };
                  }
                ),

                basePrice: meal.price,
                optionsPrice, 
              });

              closeMeal();
            }}
            className="w-full bg-[#DC2B3F] text-white py-3 rounded-xl font-bold"
          >
            إضافة • {totalPrice} ₪
          </button>
        </div>
      </div>
    </>
  );
}
