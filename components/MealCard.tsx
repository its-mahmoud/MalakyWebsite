import { ShoppingCart } from "lucide-react";

interface MealCardProps {
  name: string;
  description: string;
  price: number;
  image?: string | null;
  category: string;
}

export function MealCard({
  name,
  description,
  price,
  image,
  category,
}: MealCardProps) {
  const fallbackImage = "/images/fallbackimage.jpg";

  return (
    <div className="
      bg-white rounded-2xl overflow-hidden
      shadow-md hover:shadow-xl
      transition-all duration-300
      group
    ">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={image && image.trim() !== "" ? image : fallbackImage}
          alt={name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
          className="
            w-full h-full object-cover
            group-hover:scale-110
            transition-transform duration-500
          "
        />

        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
          <span className="text-[#DC2B3F] text-sm font-semibold">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-gray-900 font-bold mb-2">{name}</h3>

        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed text-sm">
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

          {/* Add */}
          <button className="
            flex items-center gap-1
            bg-[#DC2B3F] text-white
            px-4 py-2 rounded-xl
            hover:bg-[#C02436]
            transition-colors
          ">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm font-semibold">أضف</span>
          </button>
        </div>
      </div>
    </div>
  );
}
