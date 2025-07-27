import { useState } from 'react';
import GameRoom from './game-room';

export default function Aviator() {
  const [name, setName] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setLoggedIn(true);
          }}
          className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm border border-amber-500/30 rounded-xl p-8 shadow-2xl shadow-amber-500/20"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-2">
              AVIATOR
            </div>
            <div className="h-1 w-16 bg-amber-500 rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Player Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={12}
                className="w-full bg-gray-700/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                autoComplete="off"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-amber-500/30"
            >
              JOIN GAME
            </button>
          </div>
        </form>
      </div>
    );
  }

  return <GameRoom username={name} />;
}