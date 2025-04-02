import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, ChevronDown,
  User, Settings, LogOut, Github
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../common/Button';

/**
 * Header component with navigation and user controls
 */
const Header = () => {
  const { user, signOut } = useAuthStore();
  const { toggleSidebar, sidebarOpen, theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-4 p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="md:hidden">
              <Link to="/dashboard" className="flex items-center">
                <Github className="h-6 w-6 text-primary" />
                <span className="ml-2 text-lg font-semibold text-slate-900 dark:text-white">
                  GitPilot
                </span>
              </Link>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* User menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center">
                    <img
                      src={user.photoURL || 'https://github.com/identicons/app/ghAvatar.png'}
                      alt={user.displayName || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="hidden md:flex md:items-center ml-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.displayName}
                      </span>
                      <ChevronDown className="ml-1 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </span>
                  </div>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1"
                    onBlur={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
