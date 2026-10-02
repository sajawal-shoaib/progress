import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Activity,
  BarChart3,
  BookOpen,
  Trophy,
  Settings,
  Flame,
  Snowflake,
} from 'lucide-react';
import { NavigationTab } from '../../types/winterArc';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentDayNumber: number;
  currentStreak: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentDayNumber,
  currentStreak,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'today', label: "Today's Check-In", icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'calendar', label: '90-Day Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'habits', label: 'Progress', icon: <Activity className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'journal', label: 'Daily Journal', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'milestones', label: 'Checkpoints', icon: <Trophy className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#090a0f] border-r border-[#1f2434] h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1f2434]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 shadow-lg shadow-sky-950/40">
            <Snowflake className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white flex items-center gap-2">
              WINTER ARC
            </h1>
            <p className="text-xs text-sky-400/80 font-mono tracking-tight font-medium">
              90 Days. No Excuses.
            </p>
          </div>
        </div>

        {/* Day Status Pill */}
        <div className="mt-4 pt-4 border-t border-gray-800/60 flex items-center justify-between text-xs">
          <div className="bg-[#12141c] border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="font-mono font-semibold text-gray-200">
              DAY {currentDayNumber} / 90
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-mono font-bold bg-amber-950/30 border border-amber-900/40 px-2.5 py-1.5 rounded-lg">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{currentStreak}d</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-950/20 font-semibold'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-[#12141c] border border-transparent'
              }`}
            >
              <span
                className={`transition-colors duration-200 ${
                  isActive ? 'text-sky-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Motivation */}
      <div className="p-4 border-t border-[#1f2434] bg-[#0d0f17]">
        <div className="p-3 rounded-xl bg-[#12141c] border border-gray-800/80 text-center">
          <p className="text-[11px] text-gray-400 italic">
            "One bad day doesn't become two."
          </p>
        </div>
      </div>
    </aside>
  );
};
