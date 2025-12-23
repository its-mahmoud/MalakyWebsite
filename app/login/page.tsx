"use client";

import Navbar from "@/components/Navbar";
import { signInWithGoogle } from "@/lib/auth";
import { Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F5F5F5]">
      <Navbar variant="floating" />

      <div className="max-w-md mx-auto mt-48 bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-extrabold mb-6">
          تسجيل الدخول
        </h1>

        <button
          onClick={signInWithGoogle}
          className="
            w-full flex items-center justify-center gap-3
            border border-gray-300
            py-3 rounded-lg
            hover:bg-gray-50
            transition
          "
        >
          <Mail />
          <span className="font-semibold">
            تسجيل الدخول عبر Google
          </span>
        </button>
      </div>
    </main>
  );
}
