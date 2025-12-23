"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { supabaseBrowser as supabase } from "@/lib/supabaseBrowser";
import { MealCard } from "../../components/MealCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const el = document.getElementById("category-scroll");
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = 120;
      setIsSticky(window.scrollY > triggerPoint);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = document.getElementById("category-scroll");
    if (!container) return;

    const selector =
      activeCategory === "all"
        ? '[data-category="all"]'
        : `[data-category="${activeCategory}"]`;

    const activeEl = container.querySelector(selector) as HTMLElement | null;

    if (activeEl) {
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const containerWidth = container.clientWidth;

      container.scrollTo({
        left: elLeft - containerWidth / 2 + elWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeCategory]);

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

      <div
        className={`
    sticky top-[50px] z-40 py-4
    transition-all duration-300
    ${
      isSticky
        ? "bg-[whitesmoke] border-b border-[#DC2B3F]/80 shadow-sm"
        : "bg-[whitesmoke]"
    }
  `}
      >
        <div className="relative max-w-full">
          {/* ===== Fade Right ===== */}
          <div
            className="
        pointer-events-none
        absolute right-0 top-0 h-full w-16
        bg-gradient-to-l from-[whitesmoke] to-transparent
        z-40
      "
          />

          {/* ===== Fade Left ===== */}
          <div
            className="
        pointer-events-none
        absolute left-0 top-0 h-full w-16
        bg-gradient-to-r from-[whitesmoke] to-transparent
        z-40
      "
          />

          {/* ===== Left Arrow ===== */}
          <button
            onClick={() =>
              document
                .getElementById("category-scroll")
                ?.scrollBy({ left: -200, behavior: "smooth" })
            }
            className="
        hidden md:flex
        absolute left-3 top-1/2 -translate-y-1/2
        z-50
        bg-white shadow-md
        w-9 h-9 rounded-full
        items-center justify-center
        hover:bg-gray-100
      "
          >
            <ArrowLeft />
          </button>

          {/* ===== Right Arrow ===== */}
          <button
            onClick={() =>
              document
                .getElementById("category-scroll")
                ?.scrollBy({ left: 200, behavior: "smooth" })
            }
            className="
        hidden md:flex
        absolute right-3 top-1/2 -translate-y-1/2
        z-50
        bg-white shadow-md
        w-9 h-9 rounded-full
        items-center justify-center
        hover:bg-gray-100
      "
          >
            <ArrowRight />
          </button>

          {/* ===== Chips Container ===== */}
          <div
            id="category-scroll"
            className="
        mx-auto flex gap-3 px-14
        overflow-x-auto
        w-[95%]
        scroll-smooth
        rounded-full
        scrollbar-none
        relative z-10
      "
            style={{ scrollbarWidth: "none" }}
          >
            {/* All */}
            <button
              data-category="all"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-[#DC2B3F] text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              الكل
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                data-category={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition ${
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
      </div>

      {/* Menu Grid */}
      <section className="mx-auto mt-12 grid max-w-[90rem] grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((item) => {
          const image =
            item.menu_item_images?.sort(
              (a, b) => a.display_order - b.display_order
            )[0]?.image_url || "/images/placeholder.png";

          return (
            <MealCard
              id={item.id}
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
