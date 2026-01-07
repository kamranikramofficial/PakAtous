"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings-context";

export function ContactMap() {
  const { settings } = useSettings();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Find Us</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p>Interactive Map</p>
            <p className="text-sm">{settings.general.siteAddress || "Pakistan"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
