"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useRef } from "react"
import { Input } from "./ui/input"
import { Loader2, Search, Upload, ImageIcon } from "lucide-react"
import { useMutation, useConvex } from "convex/react" // ADD: useConvexClient
import { api } from "@/convex/_generated/api"

export default function UniversalImagePicker({ isOpen, onClose, onSelect }) {
    const [activeTab, setActiveTab] = useState("unsplash")
    const [query, setQuery] = useState('event')
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    const generateUploadUrl = useMutation(api.files.generateUploadUrl)
    const convexClient = useConvex() // Gives us access to run queries directly inside functions

    // --- Flow 1: Unsplash Search Handler ---
    const searchImages = async (searchQuery) => {
        setLoading(true)
        try {
            const response = await fetch(`https://unsplash.com{searchQuery}&per_page=12&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`)
            const data = await response.json()
            setImages(data.results || [])    
        } catch (error) {
            console.error("Error fetching images:", error)
        } finally {
            setLoading(false)
        }
    }
    
    const handleSearch = (e) => {
        e.preventDefault()
        searchImages(query)
    }

    // --- Flow 2: Custom User Local File Upload ---
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            // 1. Get a secure storage upload url token from Convex backend
            const postUrl = await generateUploadUrl()

            // 2. POST the raw binary file directly to Convex file servers
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            })
            const { storageId } = await result.json()

            // 3. FIX: Fetch the actual, static public image URL using the Convex Client
            const publicUrl = await convexClient.query(api.files.getImageUrl, { storageId })

            if (!publicUrl) {
                throw new Error("Could not extract a valid download link from storage.")
            }

            console.log("Success! Clean public image URL loaded:", publicUrl)
            
            // 4. Pass the real URL back to the parent create-event form
            onSelect(publicUrl)
            onClose()
        } catch (error) {
            console.error("Failed to upload local image:", error)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = "" 
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-slate-600 dark:text-white">Cover Image Configuration</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
              <TabsTrigger value="unsplash" className="flex gap-2">
                <Search className="w-4 h-4" /> Unsplash Stock
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex gap-2">
                <Upload className="w-4 h-4" /> Upload Custom
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: UNSPLASH ENGINE */}
            <TabsContent value="unsplash" className="flex-1 flex flex-col overflow-hidden gap-4 data-[state=inactive]:hidden">
              <form onSubmit={handleSearch} className="flex gap-2 text-slate-600">
                <Input 
                    value={query} 
                    onChange={(e)=>setQuery(e.target.value)} 
                    placeholder="Search for images..." 
                    className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4"/>}
                </Button>
              </form>

              <div className="overflow-y-auto flex-1 -mx-6 px-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : (
                      <div className="grid grid-cols-3 gap-3 py-4">
                          {images.map((image) => (
                            <button
                              key={image.id}
                              type="button"
                              onClick={() => onSelect(image.urls.regular)}
                              className="relative aspect-video overflow-hidden rounded-lg border-2 border-transparent hover:border-purple-500 transition-all hover:scale-105"
                            >
                              <Image
                                src={image.urls.small}
                                alt={image.description || "Unsplash Image"}
                                fill
                                sizes="(max-w-7xl) 33vw"
                                className="object-cover"
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
              
              <p className="text-xs text-slate-400 mt-2">
                Photos from <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
              </p>
            </TabsContent>

            {/* TAB CONTENT: CONVEX FILE UPLOAD CONTAINER */}
            <TabsContent value="upload" className="flex-1 flex flex-col justify-center items-center data-[state=inactive]:hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 bg-zinc-50/50 dark:bg-zinc-900/20">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
                
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                        <p className="text-sm font-medium text-muted-foreground">Uploading image to Convex Storage...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-background border rounded-full shadow-xs mb-4">
                            <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Upload an image file</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mb-6"> Supports PNG, JPG, or WEBP. Max resolution sizes scale dynamically.</p>
                        <Button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        >
                            Choose Local File
                        </Button>
                    </div>
                )}
            </TabsContent>
          </Tabs>
        </DialogContent>
    </Dialog>
  )
}
