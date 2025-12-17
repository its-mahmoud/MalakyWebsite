"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavbarProps = {
  variant?: "default" | "floating";
};

export default function Navbar({ variant = "default" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (variant === "floating") return; // ⭐ أهم سطر

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const floatingStyle =
    "top-0 bg-white shadow-md rounded-b-[20px] px-[30px] py-[5px]";

  const defaultStyle = scrolled
    ? "top-0 bg-white shadow-md rounded-b-[20px] px-[30px] py-[5px]"
    : "top-[5vh] bg-white/90 shadow-xl rounded-[20px] px-[25px] py-[15px]";

  return (
    <div
      dir="rtl"
      className={`
        fixed left-1/2 -translate-x-1/2 z-[999]
        w-[90%]
        flex items-center justify-between
        transition-all duration-300
        ${variant === "floating" ? floatingStyle : defaultStyle}
      `}
    >
      {/* زر الطلب */}
      <button className="bg-[#e63946] text-white px-[20px] py-[10px] rounded-[10px] font-bold hover:bg-[#ff2121] transition">
        ! أطلب الآن
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
        <li><Link href="/branches">موقعنا</Link></li>
        <li><Link href="/about">حول</Link></li>
        <li><Link href="/contact_us">تواصل معنا</Link></li>
      </ul>

      <h2 className="text-[26px] font-bold text-[#e63946]">Malaky</h2>
    </div>
  );
}
