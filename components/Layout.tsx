import React from 'react';
import { ViewState } from '../types';
import { Moon, Sun, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  view: ViewState;
  setView: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, view, setView, isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks: { label: string; value: ViewState }[] = [
    { label: 'Features', value: 'features' },
    { label: 'Pricing', value: 'pricing' },
    { label: 'Resources', value: 'resources' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-nordic-bg text-nordic-text dark:bg-nordic-darkBg dark:text-nordic-darkText transition-colors duration-300">
      {/* Header */}
      <header className="h-16 border-b border-nordic-border dark:border-nordic-darkBorder bg-white/80 dark:bg-nordic-darkSurface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => setView('landing')}
          >
            <div className="w-8 h-8 bg-nordic-accent rounded-md flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-nordic-accent dark:text-white">Nordic Studio</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button 
                key={link.value}
                onClick={() => setView(link.value)}
                className={`text-sm font-medium transition-colors ${view === link.value ? 'text-nordic-accent dark:text-white' : 'text-nordic-muted dark:text-nordic-darkMuted hover:text-nordic-text dark:hover:text-white'}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-nordic-clay dark:hover:bg-nordic-darkClay text-nordic-muted dark:text-nordic-darkMuted transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth buttons now handled in App landing view; keep header simple navigation */}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-nordic-text dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-nordic-darkSurface border-b border-nordic-border dark:border-nordic-darkBorder p-4 shadow-lg flex flex-col space-y-4">
            {navLinks.map((link) => (
              <button 
                key={link.value}
                onClick={() => { setView(link.value); setIsMobileMenuOpen(false); }}
                className="text-left text-sm font-medium text-nordic-text dark:text-white py-2"
              >
                {link.label}
              </button>
            ))}
            <button 
              onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }}
              className="text-left text-sm font-medium text-nordic-accent dark:text-white py-2"
            >
              Log in / Sign up
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-nordic-border dark:border-nordic-darkBorder bg-white dark:bg-nordic-darkSurface py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-nordic-muted dark:text-nordic-darkMuted">
          <p>© 2024 Nordic Studio. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => setView('privacy')} className="hover:text-nordic-text dark:hover:text-white">Privacy Policy</button>
            <button onClick={() => setView('terms')} className="hover:text-nordic-text dark:hover:text-white">Terms of Service</button>
            <button onClick={() => setView('resources')} className="hover:text-nordic-text dark:hover:text-white">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};