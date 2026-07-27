"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building, Plus, Ticket } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import AuthModal from "./auth-modal"; 
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PricingModal from "./pricing-modal";
import { useAuth } from "@/app/context/AuthContext";

const Header = () => {
  const router = useRouter();
  const { user, token, isLoading: authLoading, refreshUser } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const isLoading = authLoading || actionLoading;

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();

  const handleSignOut = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("convex_token");
      window.location.reload();
    } catch (err) {
      console.error("Sign out failed", err);
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* FIX 1: Changed drop-blur-xl to backdrop-blur-xl and added styles property fallback for Safari compatibility */}
      <nav 
        className='fixed top-0 left-0 right-0 bg-background/70 backdrop-saturate-150 backdrop-blur-xl z-20 border-b border-zinc-200/50'
        style={{ WebkitBackdropFilter: "saturate(150%) blur(24px)" }}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2'>
          
          {/* Logo Container */}
          {/* FIX 2: Set structural wrapper parameters around image so Safari doesn't swell sizing */}
          <Link href={"/"} className='flex items-center z-10 shrink-0'>
            <div className="relative h-10 w-28 sm:w-32">
              <Image 
                src="/spott.png" 
                alt="Spott Logo" 
                fill
                sizes="(max-w-768px) 112px, 128px"
                className='object-contain object-left' 
                priority 
              />
            </div>
          </Link>

          {/* CLEAN CENTERED SEARCH BAR */}
          <div className='hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
            <SearchLocationBar />
          </div>

          {/* Right Side actions */}
          {/* FIX 3: Added shrink-0 to prevent layout engine from crushing buttons on mobile viewports */}
          <div className='flex items-center z-10 gap-1.5 sm:gap-2 shrink-0'>
            <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-xs sm:text-sm" onClick={() => setShowPricingModal(true)}>
              Info
            </Button>

            {/* CUSTOM AUTHENTICATED STATE */}
            {user ? (
              <>
                <Button size="sm" asChild className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Link href="/create-event">
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className='hidden sm:inline'>Create Event</span>
                  </Link>
                </Button>

                <div className="relative flex items-center" ref={menuRef}>
                  <Button ref={buttonRef} variant="outline" size="sm" className="rounded-full w-8 h-8 p-0 overflow-hidden shrink-0" onClick={toggleMenu} aria-expanded={menuOpen} aria-haspopup="true">
                    <Image src={user.imageUrl || "/avatar-fallback.png"} alt="User profile" width={32} height={32} className="w-full h-full object-cover" />
                  </Button>
                  
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-lg py-1 text-black text-sm z-50">
                      <Link href="/my-tickets" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100" onClick={() => setMenuOpen(false)}>
                        <Ticket size={16} /> My Tickets
                      </Link>
                      <Link href="/my-events" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100" onClick={() => setMenuOpen(false)}>
                        <Building size={16} /> My Events
                      </Link>
                      <hr className="my-1" />
                      <button onClick={() => { setMenuOpen(false); handleSignOut(); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-zinc-100">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* CUSTOM UNAUTHENTICATED STATE */
              <Button size="sm" className="text-xs sm:text-sm px-3" onClick={() => setShowAuthModal(true)}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search and Locations - Below Header */}
        <div className='md:hidden border-t px-3 py-2 bg-background/50'>
          <SearchLocationBar />
        </div>

        {/* Loader */}
        {isLoading && (
          <div className='absolute bottom-0 left-0 w-full'>
            <BarLoader width={"100%"} color="#a855f7" />
          </div>
        )}
      </nav>

      {/* Modals */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />
      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)} 
        trigger='header'
      />
      <Suspense fallback={null}>
        <AuthModalWrapper 
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          user={user}
          authLoading={authLoading}
          refreshUser={refreshUser}
          router={router}
        />
      </Suspense>
    </>
  );
};

const AuthModalWrapper = ({ showAuthModal, setShowAuthModal, user, authLoading, refreshUser, router }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("showLogin") === "true" && !user && !authLoading) {
      setShowAuthModal(true);
    }
  }, [searchParams, user, authLoading, setShowAuthModal]);

  return (
    <AuthModal 
      isOpen={showAuthModal}
      onClose={() => {
        setShowAuthModal(false);
        if (searchParams.get("showLogin") === "true") {
          const nextParams = new URLSearchParams(searchParams.toString());
          nextParams.delete("showLogin");
          nextParams.delete("redirect");
          const qs = nextParams.toString();
          router.replace(qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
        }
      }}
      onAuthSuccess={() => {
        refreshUser();
        setShowAuthModal(false);
      }}
    />
  );
};

export default Header;
