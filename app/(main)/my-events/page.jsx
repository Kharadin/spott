'use client'

import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-query';
import { api } from '@/convex/_generated/api';

import { useRouter } from 'next/navigation'
import { toast } from 'sonner';
import { Loader2, Plus, Ticket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import EventCard from '@/components/event-card';
import { set } from 'lodash';
import { useState } from 'react';

const MyEvents = () => {
    const router = useRouter();

    // @ts-ignore
    const {data: events, isLoading} =useConvexQuery(api.events.getMyEvents);
    const {mutate: deleteEvent} = useConvexMutation(api.events.deleteEvent);
    
    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete the Event? This action cannot de undone and will permanently delete the event and all associated registrations.")
        ) {
            return;
        }
        try {
            await deleteEvent({eventId});
            toast.success("Event deleted successfully");
           
        } catch (error) {
            toast.error(error.message || "Failed to delete event");
        }
    }
    const handleEventClick = (eventId) => {
        router.push(`/my-events/${eventId}`);
    };
    /// let's add maintenance sync of events-registrationCount with registrations(counting related eventId, and status not cancelled)
    const [isSyncing, setIsSyncing] = useState(false);
    // Initialize the mutation hook
    const { mutate: syncCounts} = useConvexMutation(api.events.syncAllRegistrationCounts)
    
    const handleSync = async () => {
        try {
            setIsSyncing(true);
            const result = await syncCounts();
            toast.success("Event registration counts synced successfully");

        } catch (error) {
            toast.error(error.message || "Failed to sync event registration counts");
        } finally {
            setIsSyncing(false);
        }
    }

    const [syncVisible, setSyncVisible] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }


  return (
    <div className="min-h-screen  pb-20 px-4">
        <div className="max-w-7xl mx-auto pb-4">
            <div>
                <div className='flex gap-2 items-center'>
                    <h1 className="text-4xl font-bold mb-2">My Events</h1>
                    {/* The Maintenance Button */}
                    {syncVisible &&
                        <Button 
                        variant="outline"   
                        onClick={handleSync} 
                        disabled={isSyncing}
                        className="text-red-400"
                        
                        >
                            {isSyncing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Sync Counts"
                            )}
                        </Button>
                    }
                </div>
                <p className="text-muted-foreground"
                onClick={e=> setSyncVisible(!syncVisible)}>Manage your events</p>
            </div>

        </div>   

        {events?.length ===0?  
        ( <Card className="text-center p-12" > 
                <div className="max-w-md mx-auto space-y-4">
                    <div className="text-6xl mb-4">🎟️</div>
                    <h2 className="text-2xl font-semibold">Нет созданных вами мероприятий</h2>
                    <p className="text-muted-foreground">Создайте мероприятие и приглашайте участников</p>
                    <Button asChild className="gap-2">
                        <Link href="/create-event">     
                           <Plus className="w-4 h-4" />
                            Create your first Event
                        </Link>
                    </Button>
                </div>
        </Card>)
        
        : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {events?.map((event) => (
                <EventCard
                    key={event._id}
                    event={event}
                    onClick={() => handleEventClick(event._id)}
                    onDelete={() => handleDelete(event._id)}
                    action ="event"
                />
            ))}
        </div>
        )}
    </div>
            
  )
}

export default MyEvents