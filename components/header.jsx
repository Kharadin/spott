"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building, Plus, Ticket } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PricingModal from "./pricing-modal";
import { useClerkReachability } from "@/app/ConvexClientProvider";

function HeaderFrame({ children, isLoading, onOpenPricing }) {
  return (
    <nav className='fixed top-0 left-0 right-0 bg-background/20 backdrop-saturate-150 drop-blur-xl z-20 border-b border-zinc-200/50'>
      <div className='max-w-7xl mx-auto px-6 py-2 flex items-center justify-between'>
        <Link href={"/"} className='flex items-center z-10'>
          <Image
            src='/spott.png'
            alt='Spott Logo'
            width={500}
            height={500}
            className='w-full h-14'
            priority
          />
        </Link>

        <div className='hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
          <SearchLocationBar />
        </div>

        <div className='flex items-center gap-2 z-10'>
          <Button variant='ghost' size='sm' onClick={onOpenPricing}>
            Info
          </Button>
          {children}
        </div>
      </div>

      <div className='md:hidden border-t px-3 py-3'>
        <SearchLocationBar />
      </div>

      {isLoading && (
        <div className='absolute bottom-0 left-0 w-full'>
          <BarLoader width={"100%"} color='#a855f7' />
        </div>
      )}
    </nav>
  );
}

function ClerkHeader() {
  const { isLoading } = useStoreUser();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  return (
    <>
      <HeaderFrame
        isLoading={isLoading}
        onOpenPricing={() => setShowPricingModal(true)}
      >
        <Authenticated>
          <Button variant='ghost' size='sm' asChild className='mr-2'>
            <Link href='/explore'>Explore</Link>
          </Button>
          <Button size='sm' asChild className='flex gap-2 mr-4'>
            <Link href='/create-event'>
              <Plus className='h-4 w-4' />
              <span className='hidden sm:inline'>Create Event</span>
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
              <UserButton.Action label='manageAccount' />
            </UserButton.MenuItems>
          </UserButton>
        </Authenticated>

        <Unauthenticated>
          <SignInButton mode='modal'>
            <Button size='sm'>Sign In</Button>
          </SignInButton>
        </Unauthenticated>
      </HeaderFrame>

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
    </>
  );
}

function GuestHeader({ isChecking, onRetryProbe }) {
  const [showPricingModal, setShowPricingModal] = useState(false);

  return (
    <>
      <HeaderFrame
        isLoading={false}
        onOpenPricing={() => setShowPricingModal(true)}
      >
        <Button variant='ghost' size='sm' asChild className='mr-2'>
          <Link href='/explore'>Explore</Link>
        </Button>
        <div className='flex flex-col items-end gap-1'>
          <span className='text-[11px] leading-none text-amber-300'>
            {isChecking ? "Checking sign-in..." : "VPN required"}
          </span>
          <Button size='sm' disabled>
            Sign In
          </Button>
          {!isChecking && (
            <button
              type='button'
              onClick={onRetryProbe}
              className='text-[11px] text-slate-300 hover:text-white underline'
            >
              Retry
            </button>
          )}
        </div>
      </HeaderFrame>

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        trigger='header'
      />
    </>
  );
}

const Header = () => {
  const { isClerkReachable, isClerkChecking, retryClerkProbe } =
    useClerkReachability();

  if (isClerkReachable) {
    return <ClerkHeader />;
  }

  return (
    <GuestHeader isChecking={isClerkChecking} onRetryProbe={retryClerkProbe} />
  );
};

export default Header;
