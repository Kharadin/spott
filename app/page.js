import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

import ExplorePage from "./(public)/explore/page";
import ExploreLayout from "./(public)/explore/layout";

export default function LandingPage() {
  return ( 

    <ExploreLayout>
      <Suspense fallback={<div className="p-20 text-center">Loading Events...</div>}>
        <ExplorePage />
      </Suspense>
    </ExploreLayout>

  )
}
