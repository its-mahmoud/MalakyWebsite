type HeroCardProps = {
  title: string;
  price: string;
  image: string;
};

export default function HeroCard({ title, price, image }: HeroCardProps) {
  return (
    <div
      className="
        w-[300px] h-[390px]
        bg-white
        rounded-[15px]
        shadow-[0_6px_20px_rgba(0,0,0,0.15)]
        flex flex-col
        items-center
        overflow-hidden
        transition-transform duration-300
        hover:scale-105
      "
    >
      {/* الصورة */}
      <img
        src={image}
        alt={title}
        className="
          w-full
          flex-1
          object-contain
          rounded-t-[15px]
        "
      />

      {/* info box */}
      <div
        className="
    w-full
    h-[100px]
    flex flex-col
    text-center
    justify-center
    bg-white
    px-3
  "
      >
        <h3
          className="text-[1em] text-[#cd2e2e] m-0 font-bold"
          style={{ textShadow: "2px 2px 5px rgba(0,0,0,0.7)" }}
        >
          {title}
        </h3>

        <span className="block text-[0.9em] text-[#444] my-[5px]">{price}</span>

        <button
          className="
            bg-[#e63946]
            w-[110px]
            text-white
            border-none
            px-[14px]
            py-[4px]
            mx-auto
            rounded-[8px]
            text-[0.85em]
            cursor-pointer
            transition-colors duration-300
            hover:bg-[#ff2121]
          "
        >
          اطلب الآن
        </button>
      </div>
    </div>
  );
}
