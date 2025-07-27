import { Link } from "wouter";
import { Wallet, Gamepad2, Users, LayoutDashboard } from 'lucide-react';

interface DashboardSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'history', label: 'Game History', icon: Gamepad2 },
  { id: 'referrals', label: 'Referrals', icon: Users },
];

export default function DashboardSidebar({ activeSection, setActiveSection }: DashboardSidebarProps) {
  return (
    <div className="h-full bg-gray-900 text-white p-4 sm:p-6 flex flex-col">
      <div className="mb-8 sm:mb-12">
        <Link href="/">
          <span className="text-2xl sm:text-3xl font-bold text-yellow-400 cursor-pointer">786Bet</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${ 
              activeSection === item.id
                ? 'bg-yellow-400/10 text-yellow-400 shadow-inner shadow-yellow-400/10'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto">
        <Link href="/game-room">
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Play Now
          </button>
        </Link>
      </div>
    </div>
  );
}
