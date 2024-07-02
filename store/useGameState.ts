import { create } from "zustand";

type GameStateSchema = {
  isStarted: boolean;
  startGame: () => void;
  endGame: () => void;
};

export const useGameState = create<GameStateSchema>((set) => ({
  isStarted: false,
  startGame: () => set((state) => ({ ...state, isStarted: true })),
  endGame: () => set((state) => ({ ...state, isStarted: false })),
}));
