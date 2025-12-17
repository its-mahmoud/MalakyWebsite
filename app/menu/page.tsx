"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabaseClient";
import { MealCard } from "../../components/MealCard";

/* ================= Types ================= */

type Category = {
  id: number;
  name: string;
};

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  menu_item_images: {
    image_url: string;
    display_order: number;
  }[];
  menu_item_categories: {
    category_id: number;
  }[];
};

/* ================= Page ================= */

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order");

      console.log("CATEGORIES DATA:", data);
      console.log("CATEGORIES ERROR:", error);

      if (error) return;
      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select(
          `
        id,
        name,
        description,
        price,
        menu_item_images (
          image_url,
          display_order
        ),
        menu_item_categories (
          category_id
        )
      `
        )
        .eq("is_active", true)
        .order("display_order");

      console.log("ITEMS DATA:", data);
      console.log("ITEMS ERROR:", error);

      if (error) return;
      setItems(data || []);
    };

    fetchItems();
  }, []);

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) =>
          item.menu_item_categories.some(
            (c) => c.category_id === activeCategory
          )
        );

  return (
    <main dir="rtl" className="min-h-screen bg-[whitesmoke]">
      <Navbar />

      <h1 className="mt-40 text-center text-4xl font-extrabold text-red-700">
        قائمة الطعام
      </h1>

      {/* Categories */}
      <div className="mt-8 overflow-x-auto">
        <div className="mx-auto flex w-max gap-3 px-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              activeCategory === "all"
                ? "bg-[#DC2B3F] text-white"
                : "bg-gray-200"
            }`}
          >
            الكل
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeCategory === cat.id
                  ? "bg-[#DC2B3F] text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <section className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const image =
            item.menu_item_images?.sort(
              (a, b) => a.display_order - b.display_order
            )[0]?.image_url || "/images/placeholder.png";

          return (
            <MealCard
              key={item.id}
              name={item.name}
              description={item.description || ""}
              price={item.price}
              image={image}
              category={
                categories.find((c) =>
                  item.menu_item_categories.some(
                    (mc) => mc.category_id === c.id
                  )
                )?.name || ""
              }
            />
          );
        })}
      </section>
    </main>
  );
}
