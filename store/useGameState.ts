import { create } from "zustand";

type GameStateSchema = {
  isStarted: boolean;
  startGame: () => void;
  endGame: () => void;

  score: number;
  incrementScore: () => void;
};

export const useGameState = create<GameStateSchema>((set) => ({
  isStarted: false,
  startGame: () => set((state) => ({ ...state, isStarted: true })),
  endGame: () => set((state) => ({ ...state, isStarted: false })),

  score: 0,
  incrementScore: () => set((state) => ({ ...state, score: state.score + 1 })),
}));
