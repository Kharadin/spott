"use client";

import { useState, useMemo } from "react";
import { MapPin, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { State, City } from "country-state-city";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data";

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [location, setLocation] = useState({
    state: "",
    city: "",
    country: "India",
  });

  const { mutate: completeOnboarding, isLoading } = useConvexMutation(
    api.users.completeOnboarding
  );

  // Get Indian states
  const indianStates = useMemo(() => {
    return State.getStatesOfCountry("IN");
  }, []);

  // Get cities based on selected state
  const cities = useMemo(() => {
    if (!location.state) return [];
    const selectedState = indianStates.find((s) => s.name === location.state);
    
    if (!selectedState) return [];
    return City.getCitiesOfState("IN", selectedState.isoCode);
  }, [location.state, indianStates]);

  const toggleInterest = (categoryId) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

   const handleComplete = async () => {
    try {
      await completeOnboarding({
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
        },
        interests: selectedInterests,
      });
      toast.success("Welcome to Spott! 🎉");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error(error);
    }
  };
  const handleNext = () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (step === 2 && (!location.city || !location.state)) {
      toast.error("Please select both state and city");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

 

  const progress = (step / 2) * 100;

  return (
    // <Dialog open={isOpen} onOpenChange={onClose}>
    <Dialog open={isOpen} onOpenChange={onClose}>
        {/* <DialogTrigger asChild>
          <Button   className="bg-purple-500 hover:bg-purple-600">
            Get Started
          </Button>
        </DialogTrigger> */}
      <DialogContent className="sm:max-w-2xl gap-0 p-4">
        <DialogHeader className="flex flex-col items-start text-left space-y-0 pb-0 ">
          <div className=" w-full mb-1">
            <Progress value={progress} className="h-1 w-full" />
          </div>
          <DialogTitle className="flex items-center gap-2 text-xl mt-[-4px] text-slate-900 dark:text-slate-100">
            {step === 1 ? (
              <>
                <Heart className="w-6 h-6 text-purple-500" />
                Выберете интересы
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6 text-purple-500" />
                Where are you located?
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-[-2px]">
            {step === 1
              ? "минимум 3 категории, мы подберём события для вас   "
              : "We'll show you events happening near you"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-1">
          {/* Step 1: Select Interests */}
          {step === 1 && (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-[400px] overflow-y-auto p-1 mt-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleInterest(category.id)}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-103 ${
                      selectedInterests.includes(category.id)
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-border hover:border-purple-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-200">{category.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedInterests.length >= 3 ? "default" : "secondary"
                  }
                >
                  {selectedInterests.length} selected
                </Badge>
                {selectedInterests.length >= 3 && (
                  <span className="text-sm text-green-500">
                    ✓ Ready to continue
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 mt-2">
                  {/* Here and below styles somewhat diff from author's, copy-paste if needed  */}
                    {/* State Column */}
                <div className="flex flex-col gap-1.5"> 

                 <Label htmlFor="state" className="font-medium text-slate-900 dark:text-slate-200 ml-0.5">State</Label>
                  <Select
                    value={location.state}
                    onValueChange={(value) => {
                      setLocation({ ...location, state: value, city: "" });
                    }}
                  >
                    <SelectTrigger id="state" className="h-11 w-full bg-white dark:bg-slate-950 border-slate-400 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-purple-500/30 focus:border-purple-500 transition-colors"
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                    {/* City Column */}
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="city" className=" font-medium text-slate-900 dark:text-slate-200 ml-0.5">City
                    </Label>
                    <Select
                    value={location.city}
                    onValueChange={(value) => setLocation({ ...location, city: value })}
                    disabled={!location.state}
                    >
                    <SelectTrigger 
                        id="city" 
                               className="h-11 w-full bg-white dark:bg-slate-950 border-slate-400 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-purple-500 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                    >
                        <SelectValue placeholder={location.state ? "Select city" : "State first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        {cities.length > 0 ? (
                        cities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                            {city.name}
                            </SelectItem>
                        ))
                        ) : (
                        <SelectItem value="no-cities" disabled>No cities available</SelectItem>
                        )}
                    </SelectContent>
                    </Select>
                </div>
              </div>
             {location.city && location.state && (
                <div className="p-4 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    {/* bg-purple-500/5 is slightly softer in light mode */}
                    <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                            Your location
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                            {location.city}, {location.state}, {location.country}
                            </p>
                        </div>
                    </div>
                </div>
             )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            //   className="gap-2 outline-slate-400 dark:outline-slate-600 text-slate-500 dark:text-slate-600"
            className="gap-2 border-slate-400  text-slate-600  hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isLoading}
className="flex-1 gap-2 bg-indigo-700 text-white hover:bg-indigo-600 active:scale-[0.98] dark:bg-indigo-300 dark:text-indigo-950 dark:hover:bg-indigo-200 transition-all shadow-md shadow-indigo-500/20"
          >
            {isLoading
              ? "Completing..."
              : step === 2
                ? "Complete Setup"
                : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
