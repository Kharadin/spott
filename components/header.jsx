'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SignInButton, UserButton } from '@clerk/nextjs'


import { Button } from './ui/button'
import { Authenticated, Unauthenticated } from 'convex/react'
import { BarLoader } from 'react-spinners'
import { useStoreUser } from '@/hooks/use-store-user'
import { useState } from 'react'
import { Building, Plus, Ticket } from 'lucide-react'



const Header = () => {
  const { isLoading } = useStoreUser();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  return (
    <>
      <nav className='fixed top-0 left-0 right-0 bg-background/20 backdrop-saturate-150 drop-blur-xl z-20 border-b  border-zinc-200/50'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
          {/* Logo  */}
          <Link href={"/"} className='flex items-center'>
          <Image src="/spott.png" alt="Spott Logo" width={500} height={500} 
          className='w-full h-11' priority />
          {/* Pro Badge */}
          </Link>
          {/* search & location-  Desktop only  */}

          {/* Right Side actions */}
          <div className='flex items-center'>
              {/* <SignedIn> */}
              <Button variant={"ghost"} size="sm" onClick={() => setShowUpgradeModal(true)}>
                Pricing
              </Button>             
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

        {/* Loader */}
        {isLoading && (
        <div className='absolute bottom-0 left-0 w-full'>
          <BarLoader width={"100%"} color="#a855f7" /> 
        </div>
        )}
      </nav>
      
    </>
  )
}

export default Header

// Keep it, as a reminder
 // // @ts-nocheck 
