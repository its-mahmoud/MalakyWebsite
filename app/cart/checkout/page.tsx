"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

/* ================= Types ================= */

type Step = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  const [branches, setBranches] = useState<
    { id: number; name: string; city: string }[]
  >([]);
  const [selectedCity, setSelectedCity] = useState<string>("");

  const [zones, setZones] = useState<
    { id: number; city: string; area_name: string; delivery_price: number }[]
  >([]);
  const cities = Array.from(new Set(zones.map((z) => z.city)));

  const [zoneId, setZoneId] = useState<string>("");
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, city")
        .eq("is_active", true);

      if (!error && data) {
        setBranches(data);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchZones = async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("id, city, area_name, delivery_price")
        .eq("is_active", true);

      if (!error && data) {
        setZones(data);
      }
    };

    fetchZones();
  }, []);

  const filteredZones = zones.filter((z) => z.city === selectedCity);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  /* ================= Wizard State ================= */

  const [step, setStep] = useState<Step>(1);

  const [orderType, setOrderType] = useState<"delivery" | "pickup" | null>(
    null
  );

  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [address, setAddress] = useState("");
  const [branch, setBranch] = useState("");

  const handleSubmit = async () => {
    // 1) تجهيز أسعار الطلب
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalDeliveryPrice = orderType === "delivery" ? deliveryPrice : 0;

    const total = subtotal + finalDeliveryPrice;

    // 2) تجهيز بيانات الطلب (Guest)
    const guestName = `${contact.firstName} ${contact.lastName}`.trim();

    // 3) إنشاء Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_type: orderType, // "delivery" | "pickup"
        subtotal,
        delivery_price: finalDeliveryPrice,
        total_price: total,

        guest_customer_name: guestName,
        guest_phone: contact.phone,

        branch_id: orderType === "pickup" ? Number(branch) : null,
        // مؤقتًا نخزن العنوان في notes (بعدين نعمل user_address_id)
        notes: orderType === "delivery" ? address : null,

        status: "pending",
        verification_status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error(orderError);
      alert("فشل إنشاء الطلب");
      return;
    }

    // 4) إنشاء Order Items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.mealId,
      quantity: item.quantity,
      unit_price: item.unitPrice, // مهم: سعر القطعة (base + options)
      options: item.options, // jsonb
      notes: item.notes || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      alert("تم إنشاء الطلب لكن فشل حفظ العناصر");
      return;
    }

    alert(`تم إرسال الطلب بنجاح! رقم الطلب: ${order.id}`);
    // لاحقًا: router.push(`/order/${order.id}`)
  };

  /* ================= Guards ================= */

  if (items.length === 0) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#F5F5F5]">
        <Navbar variant="floating" />
        <div className="text-center mt-40 text-gray-500">السلة فارغة</div>
      </div>
    );
  }

  const selectedZone = zones.find((z) => z.id === Number(zoneId));

  const fullDeliveryAddress =
    orderType === "delivery"
      ? `${selectedCity} – ${selectedZone?.area_name}\n${address}`
      : "";

  const selectedBranch = branches.find((b) => b.id === Number(branch));

  /* ================= UI ================= */

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F5F5]">
      <Navbar variant="floating" />

      <main className="max-w-3xl mx-auto px-4 py-10 mt-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">إتمام الطلب</h1>

          <button
            onClick={() => router.push("/cart")}
            className="text-sm text-gray-500 hover:text-[#DC2B3F]"
          >
            إلغاء
          </button>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-4 gap-2 mb-10 text-sm font-bold">
          {["نوع الطلب", "معلومات التواصل", "التفاصيل", "مراجعة"].map(
            (label, i) => (
              <div
                key={i}
                className={`text-center py-2 rounded-lg ${
                  step === i + 1
                    ? "bg-[#DC2B3F] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!orderType) return;
              setStep(2);
            }}
            className="bg-white p-6 rounded-2xl shadow space-y-6"
          >
            <h2 className="font-bold text-lg">نوع الطلب</h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`py-6 rounded-xl border font-semibold ${
                  orderType === "delivery"
                    ? "border-[#DC2B3F] bg-[#DC2B3F]/10 text-[#DC2B3F]"
                    : "border-gray-200"
                }`}
              >
                توصيل
              </button>

              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`py-6 rounded-xl border font-semibold ${
                  orderType === "pickup"
                    ? "border-[#DC2B3F] bg-[#DC2B3F]/10 text-[#DC2B3F]"
                    : "border-gray-200"
                }`}
              >
                استلام من الفرع
              </button>
            </div>

            <button
              type="submit"
              disabled={!orderType}
              className="w-full bg-[#DC2B3F] text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              المتابعة
            </button>
          </form>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!contact.firstName || !contact.lastName || !contact.phone)
                return;
              setStep(3);
            }}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="font-bold text-lg">معلومات التواصل</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="الاسم"
                value={contact.firstName}
                onChange={(e) =>
                  setContact({ ...contact, firstName: e.target.value })
                }
                className="border rounded-lg p-3"
              />

              <input
                required
                placeholder="اسم العائلة"
                value={contact.lastName}
                onChange={(e) =>
                  setContact({ ...contact, lastName: e.target.value })
                }
                className="border rounded-lg p-3"
              />
            </div>

            <input
              required
              placeholder="رقم الهاتف"
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border py-3 rounded-lg"
              >
                رجوع
              </button>

              <button
                type="submit"
                className="flex-1 bg-[#DC2B3F] text-white py-3 rounded-lg font-bold"
              >
                المتابعة
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                orderType === "delivery" &&
                (!selectedCity || !zoneId || !address)
              )
                return;
              if (orderType === "pickup" && !branch) return;
              setStep(4);
            }}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="font-bold text-lg">
              {orderType === "delivery" ? "عنوان التوصيل" : "اختيار الفرع"}
            </h2>

            {orderType === "delivery" ? (
              <>
                {/* اختيار المدينة */}
                <select
                  required
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setZoneId("");
                    setDeliveryPrice(0);
                  }}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* اختيار منطقة التوصيل */}
                <select
                  required
                  disabled={!selectedCity}
                  value={zoneId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setZoneId(selectedId);

                    const zone = filteredZones.find(
                      (z) => z.id === Number(selectedId)
                    );

                    setDeliveryPrice(zone ? zone.delivery_price : 0);
                  }}
                  className="w-full border rounded-lg p-3 disabled:bg-gray-100"
                >
                  <option value="">اختر منطقة التوصيل</option>

                  {filteredZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.area_name} (+{z.delivery_price} ₪)
                    </option>
                  ))}
                </select>

                {/* تفاصيل العنوان */}
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="تفاصيل العنوان (الشارع، البناية، الطابق)"
                  className="w-full border rounded-lg p-3 resize-none"
                />
              </>
            ) : (
              <select
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option value="">اختر الفرع</option>

                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} – {b.city}
                  </option>
                ))}
              </select>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 border py-3 rounded-lg"
              >
                رجوع
              </button>

              <button
                type="submit"
                className="flex-1 bg-[#DC2B3F] text-white py-3 rounded-lg font-bold"
              >
                المتابعة
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 4 ================= */}
        {step === 4 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("هنا يتم إنشاء الطلب في Supabase");
            }}
            className="bg-white p-6 rounded-2xl shadow space-y-8"
          >
            <h2 className="font-bold text-xl">مراجعة الطلب</h2>

            {/* ================= Items ================= */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border rounded-xl p-4">
                  {/* Image */}
                  <img
                    src={item.image || "/images/fallbackimage.jpg"}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{item.name}</h4>

                    {/* Options */}
                    {item.options.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {item.options.map((opt) => (
                          <li key={opt.optionId}>• {opt.label}</li>
                        ))}
                      </ul>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        ملاحظة: {item.notes}
                      </p>
                    )}

                    {/* Quantity */}
                    <p className="text-xs text-gray-500 mt-1">
                      الكمية: {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="font-bold text-sm text-[#DC2B3F] whitespace-nowrap">
                    {item.totalPrice} ₪
                  </div>
                </div>
              ))}
            </div>

            <hr />

            {/* ================= Order Info ================= */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">الاسم</span>
                <span className="font-medium">
                  {contact.firstName} {contact.lastName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">الهاتف</span>
                <span className="font-medium">{contact.phone}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  {orderType === "delivery" ? "العنوان" : "الفرع"}
                </span>
                <span className="font-medium text-right max-w-[60%] whitespace-pre-line">
                  {orderType === "delivery"
                    ? fullDeliveryAddress
                    : `${selectedBranch?.name} – ${selectedBranch?.city}`}
                </span>
              </div>
            </div>

            {/* ================= Total ================= */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">السعر الفرعي</span>
                <span className="font-medium">{subtotal} ₪</span>
              </div>

              {orderType === "delivery" && (
                <div className="flex justify-between">
                  <span className="text-gray-500">سعر التوصيل</span>
                  <span className="font-medium">{deliveryPrice} ₪</span>
                </div>
              )}

              <hr />

              <div className="flex justify-between text-lg font-extrabold">
                <span>الإجمالي</span>
                <span className="text-[#DC2B3F]">
                  {subtotal + (orderType === "delivery" ? deliveryPrice : 0)} ₪
                </span>
              </div>
            </div>

            {/* ================= Actions ================= */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 border py-3 rounded-lg"
              >
                رجوع
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-[#DC2B3F] text-white py-3 rounded-lg font-bold"
              >
                تأكيد وإرسال الطلب
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
