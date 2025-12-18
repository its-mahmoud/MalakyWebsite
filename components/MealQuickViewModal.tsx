"use client";

import { X, Plus, Minus } from "lucide-react";
import { useMealQuickView } from "@/context/MealQuickViewContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

/* ================= Types ================= */

type MenuItemImage = {
  image_url: string;
};

type OptionValue = {
  value: string;
  label: string;
  priceModifier: number;
};

type MealOption = {
  id: string;
  label: string;
  values: OptionValue[];
};

type Meal = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  options: MealOption[] | null;
  menu_item_images: MenuItemImage[] | null;
};

type SelectedOptions = Record<string, string>;

export default function MealQuickViewModal() {
  const { mealId, closeMeal } = useMealQuickView();
  const { addToCart } = useCart();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  /* ================= Reset on open ================= */
  useEffect(() => {
    if (!mealId) return;

    setQuantity(1);
    setNotes("");
    setSelectedOptions({});
  }, [mealId]);

  /* ================= Fetch meal ================= */
  useEffect(() => {
    if (!mealId) return;

    supabase
      .from("menu_items")
      .select(
        "id, name, price, description, options, menu_item_images(image_url)"
      )
      .eq("id", mealId)
      .single()
      .then(({ data }) => {
        if (data) setMeal(data as Meal);
      });
  }, [mealId]);

  /* ================= Default options ================= */
  useEffect(() => {
    if (!meal?.options) return;

    const defaults: SelectedOptions = {};

    meal.options.forEach((opt) => {
      if (opt.values.length > 0) {
        defaults[opt.id] = opt.values[0].value;
      }
    });

    setSelectedOptions(defaults);
  }, [meal]);

  if (!mealId || !meal) return null;

  /* ================= Prices ================= */
  const optionsPrice =
    meal.options?.reduce((sum, opt) => {
      const selectedValue = selectedOptions[opt.id];
      const found = opt.values.find((v) => v.value === selectedValue);
      return sum + (found?.priceModifier ?? 0);
    }, 0) ?? 0;

  const totalPrice = (meal.price + optionsPrice) * quantity;

  return (
  <>
    {/* Overlay */}
    <div
      onClick={closeMeal}
      className="fixed inset-0 bg-black/40 z-[1000]"
    />

    {/* Modal */}
    <div className="fixed inset-0 z-[1100] flex items-center justify-center px-4">
      <div
        dir="rtl"
        className="
          w-full max-w-5xl
          bg-white rounded-2xl shadow-2xl
          grid grid-cols-1 md:grid-cols-2
          overflow-hidden
        "
      >
        {/* ================= Image Side ================= */}
        <div className="relative bg-gray-100 flex items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden">
            <img
              src={
                meal.menu_item_images?.[0]?.image_url ||
                '/images/fallbackimage.jpg'
              }
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ================= Content Side ================= */}
        <div className="p-6 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-extrabold mb-1">
                {meal.name}
              </h3>

              <span className="inline-block text-xs bg-red-100 text-[#DC2B3F] px-2 py-1 rounded-full">
                وجبات فردية
              </span>
            </div>

            <button
              onClick={closeMeal}
              className="text-gray-400 hover:text-black"
            >
              <X size={22} />
            </button>
          </div>

          {/* Description */}
          {meal.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
              {meal.description}
            </p>
          )}

          {/* Options */}
          <div className="flex-1">
            {meal.options?.map((option) => (
              <div key={option.id} className="mb-4">
                <h4 className="font-bold text-sm mb-2">
                  {option.label}
                </h4>

                <div className="flex flex-wrap gap-2">
                  {option.values.map((v) => (
                    <button
                      key={v.value}
                      onClick={() =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [option.id]: v.value,
                        }))
                      }
                      className={`px-3 py-1 rounded-lg border text-sm transition
                        ${
                          selectedOptions[option.id] === v.value
                            ? 'border-[#DC2B3F] bg-[#DC2B3F]/10 text-[#DC2B3F]'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      {v.label}
                      {v.priceModifier > 0 && (
                        <span className="text-xs mr-1">
                          +{v.priceModifier} ₪
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات على الطلب"
            className="w-full border rounded-xl p-3 text-sm mb-4 resize-none"
          />

          {/* Bottom Bar */}
          <div className="flex items-center gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <Minus size={16} />
              </button>

              <span className="font-bold w-6 text-center">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 bg-[#DC2B3F] text-white rounded-lg flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => {
                addToCart({
                  mealId: meal.id,
                  name: meal.name,
                  image:
                    meal.menu_item_images?.[0]?.image_url ||
                    '/images/fallbackimage.jpg',
                  quantity,
                  notes,
                  basePrice: meal.price,
                  optionsPrice,
                  options: Object.entries(selectedOptions).map(
                    ([optionId, value]) => {
                      const option = meal.options?.find(
                        (o) => o.id === optionId
                      );
                      const selectedValue = option?.values.find(
                        (v) => v.value === value
                      );

                      return {
                        optionId,
                        value,
                        label: selectedValue?.label ?? value,
                      };
                    }
                  ),
                });

                closeMeal();
              }}
              className="flex-1 bg-[#DC2B3F] text-white py-3 rounded-xl font-bold"
            >
              إضافة • {totalPrice} ₪
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};