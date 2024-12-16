// src/components/SolanaGameOfLife.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { GameOfLife } from '@/utils/gameOfLife';
import { SolanaTransaction, SolanaTransactionFetcher } from '@/utils/solanaTransactions';
import { Info, X as CloseIcon, ExternalLink } from 'lucide-react';

interface PatternAnalysis {
  name: string;
  rarity: {
    level: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    color: string;
  };
  hash: string;
}

interface PatternStats {
  population: number;
  totalCells: number;
  startTime: number;
}

const GRID_SIZE = 15;
const MAX_PATTERNS = 48;

const getPatternRarity = (density: number): PatternAnalysis['rarity'] => {
  if (density < 0.2) {
    return { level: 'Common', color: 'text-gray-400' };
  } else if (density < 0.4) {
    return { level: 'Rare', color: 'text-blue-400' };
  } else if (density < 0.6) {
    return { level: 'Epic', color: 'text-purple-400' };
  } else {
    return { level: 'Legendary', color: 'text-yellow-400' };
  }
};

const getPatternName = (density: number, seed: number): string => {
  const prefixes = ['Nebula', 'Cosmos', 'Stellar', 'Nova', 'Pulsar', 'Quasar'];
  const suffixes = ['Pattern', 'Formation', 'Structure', 'Array', 'Matrix'];
  
  const prefixIndex = Math.abs(seed) % prefixes.length;
  const suffixIndex = Math.floor(density * suffixes.length);
  
  return `${prefixes[prefixIndex]} ${suffixes[suffixIndex]}`;
};

// Replace the ConwayInfoModal component in SolanaGameOfLife.tsx

const ConwayInfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div 
      className="bg-gray-800/90 p-6 rounded-xl max-w-2xl mx-4 backdrop-blur-md relative"
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700/50 transition-colors"
      >
        <CloseIcon className="w-5 h-5 text-gray-400" />
      </button>

      <h3 className="text-2xl font-bold text-white mb-4">Conway&apos;s Game of Life</h3>
      <p className="text-gray-300 mb-4">
        The Game of Life, created by mathematician John Conway in 1970, 
        is a cellular automaton where cells evolve based on simple rules:
      </p>
      <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Any live cell with fewer than two live neighbors dies (underpopulation)</li>
        <li>Any live cell with two or three live neighbors lives</li>
        <li>Any live cell with more than three live neighbors dies (overpopulation)</li>
        <li>Any dead cell with exactly three live neighbors becomes alive</li>
      </ul>
      <div className="text-gray-400 text-sm mb-6">
        This visualization generates unique Game of Life patterns from Solana blockchain transactions,
        creating an artistic representation of network activity.
      </div>
    </div>
  </div>
);

const SolanaGameOfLife = () => {
  const [gameInstances, setGameInstances] = useState<Map<string, { game: GameOfLife, tx: SolanaTransaction }>>(new Map());
  const [patternStats, setPatternStats] = useState<Map<string, PatternStats>>(new Map());
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [fetcher] = useState(() => new SolanaTransactionFetcher());
  const [isLoading, setIsLoading] = useState(true);

  const calculatePopulation = (game: GameOfLife): number => {
    return game.getGrid().flat().filter(Boolean).length;
  };

  useEffect(() => {
    const initializePatterns = () => {
      for (let i = 0; i < MAX_PATTERNS; i++) {
        const initialTx = {
          signature: `init-${i}-${Date.now()}`,
          timestamp: Date.now() / 1000,
          amount: 0,
          type: 'initial'
        };
        const seed = fetcher.hashToSeed(initialTx.signature);
        const initialGame = new GameOfLife(GRID_SIZE, GRID_SIZE, seed);
        
        setGameInstances(prev => {
          const updated = new Map(prev);
          const key = `Pattern ${i + 1}`;
          updated.set(key, { game: initialGame, tx: initialTx });
          return updated;
        });
        
        setPatternStats(prev => {
          const updated = new Map(prev);
          updated.set(`Pattern ${i + 1}`, {
            population: calculatePopulation(initialGame),
            totalCells: GRID_SIZE * GRID_SIZE,
            startTime: Date.now()
          });
          return updated;
        });
      }
      setIsLoading(false);
    };

    const fetchTransactions = async () => {
      try {
        const transactions = await fetcher.fetchTokenTransactions();
        
        transactions.forEach(transaction => {
          const seed = fetcher.hashToSeed(transaction.signature);
          const newGame = new GameOfLife(GRID_SIZE, GRID_SIZE, seed);
          const key = `Tx ${transaction.signature.slice(0, 8)}`;
          
          setGameInstances(prev => {
            const updated = new Map(prev);
            updated.set(key, { game: newGame, tx: transaction });
            return updated;
          });
          
          setPatternStats(prev => {
            const updated = new Map(prev);
            updated.set(key, {
              population: calculatePopulation(newGame),
              totalCells: GRID_SIZE * GRID_SIZE,
              startTime: Date.now()
            });
            return updated;
          });
        });
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    initializePatterns();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, [fetcher]);

  useEffect(() => {
    if (gameInstances.size === 0) return;

    const animationInterval = setInterval(() => {
      setGameInstances(prev => {
        const updated = new Map(prev);
        updated.forEach(({ game, tx }, key) => {
          game.nextGeneration();
          
          setPatternStats(prevStats => {
            const updated = new Map(prevStats);
            const current = prevStats.get(key);
            if (current) {
              updated.set(key, {
                ...current,
                population: calculatePopulation(game)
              });
            }
            return updated;
          });
        });
        return updated;
      });
    }, 150);

    return () => clearInterval(animationInterval);
  }, [gameInstances.size]);

  const renderCanvas = (
    canvas: HTMLCanvasElement | null,
    game: GameOfLife,
    size: number = 200
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = game.getGrid();
    const cellSize = size / GRID_SIZE;

    ctx.clearRect(0, 0, size, size);
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = `hsl(${(x + y) * 12}, 70%, 50%)`;
          ctx.fillRect(
            x * cellSize,
            y * cellSize,
            cellSize - 1,
            cellSize - 1
          );
        }
      });
    });
  };

  return (
    <div className="fixed inset-0 bg-black">
      <button
        onClick={() => setShowInfo(true)}
        className="fixed top-4 right-4 z-20 bg-gray-800/50 p-2 rounded-full hover:bg-gray-700/50 transition"
        title="About Conway's Game of Life"
      >
        <Info className="w-6 h-6 text-blue-400" />
      </button>

      {showInfo && <ConwayInfoModal onClose={() => setShowInfo(false)} />}

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-blue-400 animate-pulse">Initializing patterns...</div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto">
          <div className="min-h-screen p-px bg-blue-900/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 auto-rows-min">
              {Array.from(gameInstances.entries()).map(([key, { game, tx }]) => {
                const stats = patternStats.get(key);
                const density = (stats?.population || 0) / (GRID_SIZE * GRID_SIZE);
                const rarity = getPatternRarity(density);
                const name = getPatternName(density, fetcher.hashToSeed(tx.signature));
                const duration = stats ? Math.floor((Date.now() - stats.startTime) / 1000) : 0;

                return (
                  <div 
                    key={key}
                    onClick={() => setSelectedPattern(selectedPattern === key ? null : key)}
                    className="relative aspect-square bg-gray-900/50 backdrop-blur-sm group hover:z-10"
                  >
                    <canvas
                      width={200}
                      height={200}
                      className="absolute inset-0 w-full h-full transition-transform group-hover:scale-105"
                      ref={canvas => renderCanvas(canvas, game)}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                        <div className={`text-sm ${rarity.color} font-medium truncate`}>
                          {name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Population: {stats?.population || 0}
                          <span className="mx-2">•</span>
                          Time: {duration}s
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fixed bottom-4 right-4 text-gray-400 text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            Scroll for more patterns
          </div>
        </div>
      )}

      {selectedPattern && gameInstances.has(selectedPattern) && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedPattern(null)}
          />
          
          <div className="relative bg-gradient-to-b from-gray-900/95 to-black border-t border-blue-500/20">
            <div className="max-w-6xl mx-auto p-6">
              <button
                onClick={() => setSelectedPattern(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                aria-label="Close panel"
              >
                <CloseIcon className="w-5 h-5 text-gray-400" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative aspect-square bg-black/50 rounded-xl overflow-hidden border border-gray-800">
                  <canvas
                    width={400}
                    height={400}
                    className="w-full h-full"
                    ref={canvas => renderCanvas(canvas, gameInstances.get(selectedPattern)!.game, 400)}
                  />
                </div>

                <div className="md:col-span-2 space-y-6">
                  {(() => {
                    const { game, tx } = gameInstances.get(selectedPattern)!;
                    const stats = patternStats.get(selectedPattern);
                    const density = (stats?.population || 0) / (GRID_SIZE * GRID_SIZE);
                    const rarity = getPatternRarity(density);
                    const name = getPatternName(density, fetcher.hashToSeed(tx.signature));
                    const duration = stats ? Math.floor((Date.now() - stats.startTime) / 1000) : 0;

                    return (
                      <>
                        <div>
                          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            {name}
                          </h3>
                          <div className={`${rarity.color} text-lg font-medium mt-1`}>
                            {rarity.level} Pattern
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                            <div className="text-blue-400 text-sm font-medium">Population</div>
                            <div className="text-white text-lg font-bold mt-1">
                              {stats?.population || 0}
                              <span className="text-sm text-gray-400 ml-1">cells</span>
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                            <div className="text-blue-400 text-sm font-medium">Time Alive</div>
                            <div className="text-white text-lg font-bold mt-1">
                              {duration}
                              <span className="text-sm text-gray-400 ml-1">sec</span>
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                            <div className="text-blue-400 text-sm font-medium">Density</div>
                            <div className="text-white text-lg font-bold mt-1">
                                {(density * 100).toFixed(1)}
                                  <span className="text-sm text-gray-400 ml-1">%</span>
                                    </div>
                                    </div>
                                    </div>

                            <div className="flex gap-4">
<a 
href={`https://solscan.io/tx/${tx.signature}`}
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
>
View on Solscan
<ExternalLink className="w-4 h-4 ml-2" />
</a>
</div>
</>
);
})()}
</div>
</div>
</div>
</div>
</div>
)}
</div>
);
};

export default SolanaGameOfLife;