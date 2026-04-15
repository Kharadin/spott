"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, CheckCircle } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterModal({ event, isOpen, onClose }) {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: registerForEvent, isLoading } = useConvexMutation(
    api.registrations.registerForEvent
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await registerForEvent({
        eventId: event._id,
        attendeeName: name,
        attendeeEmail: email,
      });

      setIsSuccess(true);
      toast.success("Registration successful! 🎉");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleViewTicket = () => {
    router.push("/my-tickets");
    onClose();
  };

  // Success state
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">You&apos;re All Set!</h2>
              <p className="text-muted-foreground">
                Your registration is confirmed. Check your Tickets for event
                details and your QR code ticket.
              </p>
            </div>
            <Separator />
            <div className="w-full space-y-2">
              <Button className="w-full gap-2" onClick={handleViewTicket}>
                <Ticket className="w-4 h-4" />
                View My Ticket
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Registration form
   return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md  text-zinc-500 dark:text-zinc-400">
        <DialogHeader>
          <DialogTitle className=" text-xl font-bold">Register for Event</DialogTitle>
          <DialogDescription className="">
            Secure your spot for {event.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Summary - Using 'secondary' for contrast against the main dialog background */}
          <div className="bg-secondary/50 dark:bg-secondary/30 p-5 rounded-xl border border-border/50">
            <p className="text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">Event Summary</p>
            <p className="font-bold text-lg leading-tight">{event.title}</p>
            <div className="mt-4 flex items-center justify-between text-sm pt-3 border-t border-border/40">
              <span className="opacity-70 font-medium text-black dark:text-white">Price:</span>
              <span className="font-bold">
                {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}
                {event.ticketType !== "free" && <span className="text-[10px] ml-1 font-normal opacity-70">(Pay at venue)</span>}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name - Adding explicit border colors for light mode visibility */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="name"
                className="bg-background border-zinc-300 dark:border-zinc-800 focus-visible:ring-primary transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-background border-zinc-300 dark:border-zinc-800 focus-visible:ring-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan.ivanov@example.com"
                required
              />
            </div>
          </div>

          {/* Terms */}
          <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
            By registering, you agree to receive event updates and reminders via email.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2 shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Register Now
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  
  );
}
