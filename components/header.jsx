"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building, Plus, Ticket } from "lucide-react";
import { BarLoader } from "react-spinners";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import AuthModal from "./auth-modal"; // Your new custom login/signup modal
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PricingModal from "./pricing-modal";

const Header = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Temporary or global state replacement for auth checking
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();

  useEffect(() => {
    // Automatically open the login modal if the URL contains showLogin=true
    if (searchParams.get("showLogin") === "true" && !user) {
      // #region agent log
      fetch('http://127.0.0.1:7702/ingest/db15b427-9efe-4370-be8b-f9dc44e66b0e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'cb2d6d'},body:JSON.stringify({sessionId:'cb2d6d',location:'header.jsx:30',message:'opening auth modal from showLogin param',data:{showLogin:searchParams.get("showLogin"),redirect:searchParams.get("redirect"),hasUser:!!user,pathname:typeof window!=='undefined'?window.location.pathname:null},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setShowAuthModal(true);
    }

    // Fetch user data on component mount
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (data.token) {
            localStorage.setItem("convex_token", data.token);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [searchParams, user]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      localStorage.removeItem("convex_token");
      window.location.reload();
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className='fixed top-0 left-0 right-0 bg-background/20 backdrop-saturate-150 drop-blur-xl z-20 border-b border-zinc-200/50'>
        <div className='max-w-7xl mx-auto px-6 py-2 flex items-center justify-between'>
          {/* Logo */}
          <Link href={"/"} className='flex items-center z-10'>
            <Image src="/spott.png" alt="Spott Logo" width={500} height={500} className='w-full h-14' priority />
          </Link>

          {/* CLEAN CENTERED SEARCH BAR */}
          <div className='hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
            <SearchLocationBar />
          </div>

          {/* Right Side actions */}
          <div className='flex items-center z-10 gap-2'>
            <Button variant="ghost" size="sm" onClick={() => setShowPricingModal(true)}>
              Info
            </Button>

            {/* CUSTOM AUTHENTICATED STATE */}
            {user ? (
              <>
                <Button variant={"ghost"} size="sm" asChild>
                  <Link href="/explore">Explore</Link>
                </Button>
                <Button size="sm" asChild className="flex gap-2 mr-2">
                  <Link href="/create-event">
                    <Plus className="h-4 w-4" />
                    <span className='hidden sm:inline'>Create Event</span>
                  </Link>
                </Button>

                {/* Simplified replacement for Clerk's UserButton dropdown styling */}
                <div className="relative group">
                  <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0 overflow-hidden">
                    <Image src={user.imageUrl || "/avatar-fallback.png"} alt="User profile" width={32} height={32} />
                  </Button>
                  {/* Dropdown Menu on Hover/Click */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 hidden group-hover:block text-black text-sm z-50">
                    <Link href="/my-tickets" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100">
                      <Ticket size={16} /> My Tickets
                    </Link>
                    <Link href="/my-events" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100">
                      <Building size={16} /> My Events
                    </Link>
                    <hr className="my-1" />
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-red-600 hover:bg-zinc-100">
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* CUSTOM UNAUTHENTICATED STATE */
              <Button size="sm" onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7702/ingest/db15b427-9efe-4370-be8b-f9dc44e66b0e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'cb2d6d'},body:JSON.stringify({sessionId:'cb2d6d',location:'header.jsx:127',message:'opening auth modal from sign in button',data:{source:'signInButton'},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
                // #endregion
                setShowAuthModal(true);
              }}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search and Locations - Below Header */}
        <div className='md:hidden border-t px-3 py-3'>
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
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          // #region agent log
          fetch('http://127.0.0.1:7702/ingest/db15b427-9efe-4370-be8b-f9dc44e66b0e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'cb2d6d'},body:JSON.stringify({sessionId:'cb2d6d',location:'header.jsx:165',message:'auth modal closed',data:{showLoginInUrl:searchParams.get("showLogin"),redirect:searchParams.get("redirect")},timestamp:Date.now(),hypothesisId:'B',runId:'post-fix'})}).catch(()=>{});
          // #endregion
          setShowAuthModal(false);
          if (searchParams.get("showLogin") === "true") {
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.delete("showLogin");
            nextParams.delete("redirect");
            const qs = nextParams.toString();
            router.replace(qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
          }
        }}
        onAuthSuccess={(userData) => {
          setUser(userData);
          setShowAuthModal(false);
        }}
      />
    </>
  );
};

export default Header;
