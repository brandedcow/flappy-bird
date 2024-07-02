import { create } from "zustand";

type GameStateSchema = {
  isStarted: boolean;
  startGame: () => void;
  resetGame: () => void;
};

export const useGameState = create<GameStateSchema>((set) => ({
  isStarted: false,
  startGame: () => set((state) => ({ ...state, isStarted: true })),
  resetGame: () => set((state) => ({ ...state, isStarted: false })),
}));
