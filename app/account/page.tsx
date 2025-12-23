"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ClipboardList, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return null;

  const fullName =
    user.user_metadata?.full_name || user.user_metadata?.name || "مستخدم";
  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F5F5]">
      <Navbar variant="floating" />

      <main className="max-w-4xl mx-auto px-4 py-28 space-y-8">
        {/* عنوان */}
        <h1 className="text-3xl font-extrabold text-gray-900">حسابي</h1>

        {/* بطاقة المستخدم */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#DC2B3F]/10 flex items-center justify-center">
            <User className="text-[#DC2B3F]" />
          </div>

          <div>
            <p className="font-bold text-gray-900">{fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* بطاقة الطلبات */}
        <div
          onClick={() => router.push("/orders")}
          className="
            cursor-pointer
            bg-white rounded-2xl shadow-md
            p-6 flex items-center justify-between
            hover:shadow-lg transition
          "
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">طلباتي</h2>
            <p className="text-sm text-gray-500">عرض جميع الطلبات السابقة</p>
          </div>

          <div className="w-12 h-12 rounded-full bg-[#DC2B3F]/10 flex items-center justify-center">
            <ClipboardList className="text-[#DC2B3F]" />
          </div>
        </div>

        {/* تسجيل خروج */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="text-sm font-semibold text-[#DC2B3F] hover:underline"
        >
          تسجيل الخروج
        </button>
      </main>
    </div>
  );
}
