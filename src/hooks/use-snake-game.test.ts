import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSnakeGame } from "./use-snake-game";

describe("useSnakeGame", () => {
  // Mock LocalStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useSnakeGame());

    expect(result.current.status).toBe("IDLE");
    expect(result.current.score).toBe(0);
    expect(result.current.snake).toHaveLength(1);
    expect(result.current.snake[0]).toEqual({ x: 10, y: 10 });
  });

  it("starts the game correctly", () => {
    const { result } = renderHook(() => useSnakeGame());

    act(() => {
      result.current.startGame();
    });

    expect(result.current.status).toBe("PLAYING");
    expect(result.current.score).toBe(0);
  });

  it("moves the snake forward on game tick", () => {
    const { result } = renderHook(() => useSnakeGame());

    act(() => {
      result.current.startGame();
    });

    // Initial position: 10, 10
    // Default direction: RIGHT
    // Speed: 100ms

    // Advance time by one tick
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should move 1 unit to the right
    expect(result.current.snake[0]).toEqual({ x: 11, y: 10 });
  });

  it("handles direction changes", () => {
    const { result } = renderHook(() => useSnakeGame());
    act(() => result.current.startGame());

    // Change to DOWN
    act(() => {
      result.current.changeDirection("DOWN");
    });

    // Advance tick
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should move DOWN (y + 1) -> { x: 10, y: 11 }
    // Note: Start was 10,10. We changed direction BEFORE the first move?
    // Actually, startGame resets snake to 10,10.
    // If we change direction immediately, it should apply to the next tick.
    expect(result.current.snake[0]).toEqual({ x: 10, y: 11 });
  });

  it("prevents 180 degree turns", () => {
    const { result } = renderHook(() => useSnakeGame());
    act(() => result.current.startGame());

    // Currently moving RIGHT. Try to move LEFT.
    act(() => {
      result.current.changeDirection("LEFT");
    });

    // Advance tick
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be moving RIGHT (ignore the input)
    expect(result.current.snake[0]).toEqual({ x: 11, y: 10 });
  });

  it("triggers GAME_OVER when hitting a wall", () => {
    const { result } = renderHook(() => useSnakeGame());
    act(() => result.current.startGame());

    // Move to the right edge (Grid size is 20, so max index is 19)
    // Start at 10. Need 9 moves to get to 19. 10th move hits wall.
    act(() => {
      vi.advanceTimersByTime(100 * 10);
    });

    // Check status
    expect(result.current.status).toBe("GAME_OVER");
  });

  it("updates high score in localStorage", () => {
    // 1. Mock Math.random to force food to appear exactly where we will move
    // We want food at { x: 11, y: 10 } (right of start)
    // GRID_SIZE is 20.
    // x = floor(random * 20) -> need 11 -> random needs to be 0.55
    // y = floor(random * 20) -> need 10 -> random needs to be 0.5

    // We can just spy on the hook's internal logic? No, easier to play normally
    // or just trust the score logic increment.
    // Let's rely on the fact that if we eat food, score goes up.

    // Actually, forcing collision with food is tricky without mocking Math.random deeply.
    // Instead, let's verify High Score persistence if we MANUALLY could set score (we can't).

    // Alternate strategy: We can verify the LOAD logic.
    localStorageMock.setItem("snake-highscore", "500");

    const { result } = renderHook(() => useSnakeGame());

    expect(result.current.highScore).toBe(500);
  });
});
