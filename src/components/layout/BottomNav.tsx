import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, ClipboardList, LayoutGrid, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../lib/store';

export function BottomNav() {
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Notes', path: '/notes/select', icon: BookOpen },
    { name: 'Tests', path: '/mock-tests/select', icon: ClipboardList },
    { name: 'Apps', path: '/study-apps/select', icon: LayoutGrid },
    { name: 'Profile', path: user ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-gray-900"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
