"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image";0
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useState } from "react"
import { Input } from "./ui/input";
import { Loader2, Search } from "lucide-react";

export default function UnsplashImagePicker({isOpen, onClose, onSelect}) {
    const [query, setQuery] = useState('event');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchImages = async (searchQuery)=>{
        setLoading(true);
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=12&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`);

            const data = await response.json();
            setImages(data.results || []);    
        } catch (error) {
            console.error("Error fetching images:", error);

        } finally {
            setLoading(false);
        }
    }
    
    console.log(images);
    const handleSearch = (e)=>{
        e.preventDefault();
        searchImages(query);
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

        <DialogContent className="max-w-4xl max-h-[80vh] oveflow-hidden flex flex-col" >
          <DialogHeader>
            <DialogTitle className="text-slate-600 dark:text-white">Choose Cover Image</DialogTitle>
            {/* <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription> */}
          </DialogHeader>

          <form onSubmit={handleSearch} className="flex gap-2 text-slate-600" >
            <Input 
                value={query} 
                onChange={(e)=>setQuery(e.target.value)} 
                placeholder="Search for images" 
                className="flex-1"
            />
            <Button type="submit"
                disabled={loading}>
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4"/>
                    )}
            </Button>
          </form>
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            {loading? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-50" />
                </div>
              ) : (
                  <div className="grid grid-cols-3 gap-3 py-4">
                      {images.map((image)=>(
                        <button
                          key={image.id}
                          onClick={()=>onSelect(image.urls.regular)}
                          className="relative aspect-video overflow-hidden rounded-lg border-2 border-transparent hover:border-purple-500 transition-all hover:scale-105"
                        >
                          <Image
                            src={image.urls.small}
                            alt={image.description || "Unsplash Image"}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        </button> 
                      ))}

                    
                  </div>
                )
            }
            {!loading && images.length === 0 && (
              <div className="text-center text-muted-foreground py-12 mb-6">
                Search for images to get started
              </div>
            )}
          </div>
          <p className="text-xs text-muted foreground ">
            Photos from {" "}
            <a href="https://unsplash.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              Unsplash
            </a>
          </p>
        </DialogContent>
      
    </Dialog>
  )
}
