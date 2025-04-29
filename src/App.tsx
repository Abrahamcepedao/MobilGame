import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Trophy, Heart } from 'lucide-react';

interface GameObject {
  x: number;
  y: number;
  type: 'obstacle' | 'coin';
}

function App() {
  const [carPosition, setCarPosition] = useState(200);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(5); // Initial speed

  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;
  const CAR_WIDTH = 40;
  const CAR_HEIGHT = 80;
  const OBJECT_SIZE = 30;
  const MOVEMENT_STEP = 10;
  const MAX_SPEED = 15; // Maximum speed
  const SPEED_INCREASE_INTERVAL = 10; // Increase speed every 10 seconds
  const SPEED_INCREASE_AMOUNT = 1; // Speed increase step

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTime(0);
    setLives(3);
    setGameObjects([]);
    setIsGameOver(false);
    setCarPosition(200);
    setSpeed(5); // Reset speed to initial value
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || isGameOver) return;

    if (event.key === 'ArrowLeft') {
      setCarPosition(prev => Math.max(0, prev - MOVEMENT_STEP));
    } else if (event.key === 'ArrowRight') {
      setCarPosition(prev => Math.min(GAME_WIDTH - CAR_WIDTH, prev + MOVEMENT_STEP));
    }
  }, [gameStarted, isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Speed increase effect
  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    if (time > 0 && time % SPEED_INCREASE_INTERVAL === 0) {
      setSpeed(prevSpeed => Math.min(prevSpeed + SPEED_INCREASE_AMOUNT, MAX_SPEED));
    }
  }, [time, gameStarted, isGameOver]);

  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const gameLoop = setInterval(() => {
      setTime(prev => prev + 1);
      
      setGameObjects(prevObjects => {
        const newObjects = prevObjects
          .map(obj => ({ ...obj, y: obj.y + speed })) // Use current speed
          .filter(obj => obj.y < GAME_HEIGHT);

        newObjects.forEach(obj => {
          const collision = 
            carPosition < obj.x + OBJECT_SIZE &&
            carPosition + CAR_WIDTH > obj.x &&
            GAME_HEIGHT - CAR_HEIGHT < obj.y + OBJECT_SIZE &&
            GAME_HEIGHT > obj.y;

          if (collision) {
            if (obj.type === 'coin') {
              setScore(prev => prev + 10);
              obj.y = GAME_HEIGHT + 100;
            } else if (obj.type === 'obstacle') {
              setLives(prev => {
                if (prev <= 1) {
                  setIsGameOver(true);
                  setHighScore(current => Math.max(current, score));
                  return 0;
                }
                return prev - 1;
              });
              obj.y = GAME_HEIGHT + 100;
            }
          }
        });

        return newObjects;
      });

      // Adjust spawn rate based on speed
      if (Math.random() < 0.05 * (speed / 5)) {
        const newObject: GameObject = {
          x: Math.random() * (GAME_WIDTH - OBJECT_SIZE),
          y: -OBJECT_SIZE,
          type: Math.random() < 0.7 ? 'obstacle' : 'coin'
        };
        setGameObjects(prev => [...prev, newObject]);
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameStarted, isGameOver, carPosition, score, speed]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-lg">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-6 h-6 text-blue-500" />
              <span className="text-lg">{time}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Speed:</span>
              <span className="text-lg text-green-500">{speed.toFixed(1)}x</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(lives)].map((_, i) => (
              <Heart key={i} className="w-6 h-6 text-red-500" fill="currentColor" />
            ))}
          </div>
        </div>

        <div className="perspective-1000">
          <div 
            className="relative bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg overflow-hidden transform-style-3d rotate-x-60"
            style={{ 
              width: GAME_WIDTH, 
              height: GAME_HEIGHT,
              transformOrigin: 'center center'
            }}
          >
            {/* Track background with 3D effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-900"></div>
            
            {/* Animated track lines */}
            <div 
              className="absolute inset-0 track-lines"
              style={{
                animationDuration: `${1 / (speed / 5)}s`
              }}
            ></div>

            {/* Side barriers */}
            <div className="absolute left-0 h-full w-4 bg-gradient-to-r from-red-600 to-red-700 transform translate-x-[-2px] skew-x-[-45deg] origin-top"></div>
            <div className="absolute right-0 h-full w-4 bg-gradient-to-l from-red-600 to-red-700 transform translate-x-[2px] skew-x-[45deg] origin-top"></div>

            {/* Car with 3D effect */}
            <div
              className="absolute bottom-0 transition-all duration-100 transform-gpu hover:scale-105"
              style={{
                left: carPosition,
                width: CAR_WIDTH,
                height: CAR_HEIGHT,
                transform: 'translateZ(20px)',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))'
              }}
            >
              {/* Car body */}
              <div
                className="absolute bottom-0 w-full h-3/4"
                style={{
                  background: 'linear-gradient(to bottom, #e10600 60%, #b30500)',
                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                  borderRadius: '8px'
                }}
              ></div>
              {/* Car cockpit */}
              <div
                className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2"
                style={{
                  width: '60%',
                  height: '30%',
                  background: '#111',
                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                }}
              ></div>
              {/* Front wing */}
              <div
                className="absolute bottom-0 w-full"
                style={{
                  height: '10%',
                  background: '#ddd',
                  clipPath: 'polygon(0 50%, 100% 50%, 80% 100%, 20% 100%)',
                }}
              ></div>
            </div>

            {/* Game objects with 3D effect */}
            {gameObjects.map((obj, index) => (
              <div
                key={index}
                className={`absolute transform-gpu transition-transform ${
                  obj.type === 'coin' ? 'coin-3d' : 'obstacle-3d'
                }`}
                style={{
                  left: obj.x,
                  top: obj.y,
                  width: OBJECT_SIZE,
                  height: OBJECT_SIZE,
                  transform: `translateZ(${30 - (obj.y / GAME_HEIGHT) * 30}px)`,
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                }}
              ></div>
            ))}

            {/* Game over or start screen */}
            {(!gameStarted || isGameOver) && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center transform-gpu" style={{ transform: 'translateZ(50px)' }}>
                <div className="text-center">
                  {isGameOver && (
                    <>
                      <h2 className="text-2xl font-bold mb-4 text-shadow-lg">Game Over!</h2>
                      <p className="mb-2">Score: {score}</p>
                      <p className="mb-4">High Score: {highScore}</p>
                    </>
                  )}
                  <button
                    onClick={startGame}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 hover:shadow-lg"
                  >
                    {isGameOver ? 'Play Again' : 'Start Game'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400 text-center">
          Use ← → arrow keys to move the car
        </div>
      </div>
    </div>
  );
}

export default App;