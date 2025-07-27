import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  showBackButton?: boolean;
  showFullNavigation?: boolean;
  onBackClick?: () => void;
}

const Header = ({ showBackButton = false, showFullNavigation = true, onBackClick }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  
  const links = [
    { to: '/game-room', label: 'Game Room' },
    { to: '/deposit', label: 'Deposit' },
    { to: '/withdraw', label: 'Withdraw' },
    { to: '/admin', label: 'Admin' },
    { to: '/dashboard', label: 'Dashboard' },
  ];
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/70 border-b border-amber-400/20">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {showBackButton ? (
          <button 
            onClick={onBackClick}
            className="text-white hover:text-amber-300 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        ) : (
          <Link to="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">
              786Bet
            </span>
          </Link>
        )}

        <nav className="hidden md:flex items-center gap-6">
          {showFullNavigation && links.map((l) => (
            <Link key={l.to} to={l.to}>
              <span className="text-white/70 hover:text-amber-300 transition">{l.label}</span>
            </Link>
          ))}
          <Link to="/login">
            <button className="border border-amber-400/50 px-4 py-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10">
              Login
            </button>
          </Link>
        </nav>

        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X size={24} /> : <Menu size={24} className="text-white" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-black/80 px-6"
          >
            {showFullNavigation && links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
                <div className="py-3 text-white/70 hover:text-amber-300">{l.label}</div>
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              <button className="mt-2 mb-4 w-full border border-amber-400/50 rounded-lg py-2 text-amber-400">
                Login
              </button>
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
