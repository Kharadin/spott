'use client'

import { Badge } from '@/components/ui/badge'
import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/use-convex-query'
import { getCategoryIcon, getCategoryLabel } from '@/lib/data'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { Calendar, CheckCircle, Clock, ExternalLink, Loader2, MapPin, Share2, Ticket, User, Users } from 'lucide-react'

import { notFound, useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useState } from 'react'
import Image from "next/image";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import RegisterModal from './_components/register-modal'




// Utility function to darken a color
function darkenColor(color, amount) {
  const colorWithoutHash = color.replace("#", "");
  const num = parseInt(colorWithoutHash, 16);
  const r = Math.max(0, (num >> 16) - amount * 255);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount * 255);
  const b = Math.max(0, (num & 0x0000ff) - amount * 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function  EventDetailPage()  {
    const params = useParams()
    const router = useRouter()
    
    const {user} = useUser();

    const [showRegisterModal, setShowRegisterModal] = useState(false);
    // Fetch event details
    const {data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, {
        slug: params.slug
    })
    // Check if user is already registered
    const { data: registration } = useConvexQuery(
        api.registrations.checkRegistration,
        event?._id ? { eventId: event._id } : "skip"
    );
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: event.description.slice(0, 100) + "...",
                    url: url,
                })
            } catch (error) {
                // User cancelled or error occurred
            } 
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!")
        }
    };
    

    const handleRegister =()=> {
        if (!user) {
            toast.error("Please sign in to register");
            return;
        }
        setShowRegisterModal(true);
    }


    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Loader2 className='w-8 h-8 animate-spin text-purple-500' />
            </div>
        )
    } 
    if (!event){
        notFound()
    }

    const isEventPast = event.endDate < Date.now();
    const isEventFull = event.capacity <= event.registrationCount
    const isOrganizer = user?.id === event.organizerId;


    return (
        <div
            style={{
                backgroundColor: event.themeColor || "1e3a8a",
                }}
            className='min-h-screen p-8 -mt-6 md:-mt-16 lg:-mx-1'
        >

            {/* UI */}
            <div className='max-w-7xl mx-auto px-8'>
                    <div className='mb-8'>
                        <Badge variant="secondary" className="mb-3">
                            {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}

                        </Badge>
                        <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                            {event.title}
                        </h1>
                        <div className='flex flex-wrap items-center gap-4 text-slate-400'>
                            <div className='flex items-center gap-2'>
                                <Calendar className='w-5 h-5' />
                                <span>{format(event.startDate, "EEEE, MMMM dd, yyyy")}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Clock className='w-5 h-5' />
                                <span>
                                    {format(event.startDate, "hh:mm a")} -{" "}
                                    {format(event.endDate, "hh:mm a")}
                                </span>
                            </div>
                        </div>
                    </div>

                

                {/* Hero Image */}
                {event.coverImage && (
                    <div className="relative h-[250px] md:h-[400px] rounded-2xl overflow-hidden mb-6">
                        <Image
                            src={event.coverImage} 
                            alt={event.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}
                <div className='grid lg:grid-cols-[1fr_380px] gap-8'>
                    {/* Main Content */}
                    <div className='space-y-8'>
                        {/* Description */}
                        <Card className={"pt-0"}
                                style={{
                                backgroundColor: event.themeColor
                                ? darkenColor(event.themeColor, 0.04)
                                : "#1e3a8a",
                            }} >
                            {/* <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader> */}
                            <CardContent className="pt-6">
                                <h2 className="text-2xl text-slate-300 font-bold mb-4">About this Event</h2>
                                <p className="text-white whitespace-pre-wrap leading-relaxed">{event.description}</p>
                            </CardContent>
                        </Card>
                        
                        {/* Location details */}
                        <Card className={"pt-0"}
                                style={{
                                backgroundColor: event.themeColor
                                ? darkenColor(event.themeColor, 0.04)
                                : "#1e3a8a",
                            }} >
                        
                            <CardContent className="pt-6">
                                <h2 className="text-2xl text-slate-300 font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-purple-500" />
                                    Location
                                </h2>
                            
                                <div className='space-y-3' >
                                    <p className='font-medium text-white'>
                                        {event.city}, {event.state || event.country}
                                    </p>
                                    {event.address && (
                                        <p className='text-sm text-white'>{event.address}</p>
                                    )}
                                    {event.venue && (
                                        <Button variant="outline" asChild className='gap-2'>
                                        <a href={event.venue}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >
                                            View on Map
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        </Button>   
                                    )}
                                </div>
                            </CardContent>
                            
                        </Card>
                        {/* Organizer Info */}
                        <Card className={"pt-0"}
                                style={{
                                backgroundColor: event.themeColor
                                ? darkenColor(event.themeColor, 0.04)
                                : "#1e3a8a",
                            }} 
                        >
                            <CardContent className="pt-6">
                                <h2 className="text-2xl text-slate-300 font-bold mb-4 flex items-center gap-2">
                                    Organizer
                                </h2>
                                <div className='flex items-center gap-3'>
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src="" />
                                        <AvatarFallback>
                                            {event.organizerName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className='font-semibold text-slate-100'>{event.organizerName}</p>
                                        <p className='text-sm text-slate-300'>
                                            Event Organizer
                                        </p>
                                    </div>
                                </div>
                            
                            </CardContent>
                        </Card>
                    
                    </div>
                    
                    {/* Sidebar - Registration Card */}
                    <div className="lg:sticky lg:top-24 h-fit">   
                        <Card className={`overflow-hidden py-0`}
                            style={{
                                backgroundColor: event.themeColor
                                ? darkenColor(event.themeColor, 0.04)
                                : "#1e3a8a",
                            }}
                        >
                            <CardContent className="p-6 space-y-4">
                            {/* Price */}
                                <div className='text-slate-200'  >
                                    <p className='text-sm mb-1 '>Price</p>
                                    <p className='text-3xl font-semibold ' > 
                                        {event.ticketType ==="free" ?
                                         "Безоплатно" 
                                        : `₽ ${event.ticketPrice}`
                                        }
                                    </p>
                                    {event.ticketType ==="paid" && (
                                       <p className='text-xs text-slate-300 mt-1'>
                                          Оплата на месте
                                        </p>
                                    )}
                                   
                                </div>
                                <Separator style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                                {/* Stats */}
                                <div className='space-y-3 text-white'>

                                    <div className='flex justify-between'> 
                                        <div className=' flex   items-center gap-2'>
                                            <Users className='w-4 h-4' />
                                            <span className='text-sm'>Attendees</span>
                                        </div>
                                        <span className='text-sm '>
                                            {event.registrationCount} / {event.capacity}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'> 
                                        <div className='flex items-center gap-2'>
                                            <Calendar className='w-4 h-4' />
                                            <span className='text-sm '>Date</span>
                                        </div>
                                        <span className='text-sm '>
                                            {format(event.startDate, "MMM dd")}
                                        </span>

                                    </div>
                                    < div className='flex justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Clock className='w-4 h-4' />
                                            <span className='text-sm '>Time</span>
                                        </div>
                                        <span className='text-sm '>
                                            {format(event.startDate, "hh:mm a")}
                                        </span>

                                    </div>
                                        
                                </div>
                                <Separator style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />   
                                
                                {/* Registratin Button */}
                                
                            {  registration ? (  <div className='space-y-3'>
                                        <div className="w-full flex items-center justify-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-lg"
                                        >  
                                            <CheckCircle className="w-5 h-5" />
                                            <span className='font-medium'>You&apos;re registered!</span>
                                        </div>
                                        <Button className="w-full gap-2"
                                            onClick= {()=> router.push("/my-tickets")}
                                        > 
                                            <Ticket className="w-4 h-4" />  
                                            View Ticket
                                        </Button>
                                    </div>
                                    ) : isEventPast ?(
                                        <Button className='w-full' disabled>Event Ended</Button>
                                    ): isEventFull ? (
                                        <Button className='w-full' disabled>Event Full</Button>
                                    ): isOrganizer ? (
                                        <Button className="w-full" 
                                            onClick={()=> router.push(`/events/${event.slug}/manage`)}
                                        >
                                            Manage Event
                                        </Button>
                                        ) : (
                                        <Button className="w-full gap-2" onClick={handleRegister}>
                                            <Ticket className='w-4 h-4' />
                                            Register
                                        </Button>
                                    )}
                                
                                {/* Share button */}
                                <Button 
                                    variant="outline"
                                    className="w-full gap-2 bg-white/20 hover:bg-white/30 border-slate-300 text-white    " 
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {/* //  registration Modal */}
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                event={event}
            />
        </div>
    )
}

