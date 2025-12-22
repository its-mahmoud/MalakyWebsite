import "./globals.css";
import { Beiruti, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "context/CartContext";
import { CartUIProvider } from "context/CartUIContext";
import CartDrawer from "@/components/CartDrawer";
import { MealQuickViewProvider } from "@/context/MealQuickViewContext";
import MealQuickViewModal from "@/components/MealQuickViewModal";

const beiruti = Beiruti({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-beiruti",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${beiruti.variable} ${poppins.variable} bg-[whitesmoke]`}
      >
        <CartProvider>
          <CartUIProvider>
            <MealQuickViewProvider>
              {/* Drawer global */}
              <CartDrawer />

              {/* الصفحات */}
              {children}

              <Toaster position="top-center" />
              <MealQuickViewModal />
            </MealQuickViewProvider>
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}
