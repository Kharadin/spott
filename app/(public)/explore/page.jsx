"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils_bcp1";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CATEGORIES } from "@/lib/data";
import Autoplay from "embla-carousel-autoplay";
import EventCard from "@/components/event-card"
import { Card, CardContent } from "@/components/ui/card";

export default function ExplorePage() {
  const router = useRouter();
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  // Fetch current user for location
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  console.log(currentUser);
  // Fetch events
  const { data: featuredEvents, isLoading: loadingFeatured } = useConvexQuery(
    api.explore.getFeaturedEvents,
    { limit: 3 }
  );
  // console.log(featuredEvents);

  const { data: localEvents, isLoading: loadingLocal } = useConvexQuery(
    api.explore.getEventsByLocation,
    {
      city: currentUser?.location?.city || "Gurugram",
      state: currentUser?.location?.state || "Haryana",
      limit: 4,
    }
  );
  // console.log("currentUser", currentUser);
  // console.log("localEvents", localEvents);

  const { data: popularEvents, isLoading: loadingPopular } = useConvexQuery(
    api.explore.getPopularEvents,
    { limit: 6 }
  );

  const { data: categoryCounts } = useConvexQuery(
    api.explore.getCategoryCounts
  ); // Since useConvexQuery is async,
  //  categoryCounts will be initially undefined, so optional chaining operator ?., 
  // count: will be initially undefined until data arrives.

  const categoriesWithCounts = CATEGORIES.map((cat) => {  // maybe try it with useMemo later
    return {   // explicit return
      ...cat,
      count: categoryCounts?.[cat.id] || 0
    }
  })


  const handleEventClick = (slug) => {
    router.push(`/events/${slug}`);
  };

  const handleCategoryClick = (categoryId)=> {
    router.push(`explore/${categoryId}`);
  }


  const handleViewLocalEvents = () => {
    const city = currentUser?.location?.city || "Gurugram";
    const state = currentUser?.location?.state || "Haryana";
    const slug = createLocationSlug(city, state);
    router.push(`/explore/${slug}`);
   };

   // Loading state
   const isLoading = loadingFeatured || loadingLocal || loadingPopular

   if (isLoading){
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
    </div>

   }

  return (
     <> 
     <div className='pb-12 text-center'>

        <h1 className='text-5xl md:text-6xl font-bold mp-4'> Discover Events</h1>
        <p className='text-ld text-muted-foreground max-w-3xl mx-auto'>Explore featured events, find what&apos;s happening locally, or browse events across Russia</p>
     </div>

     {/* Featured Carousel */}

     {featuredEvents?.length > 0 && (
        <div className='mb-16'>

            <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset} opts={undefined} setApi={undefined}          >
            <CarouselContent className={undefined}>
              {featuredEvents.map((event, index) => (
                <CarouselItem key={event._id} className={undefined}>
                  <div
                    className="relative h-[400px] rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => handleEventClick(event.slug)}
                  >
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority = {index === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        //  unoptimized
                        //  className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: event.themeColor }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
                    {/* this was to make the images darker */}
                    <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                      <Badge className="w-fit mb-4" variant="secondary">
                        {/* width fit content */}
                        {event.city}, {event.state || event.country}
                      </Badge>
                      <h2 className="text-3xl md:text-5xl font-bold mb-3 text-white">
                        {event.title}
                      </h2>
                      <p className="text-lg text-white/90 mb-4 max-w-2xl line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center  gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {format(event.startDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            {event.registrationCount} registered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
         
      )}
     {/* Local Events */}
      {localEvents && localEvents.length > 0 && (
        <div className='mb-16 '>
          <div className="flex items-center  justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                Events Near You
              </h2>
              <p className="text-muted-foreground">
                Happening in {currentUser?.location?.city || "your area"}
              </p>

            </div>
            <Button
              variant="outline"
             className="gap-2 bg-slate-500 text-white dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-100 dark:hover:text-slate-900 transition-colors"

              onClick={handleViewLocalEvents} 
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {localEvents.map((event)=>(
              <EventCard 
              key={event._id} 
              event={event}
              variant="grid"
              onClick={() => handleEventClick(event.slug)} />
            ))}
          </div>

        </div>  
      )}
      {/* Browse by category */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoriesWithCounts.map((category)=> (
            <Card
            key={category.id}
            className="py-2 group cursor-pointer hover:whadow-lg transition-all hover:border-purple-500/50" 
            onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-3 sm:p-6 flex items-center  gap-3">
                <div className="text-3xl sm:text-4xl">{category.icon} </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} Event{category.count !==1 ? "s" : "" }

                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular events across Rus */}
      {popularEvents && popularEvents.length > 0 && (
        <div className="mb-16"> 
          <div className="mb-6">
            <h2 className='text-3xl font-bold mb-1'>Популярные события</h2>
            <p className="text-muted-foreground">по всему черноморскому побережью: Сочи, Туапсе, Адлер, Лазаревское, Геленджик...</p>
          </div>

          <div className="grid grid-cols1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="list"
                onClick={()=> handleEventClick(event.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty Slate */}
      {!loadingFeatured &&
        !loadingLocal &&
        !loadingPopular && 
        (!featuredEvents || featuredEvents.length === 0 )&& 
        (!localEvents || localEvents.length === 0) &&
        (popularEvents || popularEvents.length === 0) && (

          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-6xl mb-4">🎉🎊🎶</div>
              <h2 className="text-2xl font-bold">No events yet</h2>
              <p className='text-muted-foreground'>
                Be the first to create an event in your area
              </p>
              <Button asChild className='gap-2'>
                <a href='/create-event'>Create Event</a>
              </Button>

            </div>

          </Card>
        )
      }

    </>
   
  )
}

