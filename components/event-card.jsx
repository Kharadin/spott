"use client";

import { Calendar, MapPin, Users, Trash2, X, QrCode, Eye } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EventCard({
  event,
  onClick,
  onDelete,
  variant = "grid", // "grid" or "list"
  action = null, // "event" | "ticket" | null
  className = "",
}) {
  // List variant (compact horizontal layout)
  if (variant === "list") {
    return (
      <Card
        className={`py-0 group cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/50 ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-3 flex gap-3">
          {/* Event Image */}
          <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden relative">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl"
                style={{ backgroundColor: event.themeColor }}
              >
                {getCategoryIcon(event.category)}
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
      <h3 className="text-slate-900 font-bold text-sm mb-1 group-hover:text-purple-400 transition-colors duration-500 line-clamp-2">
              {event.title}
            
            </h3>
            <p className="text-xs text-muted-foreground mb-1">
              {format(event.startDate, "EEE, dd MMM, HH:mm")}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">
                {event.locationType === "online" ? "Online Event" : event.city}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{event.registrationCount} attending</span>
            </div>
          </div>
        </CardContent>  
      </Card>
    );
  }

  // Grid variant (default - original design)
  return (
    <Card
      className={`overflow-hidden group pt-0 ${onClick ? "cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/50" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 "
            width={500}
            sizes="500px"  // experimental
            height={192}
            priority
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-9xl"
            style={{ backgroundColor: event.themeColor }}
          >
            {getCategoryIcon(event.category)}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary">
            {event.ticketType === "free" ? "Free" : "Paid"}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-3">
        <div>
          <Badge variant="outline" className="mb-2">
            {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
          </Badge>
          <h3 className="text-slate-900 font-semibold text-lg line-clamp-2 group-hover:text-purple-400 transition-colors duration-500 ">
            {event.title}
          </h3>

        </div>
        {/* // Event details:date, location, people */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between" >
            <div className="flex items-center gap-2 ">

                <Calendar className="w-4 h-4" />
                <span>{format(event.startDate, "PPP")}</span>
            </div>
            <div> {!event.reviewed &&
               ( <span>На рассмотрении</span>)
             }
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">
                {event.locationType === "online"
                  ? "Online Event"
                  : `${event.city}, ${event.state || event.country}`}
              </span>
            </div>
              <div> {!event.published &&
               ( <span>Неопубликован</span>)
             }
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {event.registrationCount} / {event.capacity} registered
            </span>
          </div>
        </div>

        {action && (
          <div className="flex gap-2 pt-2">
            {/* Primary button */}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
              }}
            >
              {action === "event" ? (
                <>
                  <Eye className="w-4 h-4" />
                  View
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Show Ticket
                </>
              )}
            </Button>

            {/* Secondary button - delete / cancel */}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event._id);
                }}
              >
                {action === "event" ? (
                  <Trash2 className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
