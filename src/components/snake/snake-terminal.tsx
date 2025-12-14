"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  RefreshCcw,
  Trophy,
  Keyboard,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const gridRef = useRef<HTMLDivElement>(null); // Ref for the grid to shake

  // Entrance Animation
  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" },
      );
    },
    { scope: containerRef },
  );

  // 💥 NEW: Game Over Impact Shake
  useGSAP(() => {
    if (status === "GAME_OVER") {
      gsap.fromTo(
        gridRef.current,
        { x: -5 },
        {
          x: 5,
          duration: 0.05,
          repeat: 5,
          yoyo: true,
          clearProps: "x",
          onComplete: () => {
            // Optional: Red flash effect could go here
            gsap.to(gridRef.current, {
              borderColor: "rgba(239, 68, 68, 0.8)", // red-500
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              clearProps: "borderColor",
            });
          },
        },
      );
      play("click"); // Or a specific 'death' sound if available
    }
  }, [status]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ",
          "Space",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        // UP
        case "ArrowUp":
        case "w":
        case "W":
          changeDirection("UP");
          break;

        // DOWN
        case "ArrowDown":
        case "s":
        case "S":
          changeDirection("DOWN");
          break;

        // LEFT
        case "ArrowLeft":
        case "a":
        case "A":
          changeDirection("LEFT");
          break;

        // RIGHT
        case "ArrowRight":
        case "d":
        case "D":
          changeDirection("RIGHT");
          break;

        // SPACE: start from IDLE or retry after GAME_OVER
        case " ":
        case "Spacebar":
        case "Space":
          if (status === "IDLE" || status === "GAME_OVER") {
            play("click");
            startGame();
          }
          break;

        // ESC: close terminal
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeDirection, onClose, status, startGame, play]);

  // Touch/Click Control Handlers
  const handleControl = (dir: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    play("click");
    if (status === "IDLE") {
      startGame();
    }
    changeDirection(dir);
  };

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
        <div className="relative p-6 flex flex-col items-center">
          <div className="w-full mb-4 flex items-center justify-between font-mono text-sm text-green-400">
            <span>SCORE: {score.toString().padStart(3, "0")}</span>
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-green-500/5 px-2 py-1 text-[9px] font-mono text-green-300">
              <Keyboard className="h-3 w-3" />
              <span>Arrows / WASD · Space · Esc</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3" />
              <span>HI: {highScore.toString().padStart(3, "0")}</span>
            </div>
          </div>

          {/* The Grid - Added Ref for Shake Effect */}
          <div
            ref={gridRef}
            className="relative mx-auto aspect-square w-full max-w-90 border border-green-500/30 bg-black/50"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {/* Overlay States */}
            {status === "IDLE" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-center p-4">
                <p className="mb-4 font-mono text-green-500 text-lg">
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
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-center p-4">
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
                          : "bg-transparent",
                  )}
                />
              );
            })}
          </div>

          {/* MOBILE CONTROLS (Visible on small screens) */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden w-full max-w-50">
            <div />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-green-500/30 bg-green-500/5 text-green-500 active:bg-green-500 active:text-black"
              onClick={() => handleControl("UP")}
            >
              <ChevronUp className="h-6 w-6" />
            </Button>
            <div />

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-green-500/30 bg-green-500/5 text-green-500 active:bg-green-500 active:text-black"
              onClick={() => handleControl("LEFT")}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-green-500/30 bg-green-500/5 text-green-500 active:bg-green-500 active:text-black"
              onClick={() => handleControl("DOWN")}
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-green-500/30 bg-green-500/5 text-green-500 active:bg-green-500 active:text-black"
              onClick={() => handleControl("RIGHT")}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="mt-4 text-center font-mono text-[10px] text-green-500/60 hidden sm:block">
            {status === "IDLE" && (
              <>
                Press <span className="text-green-300">SPACE</span> to start ·
                Arrows / WASD to move ·{" "}
                <span className="text-green-300">ESC</span> to close
              </>
            )}
            {status === "PLAYING" && (
              <>
                Arrows / WASD to move · After Game Over press{" "}
                <span className="text-green-300">SPACE</span> to retry ·{" "}
                <span className="text-green-300">ESC</span> to close
              </>
            )}
            {status === "GAME_OVER" && (
              <>
                Game Over · Press <span className="text-green-300">SPACE</span>{" "}
                to play again · <span className="text-green-300">ESC</span> to
                close
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
