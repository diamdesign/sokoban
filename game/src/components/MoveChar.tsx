import { useContext, useCallback, useEffect, useState } from "react";
import { MyContext } from "../ContextProvider/ContextProvider";
import { playSound } from "../components/playSound";
import HighScore from "./highscore";

interface MoveCharProps {
  mapData: string[][];
  setMapData: (mapData: string[][]) => void;
  setPlayerDirection: (direction: string) => void;
  playerPosition: { x: number; y: number };
  setPlayerPosition: (position: { x: number; y: number }) => void;
  indicatorPositions: { x: number; y: number }[];
  setIndicatorPositions: (positions: { x: number; y: number }[]) => void;
  boxPositions: { x: number; y: number }[];
  setBoxPositions: (positions: { x: number; y: number }[]) => void;
}
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const directionMap: Record<Direction, { x: number; y: number }> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function MoveChar({
  mapData,
  setMapData,
  setPlayerDirection,
  playerPosition,
  setPlayerPosition,
  indicatorPositions,
  boxPositions,
  setBoxPositions,
}: MoveCharProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { counter, setCounter } = useContext(MyContext);
  const { elapsedTime, setElapsedTime } = useContext(MyContext);
  const { wonGame, setWonGame } = useContext(MyContext);
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [currentLevel, setCurrentLevel] = useState<string>("1");

  useEffect(() => {
    if (startTime && gameRunning) {
      const intervalId = setInterval(() => {
        const elapsed = Math.floor(Date.now() - startTime.getTime());
        setElapsedTime(elapsed);
      }, 100);

      return () => clearInterval(intervalId);
    }
  }, [startTime, gameRunning]);

  const startGame = useCallback(() => {
    setStartTime(new Date());
    setGameRunning(true);
    setWonGame(false);
  }, []);

  const stopGame = useCallback(() => {
    setStartTime(null);
    setGameRunning(false);
    setWonGame(true);
  }, []);

  const handlePlayerMove = useCallback(
    (direction: string) => {
      setPlayerDirection(direction.toLowerCase());

      const newPosition = {
        x: playerPosition.x + directionMap[direction as Direction].x,
        y: playerPosition.y + directionMap[direction as Direction].y,
      };

      if (
        mapData.length > 0 &&
        mapData[0] &&
        newPosition.x >= 0 &&
        newPosition.x < mapData[0].length &&
        newPosition.y >= 0 &&
        newPosition.y < mapData.length
      ) {
        const newMapData = mapData.map((row: string[]) => [...row]);

        if (newMapData[newPosition.y][newPosition.x] !== "#") {
          const boxIndex = boxPositions.findIndex(
            (pos) => pos.x === newPosition.x && pos.y === newPosition.y
          );

          playSound("walk", 0.3);

          if (boxIndex !== -1) {
            const beyondBoxPosition = {
              x: newPosition.x + directionMap[direction as Direction].x,
              y: newPosition.y + directionMap[direction as Direction].y,
            };

            if (
              beyondBoxPosition.x >= 0 &&
              beyondBoxPosition.x < newMapData[0].length &&
              beyondBoxPosition.y >= 0 &&
              beyondBoxPosition.y < newMapData.length &&
              (newMapData[beyondBoxPosition.y][beyondBoxPosition.x] === "," ||
                newMapData[beyondBoxPosition.y][beyondBoxPosition.x] === "I")
            ) {
              newMapData[beyondBoxPosition.y][beyondBoxPosition.x] = "B";
              playSound("pushbox", 0.4);
              if (
                indicatorPositions.some(
                  (pos) =>
                    pos.x === boxPositions[boxIndex].x &&
                    pos.y === boxPositions[boxIndex].y
                )
              ) {
                newMapData[boxPositions[boxIndex].y][boxPositions[boxIndex].x] =
                  "I";
              } else {
                newMapData[boxPositions[boxIndex].y][boxPositions[boxIndex].x] =
                  ",";
              }

              if (
                indicatorPositions.some(
                  (pos) =>
                    pos.x === beyondBoxPosition.x &&
                    pos.y === beyondBoxPosition.y
                )
              ) {
                playSound("boxindication", 0.4);
              }
              if (
                indicatorPositions.some(
                  (pos) =>
                    pos.x === playerPosition.x && pos.y === playerPosition.y
                )
              ) {
                newMapData[playerPosition.y][playerPosition.x] = "I";
              } else {
                newMapData[playerPosition.y][playerPosition.x] = ",";
              }
              newMapData[newPosition.y][newPosition.x] = "P";

              setCounter(counter + 1);
              setMapData(newMapData);

              const newBoxPositions = [...boxPositions];
              newBoxPositions[boxIndex] = beyondBoxPosition;
              setBoxPositions(newBoxPositions);

              setPlayerPosition(newPosition);
            }
          } else {
            if (
              indicatorPositions.some(
                (pos) =>
                  pos.x === playerPosition.x && pos.y === playerPosition.y
              )
            ) {
              newMapData[playerPosition.y][playerPosition.x] = "I";
            } else {
              newMapData[playerPosition.y][playerPosition.x] = ",";
            }
            newMapData[newPosition.y][newPosition.x] = "P";
            setCounter(counter + 1);
            setMapData(newMapData);

            setPlayerPosition(newPosition);
          }

          if (!gameRunning && counter === 0) {
            startGame(); // Start the game when the first move is made
          }
        }
      }
    },
    [
      mapData,
      playerPosition,
      setPlayerDirection,
      indicatorPositions,
      setMapData,
      setPlayerPosition,
      setBoxPositions,
      boxPositions,
      gameRunning,
      counter,
      startGame,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case "ARROWUP":
        case "W":
          handlePlayerMove("UP");
          break;
        case "ARROWDOWN":
        case "S":
          handlePlayerMove("DOWN");
          break;
        case "ARROWLEFT":
        case "A":
          handlePlayerMove("LEFT");
          break;
        case "ARROWRIGHT":
        case "D":
          handlePlayerMove("RIGHT");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePlayerMove]);

  useEffect(() => {
    let startTouchX: number | null = null;
    let startTouchY: number | null = null;
    const threshold = 10; // Threshold value for touch movement

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      startTouchX = touch.clientX;
      startTouchY = touch.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (startTouchX === null || startTouchY === null) return; // Touch didn't start properly

      const touch = event.touches[0];
      const distX = touch.clientX - startTouchX;
      const distY = touch.clientY - startTouchY;

      // Check if the touch movement exceeds the threshold
      if (Math.abs(distX) < threshold && Math.abs(distY) < threshold) return;

      let direction: Direction | null = null;

      // Determine the swipe direction
      if (Math.abs(distX) > Math.abs(distY)) {
        direction = distX > 0 ? "RIGHT" : "LEFT";
      } else {
        direction = distY > 0 ? "DOWN" : "UP";
      }

      if (direction) {
        handlePlayerMove(direction);
        // Reset the initial touch position after each successful move
        startTouchX = touch.clientX;
        startTouchY = touch.clientY;
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handlePlayerMove]);

  useEffect(() => {
    let allIndicatorsCovered = true;
    for (const position of indicatorPositions) {
      const { x, y } = position;
      if (mapData[y][x] !== "B") {
        allIndicatorsCovered = false;
        break;
      }
    }
    // If all indicators are covered, declare victory
    if (allIndicatorsCovered) {
      stopGame();
      setWonGame(true);
    }
  }, [mapData, counter, elapsedTime, currentLevel]);

  return (
    <>
      {wonGame && counter > 0 && elapsedTime > 0 && (
        <HighScore
          currentLevel={currentLevel}
          counter={counter}
          elapsedTime={elapsedTime}
        />
      )}
    </>
  );
}
