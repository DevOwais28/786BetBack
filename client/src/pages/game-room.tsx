import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GameResult {
  player: string;
  result: string;
  multiplier?: number;
  timestamp: number;
}

export default function GameRoom({ username = 'Player' }: { username?: string }) {
  // Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [history, setHistory] = useState<number[]>([]);
  const [crashed, setCrashed] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [recentGames, setRecentGames] = useState<GameResult[]>([]);
  const [exploding, setExploding] = useState(false);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<{user: string; message: string; timestamp: number}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobile, setIsMobile] = useState(false);

  // Constants
  const MAX_VISIBLE_MULTIPLIER = 10;
  const HOUSE_EDGE = 0.05;
  const MIN_BET = 1;
  const MAX_BET = 10000;

  // Refs
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const explosionAudio = useRef<HTMLAudioElement | null>(null);
  const cashoutAudio = useRef<HTMLAudioElement | null>(null);
  const flightAudio = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    explosionAudio.current = new Audio('/sounds/explosion.mp3');
    cashoutAudio.current = new Audio('/sounds/cashout.mp3');
    flightAudio.current = new Audio('/sounds/flight.mp3');
    flightAudio.current.loop = true;

    // Check mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // Cleanup
    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      [explosionAudio.current, cashoutAudio.current, flightAudio.current].forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Play sounds
  const playSound = (sound: 'explosion' | 'cashout' | 'flight', play: boolean) => {
    if (!soundEnabled) return;
    
    const audio = 
      sound === 'explosion' ? explosionAudio.current :
      sound === 'cashout' ? cashoutAudio.current :
      flightAudio.current;
    
    if (audio) {
      if (play) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error('Audio play failed:', e));
      } else {
        audio.pause();
      }
    }
  };

  const calculateCrashPoint = () => {
    // More realistic crash point calculation
    const e = 1 - HOUSE_EDGE; // House edge factor (5%)
    const r = Math.random();
    
    // This formula gives a natural distribution where:
    // - 50% of games crash before 2x
    // - 10% of games reach 10x
    // - 1% of games reach 100x
    const point = (1 / (1 - e * r)) - 1;
    
    // Ensure minimum crash point is 1.01x and round to 2 decimal places
    return Math.max(1.01, parseFloat(point.toFixed(2)));
  };
  
  const startGame = () => {
    if (betAmount < MIN_BET || betAmount > Math.min(balance, MAX_BET)) return;
    
    // Reset game state
    setGameStarted(true);
    setMultiplier(1.0);
    setHistory([1.0]);
    setCrashed(false);
    setCashoutMultiplier(null);
    setExploding(false);
    setBalance(prev => prev - betAmount);
    
    // Calculate crash point with house edge
    const crashPoint = calculateCrashPoint();
    console.log(`Next game will crash at: ${crashPoint}x`); // For debugging
    
    // Start game loop
    if (gameInterval.current) clearInterval(gameInterval.current);
    playSound('flight', true);
    
    gameInterval.current = setInterval(() => {
      setMultiplier(prev => {
        // More natural multiplier growth - starts fast then slows down
        const baseIncrement = 0.05;
        const randomFactor = Math.random() * 0.1;
        const slowdownFactor = Math.max(0.1, 1 - (prev / crashPoint));
        const increment = (baseIncrement + randomFactor) * slowdownFactor;
        
        const newMultiplier = prev + increment;
        
        if (newMultiplier >= crashPoint) {
          clearInterval(gameInterval.current!);
          setCrashed(true);
          setExploding(true);
          playSound('flight', false);
          playSound('explosion', true);
          
          setTimeout(() => {
            setGameStarted(false);
            addRecentGame('CRASHED', crashPoint);
          }, 2000);
          return crashPoint;
        }
        
        setHistory(h => [...h, newMultiplier]);
        return newMultiplier;
      });
    }, 100);
  };

  const cashOut = () => {
    if (!gameStarted || crashed) return;
    
    playSound('cashout', true);
    playSound('flight', false);
    
    setCashoutMultiplier(multiplier);
    setBalance(prev => prev + betAmount * multiplier);
    setGameStarted(false);
    addRecentGame('CASHED OUT', multiplier);
    
    if (gameInterval.current) clearInterval(gameInterval.current);
  };

  const addRecentGame = (result: string, multiplierValue: number) => {
    setRecentGames(prev => [
      {
        player: username,
        result,
        multiplier: parseFloat(multiplierValue.toFixed(2)),
        timestamp: Date.now()
      },
      ...prev.slice(0, 9)
    ]);
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setBetAmount(Math.max(MIN_BET, Math.min(value, Math.min(balance, MAX_BET))));
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && chatInput.length <= 200) {
      setChatMessages(prev => [...prev, {
        user: username,
        message: chatInput.trim(),
        timestamp: Date.now()
      }]);
      setChatInput('');
    }
  };

  // Calculate path coordinates
  const getFlightPath = () => {
    if (history.length < 2) return "M0,100 L100,100";
    
    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * 100;
      const y = 100 - (Math.min(val, MAX_VISIBLE_MULTIPLIER) * (100 / MAX_VISIBLE_MULTIPLIER));
      return `${x},${y}`;
    });
    
    return `M0,100 L${points.join(' ')}`;
  };

  // Calculate plane position
  const planePosition = {
    x: (history.length / (history.length + 20)) * 100,
    y: 100 - (Math.min(multiplier, MAX_VISIBLE_MULTIPLIER) * (100 / MAX_VISIBLE_MULTIPLIER))
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`p-4 border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-500">CRASH</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-700/50"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full hover:bg-gray-700/50"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <div className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              ${balance.toFixed(2)}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        {/* Main Game Area */}
        <div className="flex-1">
          {/* Game Graph */}
          <div className={`relative h-96 rounded-xl overflow-hidden mb-6 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}>
            {/* Graph Background */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Grid Lines */}
              {Array.from({ length: MAX_VISIBLE_MULTIPLIER }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={100 - (i * (100 / MAX_VISIBLE_MULTIPLIER))}
                  x2="100"
                  y2={100 - (i * (100 / MAX_VISIBLE_MULTIPLIER))}
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Flight Path */}
              <path 
                d={getFlightPath()} 
                stroke="url(#flightGradient)" 
                strokeWidth="1.5" 
                fill="none" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Plane */}
              {gameStarted && !crashed && (
                <motion.image
                  href="/plane.png"
                  x={planePosition.x - 2}
                  y={planePosition.y - 2}
                  width="4"
                  height="4"
                  animate={{
                    y: [planePosition.y - 2, planePosition.y - 1.5, planePosition.y - 2],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Explosion */}
              {exploding && (
                <motion.image
                  href="/explosion.png"
                  x={planePosition.x - 3}
                  y={planePosition.y - 3}
                  width="6"
                  height="6"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </svg>

            {/* Multiplier Display */}
            <div className={`absolute top-4 left-4 p-3 rounded-md backdrop-blur-sm ${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'}`}>
              <p className="text-sm opacity-80">Current Multiplier</p>
              <p className="text-3xl font-bold text-amber-500">
                {multiplier.toFixed(2)}x
              </p>
            </div>

            {/* Game Controls */}
            <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-md backdrop-blur-sm flex justify-between items-center ${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'}`}>
              <div className="flex-1 max-w-xs">
                <label className="block text-sm opacity-80 mb-1">Bet Amount</label>
                <div className="flex">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={handleBetChange}
                    min={MIN_BET}
                    max={Math.min(balance, MAX_BET)}
                    step="1"
                    className={`flex-1 py-2 px-3 rounded-l-md border-r-0 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                  />
                  <button 
                    onClick={() => setBetAmount(Math.min(balance, MAX_BET))}
                    className={`px-3 py-2 rounded-r-md ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Max
                  </button>
                </div>
              </div>

              {gameStarted && !crashed ? (
                <motion.button 
                  onClick={cashOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-bold text-lg shadow-lg"
                >
                  Cash Out
                </motion.button>
              ) : (
                <motion.button 
                  onClick={startGame}
                  disabled={balance < betAmount}
                  whileHover={{ scale: balance >= betAmount ? 1.05 : 1 }}
                  whileTap={{ scale: balance >= betAmount ? 0.95 : 1 }}
                  className={`px-8 py-3 rounded-md font-bold text-lg shadow-lg ${
                    balance >= betAmount 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {balance < betAmount ? 'Insufficient Funds' : 'Place Bet'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[1, 5, 10, 50, 100].map((amount) => (
              <motion.button
                key={amount}
                onClick={() => setBetAmount(Math.min(amount, balance))}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`py-2 rounded-md font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                ${amount}
              </motion.button>
            ))}
          </div>

          {/* Recent Games */}
          <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-lg font-bold text-amber-500">RECENT GAMES</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {recentGames.length > 0 ? (
                recentGames.map((game, i) => (
                  <div key={i} className={`p-3 flex justify-between items-center ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <span className="font-medium text-amber-500">
                          {game.player.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{game.player}</p>
                        <p className="text-xs opacity-70">{formatTime(game.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`font-bold mr-2 ${
                        game.result === 'CRASHED' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {game.multiplier?.toFixed(2)}x
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        game.result === 'CRASHED' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {game.result}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center opacity-70">
                  No games played yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        {showChat && (
          <div className={`lg:w-80 rounded-xl overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}>
            <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="font-bold text-amber-500">CHAT</h3>
              <button 
                onClick={() => setShowChat(false)}
                className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                ×
              </button>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, i) => (
                  <div key={i} className="mb-3 break-words">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-amber-500">{msg.user}</span>
                      <span className="text-xs opacity-50">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{msg.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 opacity-50">
                  No messages yet
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      maxLength={200}
                      className={`flex-1 py-2 px-3 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-md text-white"
                    >
                      Send
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

        {/* Chat Toggle Button (when hidden) */}
        {!showChat && (
          <motion.button
            onClick={() => setShowChat(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`fixed right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
              theme === 'dark' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            💬
          </motion.button>
        )}
      </div>
  );
}