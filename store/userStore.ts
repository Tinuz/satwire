import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPreferences, Category, Subscription } from "@/types";

interface UserState {
  preferences: UserPreferences;
  isAuthenticated: boolean;
  userId: string | null;
  subscription: Subscription | null;

  // Actions
  setAuthenticated: (userId: string | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleFollowCategory: (category: Category) => void;
  toggleFollowCoin: (coin: string) => void;
  setSubscription: (sub: Subscription | null) => void;
  isPremium: () => boolean;
}

const defaultPreferences: UserPreferences = {
  followedCategories: [],
  followedCoins: [],
  pushEnabled: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      isAuthenticated: false,
      userId: null,
      subscription: null,

      setAuthenticated: (userId) =>
        set({ isAuthenticated: userId !== null, userId }),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      toggleFollowCategory: (category) =>
        set((state) => {
          const current = state.preferences.followedCategories;
          const updated = current.includes(category)
            ? current.filter((c) => c !== category)
            : [...current, category];
          return { preferences: { ...state.preferences, followedCategories: updated } };
        }),

      toggleFollowCoin: (coin) =>
        set((state) => {
          const current = state.preferences.followedCoins;
          const upper = coin.toUpperCase();
          const updated = current.includes(upper)
            ? current.filter((c) => c !== upper)
            : [...current, upper];
          return { preferences: { ...state.preferences, followedCoins: updated } };
        }),

      setSubscription: (subscription) => set({ subscription }),

      isPremium: () => {
        const { subscription } = get();
        return (
          subscription?.plan === "premium" &&
          subscription?.status === "active"
        );
      },
    }),
    {
      name: "satwire-user",
      // Only persist preferences, not auth state (re-verified on mount via Supabase)
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
