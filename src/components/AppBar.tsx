'use client'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppBar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  
  // Handle navigation programmatically to ensure it works
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, path: string) => {
    e.preventDefault();
    router.push(path);
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClickOutside(event: any) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              onClick={(e) => handleNavigation(e, "/")}
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              BTD6 Leaderboards
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/leaderboard"
              onClick={(e) => handleNavigation(e, "/leaderboard")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Leaderboard
            </Link>
            
            {session && (
              <Link
                href="/submit"
                onClick={(e) => handleNavigation(e, "/submit")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Submit Run
              </Link>
            )}
          </div>
          
          {/* Auth section with dropdown */}
          <div className="hidden md:flex md:items-center">
            {session ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="bg-gray-300 flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <img
                    src={`/${session.user.image}`}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    alt="Profile"
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      Signed in as <span className="font-medium">{session.user?.name}</span>
                    </div>
                    <Link
                      href={`/user/${session.user?.id}`}
                      onClick={(e) => session.user?.id && handleNavigation(e, `/user/${session.user.id}`)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Your Profile
                    </Link>
                    {/* Admin Dashboard Link */}
                    {session.user?.admin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={(e) => handleNavigation(e, "/admin/dashboard")}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="block px-4 py-2 text-sm bg-red-700 text-white hover:bg-red-900 w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              href="/leaderboard"
              onClick={(e) => handleNavigation(e, "/leaderboard")}
              className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium text-center"
            >
              Leaderboard
            </Link>
            
            {session && (
              <Link
                href="/submit"
                onClick={(e) => handleNavigation(e, "/submit")}
                className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium text-center mt-2"
              >
                Submit Run
              </Link>
            )}
            
            {session ? (
              <div className="flex flex-col space-y-2 mt-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <img
                    src={`/${session.user.image}`}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    alt="Profile"
                  />
                  <span className="text-gray-700 font-medium overflow-hidden text-ellipsis">
                    {session.user?.name}
                  </span>
                </div>
                
                <Link
                  href={`/user/${session.user?.id}`}
                  onClick={(e) => session.user?.id && handleNavigation(e, `/user/${session.user.id}`)}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Your Profile
                </Link>

                {/* Admin Dashboard Link */}
                {session.user?.admin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={(e) => handleNavigation(e, "/admin/dashboard")}
                    className="block bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium text-center"
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <button
                  onClick={() => signOut()}
                  className="block bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="block w-full bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium mt-2"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}