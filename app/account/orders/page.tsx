"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Package } from "lucide-react";

type Order = {
  id: number;
  created_at: string;
  total_price: number;
  status: string;
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_price, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }

      setOrdersLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (loading || ordersLoading) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-28 space-y-6">
        <h1 className="text-3xl font-extrabold">طلباتي</h1>

        {/* لا يوجد طلبات */}
        {orders.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            لا يوجد طلبات بعد
          </div>
        )}

        {/* قائمة الطلبات */}
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-gray-900">
                طلب #{order.id}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString("ar")}
              </p>
            </div>

            <div className="text-left">
              <p className="font-bold text-[#DC2B3F]">
                ₪ {order.total_price}
              </p>
              <p className="text-sm text-gray-500">
                {order.status}
              </p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
