'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function AiEventCreator({onEventGenerated}) {
    const [isOpen, setIsOpen] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)

    const generateEvent = async () => {
      if (!prompt.trim()) {
        toast.error("Please describe your event")
        return
      }
      setLoading(true)
      try {
         const response = await fetch("/api/generate-event", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({prompt})  
         })
         // at this point response is a stream (of bytes)
         const data = await response.json()
        onEventGenerated(data)
        toast.success("Event details generated. Review and customize below.");
        setIsOpen(false)    
        setPrompt("")
      } catch (error) {
        toast.error("Failed to generate event. Please try again.");
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      {/* <form> -DELETED */}
        <DialogTrigger asChild>
        {/* Keep form-adaptive here because this button lives ON the colored form */}
        <Button className="gap-2" >
           <Sparkles className="w-4 h-4" />Generate with AI
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm form-adaptive-exclusion">
          <DialogHeader>
             <DialogTitle >AI Event Creator</DialogTitle>
              <DialogDescription>
              Describe your event in a few words, and we'll generate an event for you
            </DialogDescription>
          </DialogHeader>

            {/* Input inside the dialog shouldn't be 'form-adaptive' unless you want it to be see-through */}
            {/* <div className="py-4">
            <Input placeholder="Type your prompt..." className="w-full" />
            </div> */}

               <div className="space-y-4">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Example: A Chigong conference in San-Francisco, California, 3 DAYS starting on the 22nd of May, 2023"
                        rows={6}
                        className="resize-none"                   
                     />
                    <div className="flex gap-2">
                        <Button 
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={generateEvent}
                            disabled={loading || !prompt.trim()}
                            className="flex-1 gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ): (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate
                                </>
                            )
                            }
                        </Button>    

                    </div>
                </div>

          {/* <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" >Cancel</Button>
            </DialogClose>
            <Button type="submit" >Generate</Button>
          </DialogFooter> */}
        </DialogContent>
      {/* </form> -DELETED*/}
    </Dialog>
  )
}
