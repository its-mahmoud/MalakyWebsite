"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCart } from "../../../context/CartContext";

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

type Category = {
  id: number;
  name: string;
};

type MealCategory = {
  categories: Category[];
};

type Meal = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  options: MealOption[] | null;
  menu_item_images: { image_url: string }[];
  menu_item_categories: MealCategory[];
};

type RawMealCategory = {
  categories: Category | Category[] | null;
};

/* ================= Page ================= */

export default function MealDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // ===== States =====
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [imgSrc, setImgSrc] = useState<string>("/images/fallbackimage.jpg");

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!meal) return;

    addToCart({
      mealId: meal.id,
      name: meal.name,
      image: imgSrc,
      quantity,
      notes,

      options: Object.entries(selectedOptions).map(([optionId, value]) => {
        const option = meal.options?.find((o) => o.id === optionId);
        const selectedValue = option?.values.find((v) => v.value === value);

        return {
          optionId,
          value,
          label: selectedValue?.label || value, 
        };
      }),

      basePrice: meal.price,
      optionsPrice,
    });
  };

  // ===== Fetch meal =====
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
          menu_item_images ( image_url ),
          menu_item_categories (
            categories (
              id,
              name
            )
          )
        `
        )
        .eq("id", id)
        .single();

      if (!error && data) {
        const normalizedMeal: Meal = {
          ...data,
          menu_item_categories: (
            data.menu_item_categories as RawMealCategory[]
          ).map((mc) => ({
            categories: mc.categories
              ? Array.isArray(mc.categories)
                ? mc.categories
                : [mc.categories]
              : [],
          })),
        };

        setMeal(normalizedMeal);
      }

      setLoading(false);
    };

    fetchMeal();
  }, [id]);
  useEffect(() => {
    if (!meal || !meal.options) return;

    const defaults: Record<string, string> = {};

    meal.options.forEach((option) => {
      if (option.values.length > 0) {
        defaults[option.id] = option.values[0].value; // ✅ أول خيار
      }
    });

    setSelectedOptions(defaults);
  }, [meal]);

  // ===== Update image when meal changes =====
  useEffect(() => {
    if (meal?.menu_item_images?.[0]?.image_url) {
      setImgSrc(meal.menu_item_images[0].image_url);
    }
  }, [meal]);

  // ===== Conditional rendering (بعد كل hooks فقط) =====
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
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={imgSrc}
                alt={meal.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                onError={() => setImgSrc("/images/fallbackimage.jpg")}
              />
            </div>
          </div>

          {/* ================= Info ================= */}
          <div className="p-8 lg:border-r lg:border-[#DC2B3F]/40">
            <h1 className="text-3xl font-extrabold mb-4">{meal.name}</h1>
            {/* ===== Categories Badges ===== */}
            {meal.menu_item_categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {meal.menu_item_categories.flatMap((mc) => {
                  if (!mc.categories) return [];

                  const categoriesArray = Array.isArray(mc.categories)
                    ? mc.categories
                    : [mc.categories];

                  return categoriesArray.map((cat) => (
                    <span
                      key={cat.id}
                      className="
            text-xs font-semibold
            px-3 py-1 rounded-full
            bg-[#DC2B3F]/10 text-[#DC2B3F]
          "
                    >
                      {cat.name}
                    </span>
                  ));
                })}
              </div>
            )}
            {/* ===== meal descr ===== */}

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

            {/* Notes */}
            <div className="mb-6">
              <h4 className="font-bold mb-2">ملاحظات على الطلب</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: بدون بصل، زيادة صوص..."
                rows={4}
                className="
      w-full rounded-lg border border-gray-200
      p-3 text-sm resize-none
      focus:outline-none focus:ring-2 focus:ring-[#DC2B3F]/40
    "
              />
            </div>

            {/* ===== Price + Quantity + Add to Cart ===== */}
            <div className="flex items-center gap-4 mt-8">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#DC2B3F] text-white py-3 rounded-lg hover:bg-[#C02436] font-bold"
              >
                إضافة إلى السلة
              </button>

              {/* Quantity */}
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 bg-[#DC2B3F] text-white rounded flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>

                <span className="text-base font-bold w-6 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                  className="w-8 h-8 bg-[#DC2B3F] text-white rounded flex items-center justify-center disabled:opacity-50"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* Price */}
              <div className="text-2xl font-extrabold text-[#DC2B3F] whitespace-nowrap">
                {totalPrice} ₪
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
