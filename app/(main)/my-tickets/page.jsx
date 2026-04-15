'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Calendar, Loader2, MapPin, Ticket } from "lucide-react";
import EventCard from "@/components/event-card";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { se } from "date-fns/locale";
import QRCode from "react-qr-code";
import { formatDate } from "date-fns";

const MyTicketsPage = () => {
    
    const [selectedTicket, setSelectedTicket] = useState(null);
    const router = useRouter();

    const {data: registrations, isLoading} = useConvexQuery(
        api.registrations.getMyRegistrations);

    const {mutate: cancelRegistration, isLoading: isCancelling}= useConvexMutation(
            api.registrations.cancelRegistration)

    if (isLoading) {
        return ( <div className="min-h-screen flex items-center justify-center">
                       <Loader2 className="w-8 h-8 animate-spin text-purple-500"/>
                 </div>
        )
    }   
    // console.log("registrations", registrations)
    const now = Date.now();
    const upcomingTickets= registrations?.filter(
        (reg) => 
                reg.event &&
                (reg.event.startDate >= now  ||
                (reg.event.startDate <= now && reg.event.endDate > now)) &&
                reg.status === "confirmed"
    )
    // console.log("upcomingTickets", upcomingTickets) 

    const pastTickets = registrations?.filter(
        (reg) => 
                 reg.event && ( reg.event.endDate < now || reg.status === "cancelled")
    )

    const handleCancelRegistration = async (registrationId) => {
        if (!window.confirm("Are you sure you want to cancel this registration?")) {
            return;
        }
        try {
            await cancelRegistration({registrationId});
            toast.success("Registration cancelled successfully");
           
        } catch (error) {
            toast.error(error.message || "Failed to cancel registration");
        }
    }
  return (
    <div className="min-h-screen  pb-20 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
                <p className="text-muted-foreground">View and manage your event registrations</p>
            </div>

            {/* Upcoming Tickets */}
            {upcomingTickets?.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">
                        Upcoming Tickets
                    </h2>  

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingTickets.map((registration) => (
                            <EventCard
                                key={registration._id}
                                event={registration.event}
                                action={"ticket"}
                                onClick={()=>setSelectedTicket(registration)}
                                onDelete={() => handleCancelRegistration(
                                    registration._id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Past Tickets */}
             {pastTickets?.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">
                        Past Events and Cancellations
                    </h2>  

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastTickets.map((registration) => (
                            <div key={registration._id} className='relative'>
                            {registration.status === "cancelled" && (
                                <span className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wider px-2 py-0.5 rounded shadow-sm border ">
                                    Cancelled
                                </span>              
                            )}
                            <EventCard
                                key={registration._id}
                                event={registration.event}
                                action={null}
                                className={registration.status === 
                                    "cancelled" ? "opacity-60 grayscale-75" : "opacity-70"
                                }
                                
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {upcomingTickets?.length ===0 && pastTickets?.length ===0 && (
             <Card className="text-center p-12" > 
                <div className="max-w-md mx-auto space-y-4">
                    <div className="text-6xl mb-4">🎟️</div>
                    <h2 className="text-2xl font-semibold">Нет текущих либо закрытых/отмененных билетов</h2>
                    <p className="text-muted-foreground"> Register for events to see your tickets here</p>
                    <Button asChild className="gap-2">
                        <Link href="/explore">
                            <Ticket className="w-4 h-4" />
                            Browse Events
                        </Link>
                    </Button>
                </div>
             </Card>
            )}
        </div>

        {/* QR code Modal */}
        {selectedTicket && (
            <Dialog open={!!selectedTicket} onOpenChange={()=> setSelectedTicket(null)}>
                <DialogContent className="sm:max-w-md text-muted-foreground ">
                    <DialogHeader>
                        <DialogTitle>Your Ticket</DialogTitle>
                  
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="font-semibold mb-1">{selectedTicket.attendeeName}</p>
                            <p className="text-sm text-muted-foreground mb4">
                                {selectedTicket.event.title}
                            </p>
                        </div>
                        <div className="flex  justify-center p-6 bg-white rounded-lg">
                            <QRCode value={selectedTicket.qrCode} size={180}  level="H"/>
                        </div>
                        <div className="text-center">
                            <p className="text-xs mb-1">Ticket ID</p>
                            <p className="font-mono text-sm">{selectedTicket.qrCode}</p>
                        </div>

                        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">

                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(selectedTicket.event.startDate, "PPP, h:mm a")}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>
                                    {`${selectedTicket.event.city}, ${selectedTicket.event.state  || selectedTicket.event.country}`}
                                </span>
                            </div>
                        
                        </div>
                        <p className="text-xs text-center">Show this QR code at the event entrance for check-in</p>
                    </div>
                </DialogContent>
            </Dialog>
        )}
    </div>
  ) 
     
}

export default MyTicketsPage