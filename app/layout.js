import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header";

export const metadata = {
  title: "Spott",
  description: "Discover amazing events near you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-linear-to-b from-blue-950 via-zinc-700 to-stone-600 text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange >       
         {/* Header */}
           <Header /> 
        

        <main className=" relative min-h-screen container mx-auto pt-40 md:pt-32">
          {/* relative: Allows absolute-positioned elements inside it to align to this main area. */}
          {/* container- tailwind - limits the width The container class is "smart." It automatically adjusts as the screen gets smaller: 
             */}
             {/* mx-auto: Sets the left and right margins to "auto," which centers that 1280px block in the middle of the screen.  */}
             {/* pt-40 md:pt-32: Adds top padding so your content doesn't get hidden behind a fixed header.  */}
          {/* glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

          
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl "  /> 
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl "/>

  
          </div>
            <div className=" relative z-10 min-h-[70vh]">{children}</div>
        {/* footer */}
        <footer className='border-t border-gray-800/50 py-8 px-6 max-w-7xl mx-auto'>

        <div className="text-sm text-gray-400">Made with Love by RoadsideCoder</div>
        </footer>
        </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
