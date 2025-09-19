import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Header */}
      <header className="glass-card fixed top-0 left-0 right-0 z-50 h-16 md:h-20 shadow-elegant">
        <div className="container-width h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo Section - Placeholder */}
            <div className="flex flex-col">
              <div className="h-8 md:h-10 w-32 bg-primary/20 rounded-md flex items-center justify-center">
                <span className="text-primary font-semibold mobile-text-base">LOGO</span>
              </div>
              <span className="hidden md:block mobile-text-sm text-muted-foreground mt-1">
                AI Development Blueprints
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-muted-foreground hover:text-primary transition-all duration-300 mobile-text-base font-medium link-underline"
                >
                  {item.name}
                </button>
              ))}
              <Button variant="outline" size="sm" className="ml-4 mobile-button">
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden mobile-padding rounded-md hover:bg-muted/50 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <motion.div
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 6 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="w-4 h-0.5 bg-foreground origin-center"
                />
                <motion.div
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? -6 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="w-4 h-0.5 bg-foreground origin-center"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="glass-card md:hidden shadow-md"
            >
              <div className="mobile-padding mobile-spacing">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left mobile-padding mobile-text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-all duration-300"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full mobile-button">
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
};