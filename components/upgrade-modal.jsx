"use client";

import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@clerk/nextjs";


export default function UpgradeModal ({isOpen, onClose, trigger = 'limit'})  {
  return (
     <Dialog open={isOpen} onOpenChange={onClose}>
    
        {/* <DialogTrigger>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger> */}
        {/* not using trigger as we have isOpen from outside */}
        <DialogContent  className="sm:max-w-2xl [&>button]:text-gray-500 [&>button]:hover:text-gray-900">
          <DialogHeader>
            <div className='flex items-center gap-2 mb-2'>
                <Sparkles className="w-6 h-6 text-purple-500" />
                <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
                
            </div>
            <DialogDescription>
             {trigger === 'header' && "Create unlimited events and invite friends to join you. "}
             {trigger === 'limit' && "You have reached the limit of free events. "}
             {trigger === 'color' && "Custom theme is a pro feature. "}
                Unlock unlimited events and Pro features!
            </DialogDescription>
          </DialogHeader>
           {/* Pricing Cards */}
        <PricingTable
          checkoutProps={{
            appearance: {
              elements: {
                drawerRoot: {
                  zIndex: 2000,
                },
              },
            },
          }}
        />
        <div className="flex gap-3"> 
            <Button variant="outline" onClick={onClose} className="flex-1">
                Maybe Later
            </Button>
            
        </div>
        </DialogContent>
     
    </Dialog>
  )
}

