"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type OrderItemOption = {
  id: number;
  name: string;
  price: number;
};


type OrderItem = {
  id: number;
  quantity: number;
  unit_price: number;
  notes: string | null;
  options: OrderItemOption[];
  menu_item: {
    name: string;
    image: string | null;
  };
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  order_type: "delivery" | "pickup";
  subtotal: number;
  delivery_price: number;
  total_price: number;
  notes: string | null;
  order_items: OrderItem[];
};

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrder = async () => {
      const { data, error } = await supabaseBrowser.rpc(
        "get_order_with_items",
        { p_order_id: Number(orderId) }
      );

      console.log("RPC DATA:", data);
      console.log("RPC ERROR:", error);

      if (error || !data) {
        router.replace("/account/orders");
        return;
      }

      setOrder(data as Order);
    };

    fetchOrder();
  }, [user, orderId, router]);

  if (loading || !order) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-28 space-y-6">
        <h1 className="text-3xl font-extrabold">تفاصيل الطلب #{order.id}</h1>

        {order.order_items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 flex gap-4">
            <img
              src={item.menu_item.image || "/images/fallbackimage.jpg"}
              alt={item.menu_item.name}
              className="w-16 h-16 rounded-lg object-cover"
            />

            <div className="flex-1">
              <p className="font-bold">{item.menu_item.name}</p>
              <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
            </div>

            <div className="font-bold text-[#DC2B3F]">
              {item.unit_price * item.quantity} ₪
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
