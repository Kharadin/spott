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
import { Sparkles } from "lucide-react"
import { useState } from "react"

export function AiEventCreator({onEventGenerated}) {
    const [isOpen, setIsOpen] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      {/* <form> -DELETED */}
        <DialogTrigger asChild>
        {/* Keep form-adaptive here because this button lives ON the colored form */}
        <Button className="gap-2 form-adaptive" >
     

        
           <Sparkles className="w-4 h-4" />Generate with AI
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
             <DialogTitle >AI Event Creator</DialogTitle>
              <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>

              {/* Input inside the dialog shouldn't be 'form-adaptive' unless you want it to be see-through */}
            <div className="py-4">
            <Input placeholder="Type your prompt..." className="w-full" />
            </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" >Cancel</Button>
            </DialogClose>
            <Button type="submit" >Generate</Button>
          </DialogFooter>
        </DialogContent>
      {/* </form> -DELETED*/}
    </Dialog>
  )
}
