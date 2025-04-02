import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Settings, CreditCard,
  Github, Database, FolderClosed, Archive,
  ChevronRight
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

/**
 * Sidebar navigation component
 */
const Sidebar = () => {
  const { sidebarOpen } = useUiStore();
  const { user } = useAuthStore();

  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      title: 'Repositories',
      icon: <Database className="h-5 w-5" />,
      path: '/repositories',
    },
    {
      title: 'Organizations',
      icon: <FolderClosed className="h-5 w-5" />,
      path: '/organizations',
    },
    {
      title: 'Archives',
      icon: <Archive className="h-5 w-5" />,
      path: '/archives',
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
    },
    {
      title: 'Billing',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/billing',
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-center border-b border-slate-200 dark:border-slate-700">
        <NavLink to="/dashboard" className="flex items-center">
          <Github className={`h-6 w-6 text-primary ${!sidebarOpen && 'mx-auto'}`} />
          {sidebarOpen && (
            <span className="ml-2 text-xl font-semibold text-slate-900 dark:text-white">
              GitPilot
            </span>
          )}
        </NavLink>
      </div>

      {/* User info (collapsed sidebar) */}
      {!sidebarOpen && user && (
        <div className="flex flex-col items-center pt-6 pb-4">
          <img
            src={user.photoURL || 'https://github.com/identicons/app/ghAvatar.png'}
            alt={user.displayName || 'User'}
            className="h-10 w-10 rounded-full"
          />
        </div>
      )}

      {/* User info (expanded sidebar) */}
      {sidebarOpen && user && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <img
              src={user.photoURL || 'https://github.com/identicons/app/ghAvatar.png'}
              alt={user.displayName || 'User'}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-2 px-3 rounded-md ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } ${!sidebarOpen && 'justify-center'}`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.title}</span>
                )}
                {sidebarOpen && (
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
