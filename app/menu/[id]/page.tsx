"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, Minus, ArrowRight } from "lucide-react";

/* ================= Types ================= */

type OptionValue = {
  label: string;
  value: string;
  priceModifier: number;
};

type MealOption = {
  id: string;
  type: "single-select" | "multi-select";
  label: string;
  values: OptionValue[];
};

type Meal = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  options: MealOption[] | null;
  menu_item_images: { image_url: string }[];
};

/* ================= Page ================= */

export default function MealDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  /* ---------- Fetch meal ---------- */
  useEffect(() => {
    const fetchMeal = async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select(
          `
          id,
          name,
          description,
          price,
          options,
          menu_item_images ( image_url )
        `
        )
        .eq("id", id)
        .single();

      if (!error) setMeal(data);
      setLoading(false);
    };

    fetchMeal();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-40">جاري التحميل...</div>;
  }

  if (!meal) {
    return (
      <div className="text-center mt-40">
        <h2>الوجبة غير موجودة</h2>
        <button
          onClick={() => router.push("/menu")}
          className="text-[#DC2B3F] mt-4"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  /* ---------- Image ---------- */
  const image =
    meal.menu_item_images?.[0]?.image_url || "/images/fallbackimage.jpg";

  /* ---------- Price calculation ---------- */
  const optionsPrice =
    meal.options?.reduce((sum, option) => {
      const selected = selectedOptions[option.id];
      const value = option.values.find((v) => v.value === selected);
      return sum + (value?.priceModifier || 0);
    }, 0) || 0;

  const totalPrice = (meal.price + optionsPrice) * quantity;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F5F5]">
      <Navbar variant="floating" />

      <main className="max-w-6xl mx-auto px-4 py-10 mt-10">
        {/* Back */}
        <button
          onClick={() => router.push("/menu")}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-[#DC2B3F]"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للقائمة
        </button>

        <div className="bg-white rounded-2xl shadow-lg grid lg:grid-cols-2 overflow-hidden">
          {/* ================= Image (1:1) ================= */}
          <div className="p-6">
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              <img
                src={image}
                alt={meal.name}
                onError={(e) => {
                  e.currentTarget.src = "/images/fallbackimage.jpg";
                }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* ================= Info ================= */}
          <div className="p-8">
            <h1 className="text-3xl font-extrabold mb-4">{meal.name}</h1>

            {meal.description && (
              <p className="text-gray-600 mb-6">{meal.description}</p>
            )}

            {/* Options */}
            {meal.options?.map((option) => (
              <div key={option.id} className="mb-6">
                <h4 className="font-bold mb-2">{option.label}</h4>

                <div className="flex flex-wrap gap-3">
                  {option.values.map((v) => (
                    <button
                      key={v.value}
                      onClick={() =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [option.id]: v.value,
                        }))
                      }
                      className={`px-4 py-2 rounded-lg border transition ${
                        selectedOptions[option.id] === v.value
                          ? "border-[#DC2B3F] bg-[#DC2B3F]/10 text-[#DC2B3F]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {v.label}
                      {v.priceModifier > 0 && (
                        <span className="text-sm text-[#DC2B3F] mr-1">
                          +{v.priceModifier} ₪
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Price */}
            <div className="text-3xl font-bold text-[#DC2B3F] mb-6">
              {totalPrice} ₪
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-[#DC2B3F] text-white rounded       flex items-center justify-center
"
              >
                <Plus />
              </button>

              <span className="text-lg font-bold">{quantity}</span>

              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                className="w-10 h-10 bg-[#DC2B3F] text-white rounded       flex items-center justify-center
 disabled:opacity-50"
              >
                <Minus />
              </button>
            </div>

            <button className="w-full bg-[#DC2B3F] text-white py-3 rounded-lg hover:bg-[#C02436]">
              إضافة إلى السلة
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
