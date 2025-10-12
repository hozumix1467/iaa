import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">ルームクリア相談室</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <NavLink to="/" exact>ホーム</NavLink>
          <NavLink to="/consultation/new">相談する</NavLink>
          <NavLink to="/consultation/browse">相談一覧</NavLink>
          <NavLink to="/about">サービスについて</NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fadeIn">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <MobileNavLink to="/" exact>ホーム</MobileNavLink>
            <MobileNavLink to="/consultation/new">相談する</MobileNavLink>
            <MobileNavLink to="/consultation/browse">相談一覧</MobileNavLink>
            <MobileNavLink to="/about">サービスについて</MobileNavLink>
          </div>
        </div>
      )}
    </header>
  );
};

// Navigation Link Components
const NavLink: React.FC<{to: string; exact?: boolean; children: React.ReactNode}> = ({ to, exact, children }) => {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      className={`text-base font-medium transition-colors duration-200 ${
        isActive 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-700 hover:text-blue-600'
      }`}
    >
      {children}
    </Link>
  );
};

const MobileNavLink: React.FC<{to: string; exact?: boolean; children: React.ReactNode}> = ({ to, exact, children }) => {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      className={`block py-2 text-base font-medium transition-colors duration-200 ${
        isActive 
          ? 'text-blue-600' 
          : 'text-gray-700 hover:text-blue-600'
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;