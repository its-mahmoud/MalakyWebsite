"use client";

import Navbar from "components/Navbar";
import HeroCard from "components/HeroCard";

const heroCards = [
  {
    title: "بيف برجر",
    price: "₪25",
    image: "/images/beefburger.jpg",
  },
  {
    title: "ملكي بيتزا",
    price: "₪30",
    image: "/images/malakypizza.jpg",
  },
  {
    title: "وجبة أطفال",
    price: "₪18",
    image: "/images/kidsmeal.jpg",
  },
];

export default function HomePage() {
  return (
    <main dir="rtl" className="bg-[whitesmoke] overflow-x-hidden">
      <Navbar />

      {/* ================= HERO ================= */}
      <section
        className="relative min-h-screen w-full bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/mcbcover.png')" }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* cards */}
        <div className="relative z-10 pt-[260px] flex justify-center">
          <div className="flex flex-wrap justify-center gap-[60px]">
            {heroCards.map((card) => (
              <HeroCard
                key={card.title}
                title={card.title}
                price={card.price}
                image={card.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= OFFERS ================= */}
      <section className="bg-[#fff5f5] py-20 text-center">
        <h2 className="text-[2.2em] font-extrabold mb-10">عروض حصرية</h2>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="w-[350px] bg-white rounded-xl shadow-lg p-5 hover:scale-105 transition">
            <img src="/images/winter2.jpg" className="rounded-lg" />
            <h3 className="text-[#cd2e2e] font-bold mt-4">عرض الشتاء الأول</h3>
            <p>65 شيكل</p>
          </div>

          <div className="w-[350px] bg-white rounded-xl shadow-lg p-5 hover:scale-105 transition">
            <img src="/images/winter1.jpg" className="rounded-lg" />
            <h3 className="text-[#cd2e2e] font-bold mt-4">عرض الشتاء الثاني</h3>
            <p>110 شيكل</p>
          </div>
        </div>
      </section>
    </main>
  );
}
