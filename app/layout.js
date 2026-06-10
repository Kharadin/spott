import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

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

          <ConvexClientProvider>
            <Header />   
            <main className="relative min-h-screen container mx-auto pt-38 md:pt-23">
            
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

                
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl "  /> 
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl "/>

        
                </div>
                <div className=" relative z-10 min-h-[70vh]">{children}</div>
              {/* footer */}
              <footer className='border-t border-gray-800/50 py-8 px-6 max-w-7xl mx-auto'>

                <div className="text-sm text-gray-400">Made with Love by RoadsideCoder</div>
              </footer>
              <Toaster position= 'top-center' richColors />
            </main>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
