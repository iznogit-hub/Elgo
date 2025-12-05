"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameStatus = "IDLE" | "PLAYING" | "GAME_OVER";

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];
const INITIAL_SPEED = 100;

export function useSnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [status, setStatus] = useState<GameStatus>("IDLE");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef<Direction>("RIGHT");
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only one direction change per game tick
  const canChangeDirectionRef = useRef<boolean>(true);

  // Load high score from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("snake-highscore");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHighScore(parsed);
      }
    }
  }, []);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    // Simple random spawn that avoids snake body
    while (true) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);

      const onSnake = currentSnake.some((seg) => seg.x === x && seg.y === y);
      if (!onSnake) {
        return { x, y };
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const initial = INITIAL_SNAKE;

    setSnake(initial);
    setFood(generateFood(initial));

    setDirection("RIGHT");
    directionRef.current = "RIGHT";

    setScore(0);
    setStatus("PLAYING");

    // First tick can accept a direction change
    canChangeDirectionRef.current = true;
  }, [generateFood]);

  const changeDirection = useCallback((newDir: Direction) => {
    // Block multiple inputs in one tick
    if (!canChangeDirectionRef.current) return;

    const currentDir = directionRef.current;

    // Forbid 180° reversals
    const isOpposite =
      (currentDir === "UP" && newDir === "DOWN") ||
      (currentDir === "DOWN" && newDir === "UP") ||
      (currentDir === "LEFT" && newDir === "RIGHT") ||
      (currentDir === "RIGHT" && newDir === "LEFT");

    if (isOpposite) return;

    if (newDir !== currentDir) {
      directionRef.current = newDir;
      setDirection(newDir);
      canChangeDirectionRef.current = false; // lock until next tick
    }
  }, []);

  useEffect(() => {
    if (status !== "PLAYING") return;

    // Ensure only one interval at a time
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead: Point = { ...head };

        // Move based on the latest directionRef
        switch (directionRef.current) {
          case "UP":
            newHead.y -= 1;
            break;
          case "DOWN":
            newHead.y += 1;
            break;
          case "LEFT":
            newHead.x -= 1;
            break;
          case "RIGHT":
            newHead.x += 1;
            break;
        }

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setStatus("GAME_OVER");
          return prevSnake;
        }

        // Self collision
        if (
          prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setStatus("GAME_OVER");
          return prevSnake;
        }

        const ateFood = newHead.x === food.x && newHead.y === food.y;

        const nextSnake = [newHead, ...prevSnake];

        if (!ateFood) {
          // Move forward: drop tail
          nextSnake.pop();
        } else {
          // Grow and respawn food, update score
          setScore((prevScore) => {
            const newScore = prevScore + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              if (typeof window !== "undefined") {
                localStorage.setItem("snake-highscore", newScore.toString());
              }
            }
            return newScore;
          });

          setFood(generateFood(nextSnake));
        }

        return nextSnake;
      });

      // After the snake actually moves, unlock direction change
      canChangeDirectionRef.current = true;
    };

    gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [status, food, generateFood, highScore]);

  return {
    snake,
    food,
    status,
    score,
    highScore,
    startGame,
    changeDirection,
    GRID_SIZE,
  };
}
