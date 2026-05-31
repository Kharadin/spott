"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building, Crown, Plus, Sparkles, Ticket } from "lucide-react";
import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PricingModal from "./pricing-modal";
import { Badge } from "./ui/badge";
import { set } from "lodash";

const Header = () => {
  const { isLoading } = useStoreUser();

  const [showPricingModal, setShowPricingModal] = useState(false)

  const {showOnboarding, handleOnboardingComplete, handleOnboardingSkip, } = useOnboarding();

 
  // const { has } = useAuth();
  // const hasPro = has?.({ plan: "pro" });

  // console.log("haspro",hasPro);
  return (
    <>
      <nav className='fixed top-0 left-0 right-0 bg-background/20 backdrop-saturate-150 drop-blur-xl z-20 border-b  border-zinc-200/50'>
        <div className='max-w-7xl mx-auto px-6 py-2 flex items-center justify-between'>
          {/* Logo  */}
          <Link href={"/"} className='flex items-center z-10'>
            <Image src="/spott.png" alt="Spott Logo" width={500} height={500} 
            className='w-full h-14' priority />
          {/* Pro Badge */}
          {/* {hasPro && (
            <Badge className='bg-linear-to-r from-pink-500 to-orange-500 text-white ml-3'
            > <Crown className='mr-2 h-3 w-3' />
              PRO</Badge>
          )}  */}
          </Link>
          {/* CLEAN CENTERED SEARCH BAR */}
          <div className='hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
            <SearchLocationBar />
          </div>


          {/* Right Side actions */}
          <div className='flex items-center z-10'>
               { true && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPricingModal(true)}
              >
                Info
              </Button>
            )}    
              <Authenticated>
                
                <Button variant={"ghost"} size="sm" asChild className={'mr-2'} >
                  <Link href="/explore">Explore</Link>
                </Button>
                <Button size="sm" asChild className="flex gap-2 mr-4">
                    <Link href="/create-event">
                      <Plus className=" h-4 w-4" />
                      <span className='hidden sm:inline'>Create Event </span>

                    </Link>
                </Button>
                  
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                    label='My Tickets'
                    labelIcon={<Ticket size={16} />}
                    href='/my-tickets'
                    />
                    <UserButton.Link
                    label='My Events'
                    labelIcon={<Building size={16} />}
                    href='/my-events'
                    />
                    <UserButton.Action label="manageAccount" />

                  </UserButton.MenuItems>
                </UserButton>
              </Authenticated>
              {/* </SignedIn> */}
              
             {/* <SignedOut> */}
             <Unauthenticated>

              {/* <SignInButton /> */}
              <SignInButton mode="modal">
                <Button size="sm" >Sign In</Button>
              </SignInButton>
              {/* <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
                </button>
                </SignUpButton> */}

            {/* </SignedOut> */}
            </Unauthenticated>
          </div>
      
        </div>
        {/* Mobile Search and Locations - Below Header */}
          <div className=' md:hidden border-t px-3 py-3'>
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
         isOpen = {showOnboarding}
         onClose={handleOnboardingSkip}
         onComplete={handleOnboardingComplete}
      />
      <PricingModal 
        isOpen = {showPricingModal}
        onClose={() => setShowPricingModal(false)}  
        trigger='header'
      />
      
    </>
  )
}

export default Header

// Keep it, as a reminder
 // // @ts-nocheck 
