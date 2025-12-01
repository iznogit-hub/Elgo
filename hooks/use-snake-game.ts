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

  // Refs for mutable state inside interval
  const directionRef = useRef<Direction>("RIGHT");
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("snake-highscore");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOnSnake;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    } while (isOnSnake);
    return newFood;
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setStatus("PLAYING");
    setFood(generateFood(INITIAL_SNAKE));
  };

  const changeDirection = useCallback((newDir: Direction) => {
    const currentDir = directionRef.current;
    const invalid =
      (currentDir === "UP" && newDir === "DOWN") ||
      (currentDir === "DOWN" && newDir === "UP") ||
      (currentDir === "LEFT" && newDir === "RIGHT") ||
      (currentDir === "RIGHT" && newDir === "LEFT");

    if (!invalid) {
      setDirection(newDir);
      directionRef.current = newDir;
    }
  }, []);

  useEffect(() => {
    if (status !== "PLAYING") return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { ...head };

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

        // Wall Collision (Wrap Around Logic - Optional, but easier for UX)
        // Let's do Hard Walls for "True Gamer" difficulty
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setStatus("GAME_OVER");
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem("snake-highscore", newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
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
