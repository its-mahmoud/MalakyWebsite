import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface MealCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  category: string;
}

export function MealCard({
  id,
  name,
  description,
  price,
  image,
  category,
}: MealCardProps) {
  const fallbackImage = "/images/fallbackimage.jpg";

  return (
    <Link href={`/menu/${id}`} className="block cursor-pointer">
      <div
        className="
          bg-white rounded-2xl overflow-hidden
          shadow-md hover:shadow-xl
          transition-all duration-300
          group hover:-translate-y-1
        "
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          <img
            src={image && image.trim() !== "" ? image : fallbackImage}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
            className="
              w-full h-full object-cover
              group-hover:scale-110
              transition-transform duration-500
            "
          />

          {/* Category */}
          <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold text-[#DC2B3F] shadow">
            {category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-gray-900 font-bold mb-2">{name}</h3>

          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
            {description}
          </p>

          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-[#DC2B3F] text-3xl">₪</span>
              <span className="text-[#DC2B3F] text-xl font-extrabold">
                {price}
              </span>
            </div>

            {/* Add Button */}
            <button
              onClick={(e) => {
                e.preventDefault(); // يمنع الانتقال
                e.stopPropagation(); // أمان إضافي
                // لاحقًا: addToCart(id)
              }}
              className="
                flex items-center gap-1
                bg-[#DC2B3F] text-white
                px-4 py-2 rounded-xl
                hover:bg-[#C02436]
                transition-colors
              "
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-semibold">أضف</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
