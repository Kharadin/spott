'use client'
import { api } from '@/convex/_generated/api'
import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-query'
import { City, State } from 'country-state-city'
import { Calendar, Loader2, MapPin, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation'
import React, { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { Input } from "@/components/ui/input";
import debounce from 'lodash/debounce';
import { getCategoryIcon } from '@/lib/data'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { createLocationSlug } from '@/lib/location-utils'
import { Button } from './ui/button'

const SearchLocationBar = () => {
 const router = useRouter()
 const [searchQuery, setSearchQuery] = useState("");
 const [showSearchResults, setShowSearchResults] = useState(false)
 const searchRef = useRef(null);
 const [selectedState, setSelectedState] = useState("")
 const [selectedCity, setSelectedCity] = useState("")
 
 const {data: currentUser, isLoading} = useConvexQuery(
   api.users.getCurrentUser
 )
 const {mutate: updateLocation} = useConvexMutation(
   api.users.completeOnboarding
 );
 const {data: searchResults, isLoading: searchLoading} = useConvexQuery(
   api.search.searchEvents,
   searchQuery.trim().length >=2 ? {query: searchQuery, limit: 5} : "skip"
 )

 const indianStates = State.getStatesOfCountry("IN");

 const cities = useMemo(() => {
   if (!selectedState) return [];
   const state = indianStates.find((s) => s.name === selectedState);
   if (!state) return [];
   return City.getCitiesOfState("IN", state.isoCode); 
 }, [selectedState, indianStates]);

 // Synchronize select values on mount using DB data OR browser storage if guest
 useEffect(() => {
   if (!isLoading) {
     if (currentUser?.location) {
       setSelectedState(currentUser.location.state || "");
       setSelectedCity(currentUser.location.city || "");
     } else {
       // --- GUEST BACK NAVIGATION CACHE READING ---
       const savedState = localStorage.getItem("guest_state");
       const savedCity = localStorage.getItem("guest_city");
       
       if (savedState) setSelectedState(savedState);
       if (savedCity) setSelectedCity(savedCity);
     }
   }
 }, [currentUser, isLoading])

 const debouncedSetQuery = useRef(
   debounce((value) => setSearchQuery(value), 300) 
 ).current

 const handleSearchInput = (e) => {
   const value = e.target.value
   debouncedSetQuery(value); 
   setShowSearchResults(value.length >= 2)
 }

 const handleEventClick = (slug) => {
   setShowSearchResults(false);
   setSearchQuery("");
   router.push(`/events/${slug}`);
 };

 useEffect(() => {
   const handleClickOutside = (event) => {
     if (searchRef.current && !searchRef.current.contains(event.target)) {
       setShowSearchResults(false);
     }
   }
   document.addEventListener("mousedown", handleClickOutside); 
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleLocationSelect = async (city, state) => {
   console.log("handleLocationSelect");
   console.log(city, state);
   try {
     if (currentUser?.interests && currentUser?.location) {
       // --- AUTHENTICATED USER DB WRITING ---
       if (!city) {
         console.log("updating only state");
         await updateLocation({
           location: {city: null, state, country: "India"},
           interests: currentUser.interests 
         })
       } else {
         console.log("updating both state and city");
         await updateLocation({
           location: {city, state, country: "India"},
           interests: currentUser.interests
         });
       }
     } else {
       // --- UNAUTHORIZED GUEST CACHE SAVING ---
       if (state) {
         localStorage.setItem("guest_state", state);
       }
       if (city) {
         localStorage.setItem("guest_city", city);
       } else {
         // Clear the city token if the user selects an entire state overview
         localStorage.setItem("guest_city", "");
       }
     }

     const slug = createLocationSlug(city, state);
     console.log(slug);
     router.push(`/explore/${slug}`);
   } catch (error) {
     console.log("Failed to update location:", error);
   }
 }

 return (
 <div className='flex items-center'>
   <div className='relative flex w-full' ref={searchRef}> 
     <div className='flex-1'>
       <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 '/>
       <Input 
         placeholder="by title" 
         onFocus={() => {
           if (searchQuery.length >= 2) setShowSearchResults(true)
         }}
         onChange={handleSearchInput}
         className="pl-10 w-full h-9 rounded-none rounded-l-md placeholder:text-slate-300"/>
     </div>
     
     {showSearchResults && (
       <div className='absolute top-full mt-2 w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto' >
         {searchLoading ? (
           <div className='p-4 flex items-center justify-center'>
             <Loader2 className='w-5 h-5 animate-spin text-purple-500 '/>
           </div>
         ) : searchResults && searchResults.length > 0 ? (
           <div className='py-2'>
             <p className='px-4 py-2 text-xs font-semibold text-muted-foreground'>
               SEARCH RESULTS
             </p>
             {searchResults.map((event) => (
               <button
                 key={event._id}
                 className='w-full px-4 py-3 hover:bg-muted/60 text-left transition-colors text-xs text-slate-500 hover:text-slate-600'
                 onClick={() => handleEventClick(event.slug)}
               >
                 <div className='flex items-start gap-3'>
                   <div className='text-2xl'>
                     {getCategoryIcon(event.category)}
                   </div>
                   <div className='flex-1 min-w-0'>
                     <p className='font-medium mb-1 line-clamp-1'>
                       {event.title}
                     </p>
                     <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                       <span className='flex items-center gap-1'>
                         <Calendar className='w-3 h-3'/>
                         {format(event.startDate, "MMM dd")}
                       </span>
                       <span className='flex items-center gap-1'>
                         <MapPin className='w-3 h-3'/>
                         {event.city}
                       </span>
                     </div>
                   </div>
                   {event.ticketType === "free" && ( 
                     <Badge variant="secondary" className='text-sx'>
                       Free
                     </Badge>
                   )}
                 </div>
               </button>
             ))}
           </div>
         ) : null} 
       </div>
     )}
   </div>

    {/* State selector container */}
    <div className='relative'>
    <Select
        value={selectedState}
        onValueChange={(value) => {
        // This still handles ordinary, normal state switches
        setSelectedState(value);
        setSelectedCity("");
        handleLocationSelect(null, value);
        }}
    >
        <SelectTrigger className="w-32 h-9 border-l-0 rounded-none data-[placeholder]:text-slate-300 [&>svg]:!text-slate-300 [&>svg]:!opacity-70">
        <SelectValue placeholder="State" />
        </SelectTrigger>
        
        <SelectContent>
        {indianStates.map((state) => (
            <SelectItem 
            key={state.isoCode} 
            value={state.name}
            // Native pointer handler intercepts the interaction regardless of selection state
            onPointerUp={() => {
                if (selectedState === state.name) {
                console.log("Same state clicked: resetting city view");
                setSelectedCity("");
                handleLocationSelect(null, state.name);
                }
            }}
            >
            {state.name}
            </SelectItem>
        ))}
        </SelectContent>
    </Select>
    </div>


   {/* City selector */}
   <Select
     value={selectedCity}
     onValueChange={(value) => {
       setSelectedCity(value);
       if (value && selectedState) {
         handleLocationSelect(value, selectedState)
       }
     }}
     disabled={!selectedState}
   >
     <SelectTrigger className={`w-32 h-9 border-l-0 rounded-none rounded-r-md disabled:opacity-100 [&>svg]:!opacity-70 ${
       !selectedState 
         ? "data-[placeholder]:text-slate-400 opacity-50 [&>svg]:!text-slate-400 cursor-not-allowed" 
         : "data-[placeholder]:text-slate-300 [&>svg]:text-slate-300"
       }`}
     >
       <SelectValue placeholder="City"/>
     </SelectTrigger>
     
     <SelectContent>
       {cities.map((city) => (
         <SelectItem key={city.name} value={city.name}>
           {city.name}
         </SelectItem>
       ))}
     </SelectContent>
   </Select>
 </div>
 )
}

export default SearchLocationBar;
