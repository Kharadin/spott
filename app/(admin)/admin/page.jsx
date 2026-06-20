// app/(admin)/admin/page.js
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {useRouter} from 'next/navigation'
import { useAuth } from "@/app/context/AuthContext";

export default function AdminDashboardPage() {
  const [showPast, setShowPast] = useState(false);
  const [timelineField, setTimelineField] = useState("endDate");

  const router = useRouter()
  
  // 📅 Initialize date string state default as Today's date format (YYYY-MM-DD)
  const [dateString, setDateString] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Reset to first page when any search criteria change
  useEffect(() => {
    setCurrentPage(0);
  }, [showPast, timelineField, dateString]);

  // Convert HTML date picker YYYY-MM-DD string safely into Unix milliseconds timestamp
  const targetTimestamp = new Date(dateString).getTime();

  // 🔑 Pull the current user profile from your custom Auth Context
  const {user, isLoading } = useAuth();

  // Call our index-optimized query
  // FIX: Evaluate the entire argument block. If user._id doesn't exist yet, skip the whole query execution.
  const pageData = useQuery(api.admin.getAdminEventsPage, 
    user?._id 
    ?  {
      userId: user._id,
      skipCount: currentPage * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
      showPast,
      selectedDate: targetTimestamp,
      timelineFilterField: /** @type {"startDate" | "endDate"} */ (timelineField),
    } : "skip");

  const togglePublish = useMutation(api.admin.togglePublishEvent);
  const toggleReview = useMutation(api.admin.toggleReviewEvent);
  const toggleCancel = useMutation(api.admin.toggleCancelEvent);

  if (pageData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { events, hasMore, totalCount } = pageData;

 
    const handleEventClick = (eventId) => {
        router.push(`/my-events/${eventId}`);
    };

  return (
    <div className="space-y-6">
      {/* Controls Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Admin Event Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            Displaying {events.length} of {totalCount} total indexed rows.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* 📅 NEW INTERACTIVE DATE FILTER INPUT */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shadow-inner">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">From:</span>
            <input
              type="date"
              value={dateString}
              onChange={(e) => setDateString(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          {/* Track By Strategy Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs">
            <span className="text-slate-500 font-medium px-2">Track by:</span>
            <Button
              variant={timelineField === "startDate" ? "default" : "ghost"}
              size="xs"
              onClick={() => setTimelineField("startDate")}
              className={timelineField === "startDate" ? "bg-slate-700 text-white text-[11px]" : "text-slate-700 text-[11px]"}
            >
              Start Date
            </Button>
            <Button
              variant={timelineField === "endDate" ? "default" : "ghost"}
              size="xs"
              onClick={() => setTimelineField("endDate")}
              className={timelineField === "endDate" ? "bg-slate-700 text-white text-[11px]" : "text-slate-700 text-[11px]"}
            >
              End Date
            </Button>
          </div>

          {/* Past / Future Windows */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <Button
              variant={!showPast ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPast(false)}
              className={!showPast ? "bg-purple-600 hover:bg-purple-700 text-white text-xs" : " text-slate-600 text-xs"}
            >
              Active & Upcoming
            </Button>
            <Button
              variant={showPast ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPast(true)}
              className={showPast ? "bg-purple-600 hover:bg-purple-700 text-white text-xs" : "text-xs text-slate-600"}
            >
              Past Archives
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-muted-foreground text-sm">No items found matching database index coordinates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {events.map((event) => (
            <div key={event._id} className={`flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition `}>
              <div className={`relative `}>
                {event.cancelled && (
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold shadow">
                    CANCELLED
                  </div>
                )}
                <div className={`${event.cancelled ? "opacity-70 border-red-200" : ""}`}> 
                <EventCard event={event} variant="grid"  onClick={() => handleEventClick(event._id)}/>
                </div>
              </div>
              
              <div className="p-3  bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-1">
                <Button
                  size="xs"
                  className={`text-[11px] px-1 text-white   ${!event.reviewed ? "bg-rose-500 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-800"}`}
                  onClick={() => toggleReview({ userId: user._id, id: event._id, review:   !event.reviewed })}
                >
                  {event.reviewed ? "Un-Review" : "Review"}
                </Button>
                
                <Button
                  size="xs"
                  className={`text-[11px] px-1 text-white ${!event.published ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                  onClick={() => togglePublish({ userId: user._id, id: event._id, publish: !event.published })}
                >
                  {event.published ? "Unpublish" : "Publish"}
                </Button>

                <Button
                  size="xs"
                  className="text-[11px]  px-1"
                  variant={!event.cancelled ? "default" : "destructive"}
                  onClick={() => toggleCancel({ userId: user._id, id: event._id, cancel: !event.cancelled })}
                >
                  {event.cancelled ? "Re-Activate" : "Cancel"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls Footer Bar */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasMore}
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-700">
              Showing <span className="font-medium">{currentPage * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              variant="outline"
              size="sm"
              className="gap-1 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" /> Load Previous
            </Button>
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!hasMore}
              variant="outline"
              size="sm"
              className="gap-1  text-slate-600"
            >
              Load Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
