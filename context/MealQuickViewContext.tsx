"use client";

import { createContext, useContext, useState } from "react";

type MealQuickViewContextType = {
  mealId: number | null;
  openMeal: (id: number) => void;
  closeMeal: () => void;
};

const MealQuickViewContext =
  createContext<MealQuickViewContextType | null>(null);

export function MealQuickViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mealId, setMealId] = useState<number | null>(null);

  return (
    <MealQuickViewContext.Provider
      value={{
        mealId,
        openMeal: (id) => setMealId(id),
        closeMeal: () => setMealId(null),
      }}
    >
      {children}
    </MealQuickViewContext.Provider>
  );
}

export function useMealQuickView() {
  const ctx = useContext(MealQuickViewContext);
  if (!ctx)
    throw new Error("useMealQuickView must be used inside provider");
  return ctx;
}
