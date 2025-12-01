"use client";

import React, { useEffect, useRef } from "react";
import { X, RefreshCcw, Trophy, Keyboard } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSnakeGame } from "@/hooks/use-snake-game";
import { useSfx } from "@/hooks/use-sfx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SnakeTerminalProps {
  onClose: () => void;
}

export function SnakeTerminal({ onClose }: SnakeTerminalProps) {
  const {
    snake,
    food,
    status,
    score,
    highScore,
    startGame,
    changeDirection,
    GRID_SIZE,
  } = useSnakeGame();
  const { play } = useSfx();
  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance Animation
  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }
      );
    },
    { scope: containerRef }
  );

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          changeDirection("UP");
          break;
        case "ArrowDown":
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
          changeDirection("LEFT");
          break;
        case "ArrowRight":
          changeDirection("RIGHT");
          break;
        case "Escape":
          onClose();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection, onClose]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border-2 border-green-500/50 bg-black shadow-[0_0_40px_rgba(34,197,94,0.2)]"
      >
        {/* CRT Scanline Effect */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] bg-repeat" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-500/30 bg-green-500/10 p-3">
          <div className="flex items-center gap-2 text-green-500">
            <Keyboard className="h-4 w-4" />
            <span className="font-mono text-sm font-bold tracking-widest">
              TERMINAL_SNAKE.EXE
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-green-500 hover:bg-green-500/20 hover:text-green-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Game Area */}
        <div className="relative p-6">
          <div className="mb-4 flex items-center justify-between font-mono text-sm text-green-400">
            <span>SCORE: {score.toString().padStart(3, "0")}</span>
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3" />
              <span>HI: {highScore.toString().padStart(3, "0")}</span>
            </div>
          </div>

          {/* The Grid */}
          <div
            className="relative mx-auto aspect-square w-full max-w-[400px] border border-green-500/30 bg-black/50"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {/* Overlay States */}
            {status === "IDLE" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-center">
                <p className="mb-4 font-mono text-green-500">
                  READY PLAYER ONE?
                </p>
                <Button
                  onClick={() => {
                    play("click");
                    startGame();
                  }}
                  className="border border-green-500 bg-green-500/20 font-mono text-green-500 hover:bg-green-500 hover:text-black"
                >
                  START_GAME
                </Button>
              </div>
            )}

            {status === "GAME_OVER" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-center">
                <p className="mb-2 font-mono text-xl font-bold text-red-500">
                  GAME OVER
                </p>
                <p className="mb-4 font-mono text-xs text-green-500/70">
                  SCORE: {score}
                </p>
                <Button
                  onClick={() => {
                    play("click");
                    startGame();
                  }}
                  className="gap-2 border border-green-500 bg-green-500/20 font-mono text-green-500 hover:bg-green-500 hover:text-black"
                >
                  <RefreshCcw className="h-4 w-4" />
                  RETRY
                </Button>
              </div>
            )}

            {/* Render Snake & Food */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnake = snake.some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;
              const isHead = snake[0].x === x && snake[0].y === y;

              return (
                <div
                  key={i}
                  className={cn(
                    "w-full h-full border-[0.5px] border-green-900/10 transition-colors duration-75",
                    isHead
                      ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                      : isSnake
                      ? "bg-green-600/80"
                      : isFood
                      ? "bg-red-500 animate-pulse rounded-full"
                      : "bg-transparent"
                  )}
                />
              );
            })}
          </div>

          <div className="mt-4 text-center font-mono text-[10px] text-green-500/50">
            USE ARROW KEYS TO NAVIGATE
          </div>
        </div>
      </div>
    </div>
  );
}
