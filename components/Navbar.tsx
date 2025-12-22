"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/context/CartUIContext";

type NavbarProps = {
  variant?: "default" | "floating";
};

export default function Navbar({ variant = "default" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { items } = useCart();
  const { openCart } = useCartUI(); // ⭐ المفتاح

  useEffect(() => {
    if (variant === "floating") return;

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const floatingStyle =
    "top-0 bg-white shadow-md rounded-b-[20px] px-[30px] py-[5px] w-[100%]";

  const defaultStyle = scrolled
    ? "top-0 bg-white shadow-md rounded-b-[20px] px-[30px] py-[5px] w-[100%]"
    : "top-[5vh] bg-white/90 shadow-xl rounded-[20px] px-[25px] py-[15px] w-[90%]";

  return (
    <div
      dir="rtl"
      className={`
        fixed left-1/2 -translate-x-1/2 z-[999]
        flex items-center justify-between
        transition-all duration-300
        ${variant === "floating" ? floatingStyle : defaultStyle}
      `}
    >
      {/* زر السلة */}
      <button
        onClick={openCart}
        className="
          relative
          bg-[#e63946] text-white
          px-[18px] py-[10px]
          rounded-[12px]
          flex items-center gap-2
          font-bold
          hover:bg-[#ff2121]
          transition
        "
      >
        <ShoppingCart size={22} />
        <span className="hidden sm:inline">السلة</span>

        {items.length > 0 && (
          <span
            className="
              absolute -top-2 -left-2
              bg-black text-white
              text-xs font-bold
              w-6 h-6 rounded-full
              flex items-center justify-center
            "
          >
            {items.length}
          </span>
        )}
      </button>

      {/* موبايل */}
      <div
        className="md:hidden text-[2em] cursor-pointer text-[#CD2E2E]"
        onClick={() => setOpen(!open)}
      >
        ☰
      </div>

      {/* الروابط */}
      <ul
        className={`md:flex gap-[30px] text-[#9f4949] text-[1.6em] ${
          open
            ? "flex flex-col absolute top-full right-0 w-full bg-white shadow-md p-4"
            : "hidden md:flex"
        }`}
      >
        <li><Link href="/">الرئيسية</Link></li>
        <li><Link href="/menu">قائمة الطعام</Link></li>
        <li><Link href="/branches">فروعنا</Link></li>
        <li><Link href="/about">حول</Link></li>
        <li><Link href="/contact">تواصل معنا</Link></li>
      </ul>

      <h2 className="text-[26px] font-bold text-[#e63946]">Malaky</h2>
    </div>
  );
}
