import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart, MessageSquare, Settings, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
  { icon: Trophy, label: 'Admin Home', path: '/', highlight: true },
  { icon: Settings, label: 'Setup', path: '/setup' },
  { icon: Calendar, label: 'Schedule', path: '/schedule' },
  { icon: BarChart, label: 'Results', path: '/results' },
  { icon: Users, label: 'People', path: '/people' },
  { icon: MessageSquare, label: 'Communication', path: '/communication' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={clsx(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 z-40',
        'lg:translate-x-0 lg:w-64',
        isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Trophy className="text-red-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">Tournament Admin</h1>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'hover:bg-gray-100',
                item.highlight && 'font-semibold',
                isActive ? 'bg-red-50 text-red-600' : 'text-gray-700'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}