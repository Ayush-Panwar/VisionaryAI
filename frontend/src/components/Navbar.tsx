"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, Grid, LogOut, UserCircle, Sparkles, Brain } from "lucide-react";
import ClientOnly from "./ClientOnly";
import { AuthDialog } from "@/components/AuthDialog";
import { SignOutDialog } from "@/components/SignOutDialog";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to determine if a link is active
  const isActive = (path: string) => {
    // Exact match for home page
    if (path === '/' && pathname === '/') return true;
    
    // For other pages, check if pathname starts with the path (to match sub-routes)
    if (path !== '/' && pathname?.startsWith(path)) return true;
    
    return false;
  };

  // Nav link styles based on active state
  const navLinkStyles = (path: string) => cn(
    "flex items-center py-2 pl-3 pr-4 rounded transition-colors",
    "md:border-0 md:p-0",
    isActive(path) 
      ? "text-purple-600 font-semibold md:border-b-2 md:border-purple-500 dark:text-purple-400 dark:md:border-purple-400" 
      : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-purple-600 dark:text-white dark:hover:text-purple-400 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
  );

  return (
    <>
      <nav className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <div className="relative h-9 w-9 mr-2">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -right-1 -top-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
              </div>
              <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                VisionaryAI
              </div>
            </div>
          </Link>
          
          <div className="flex items-center md:order-2 space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {/* User Profile and Authentication Links for Desktop */}
            <ClientOnly>
              {status === "authenticated" ? (
                <div className="flex items-center space-x-3">
                  <div 
                    className="hidden md:flex items-center cursor-pointer" 
                    onClick={() => setShowSignOutDialog(true)}
                  >
                    {session?.user?.image ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || "User"} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <UserCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <button 
                    onClick={() => setShowSignOutDialog(true)}
                    className="hidden md:flex items-center p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="hidden md:flex items-center px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-md hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-sm"
                >
                  Sign In
                </button>
              )}
            </ClientOnly>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg md:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-controls="navbar-default"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Navigation Links */}
          <div 
            className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto md:order-1`} 
            id="navbar-default"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700">
              
              <li>
                <Link 
                  href="/explore" 
                  className={navLinkStyles('/explore')}
                >
                  <Grid className="mr-1 h-4 w-4" />
                  Explore
                </Link>
              </li>
              
              <ClientOnly>
                {status === "authenticated" ? (
                  <>
                    <li>
                      <Link 
                        href="/generate" 
                        className={navLinkStyles('/generate')}
                      >
                        <Sparkles className="mr-1 h-4 w-4" />
                        Create
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/dashboard" 
                        className={navLinkStyles('/dashboard')}
                      >
                        <Grid className="mr-1 h-4 w-4" />
                        Studio
                      </Link>
                    </li>
                    <li className="block md:hidden">
                      <button 
                        onClick={() => setShowSignOutDialog(true)}
                        className="flex w-full items-center py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-purple-600 md:p-0 dark:text-white md:dark:hover:text-purple-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                      >
                        <LogOut className="mr-1 h-4 w-4" />
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="md:hidden">
                    <button 
                      onClick={() => setShowAuthDialog(true)}
                      className="flex items-center py-2 pl-3 pr-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded"
                    >
                      Sign In
                    </button>
                  </li>
                )}
              </ClientOnly>
            </ul>
          </div>
        </div>
      </nav>

      {/* Auth Dialogs */}
      <AuthDialog 
        isOpen={showAuthDialog} 
        setIsOpen={setShowAuthDialog} 
        actionType="continue"
      />
      <SignOutDialog 
        isOpen={showSignOutDialog} 
        setIsOpen={setShowSignOutDialog} 
      />
    </>
  );
} 