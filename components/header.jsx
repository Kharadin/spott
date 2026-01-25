import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Header = () => {
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
        </div>
        {/* Mobile Search and Locations - Below Header */}
      </nav>
      {/* Modals */}
    </>

  )
}

export default Header