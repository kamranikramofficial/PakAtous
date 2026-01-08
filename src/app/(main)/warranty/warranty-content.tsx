"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useSettings } from "@/contexts/settings-context";

export function WarrantyContent() {
  const { settings } = useSettings();
  
  const phoneNumber = settings.general.sitePhone || "+92 300 1234567";
  const siteEmail = settings.general.siteEmail || "info@pakautose.com";

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Warranty Information</h1>
        <p className="text-muted-foreground mb-8">
          All products from {settings.general.siteName} come with comprehensive warranty coverage for your peace of mind.
        </p>

        {/* Warranty Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                </svg>
              </div>
              <CardTitle>New Generators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">2 Years</p>
              <p className="text-muted-foreground">Full parts and labor warranty</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <CardTitle>Used Generators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">6 Months</p>
              <p className="text-muted-foreground">Limited warranty coverage</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <CardTitle>Spare Parts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">90 Days</p>
              <p className="text-muted-foreground">Manufacturer warranty</p>
            </CardContent>
          </Card>
        </div>

        {/* Warranty Details */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Covered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Manufacturing defects in materials or workmanship</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Engine and alternator components under normal use</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Electrical components and control panels</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Fuel system components (pumps, injectors, tanks)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Free labor for warranty repairs at our service centers</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Not Covered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <span>Damage from misuse, abuse, or neglect</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <span>Normal wear and tear items (filters, belts, spark plugs)</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <span>Damage from incorrect fuel or oil usage</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <span>Unauthorized modifications or repairs</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <span>Damage from power surges or external electrical issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <span>Cosmetic damage or minor scratches</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Claim Warranty</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Locate Your Purchase Information</strong>
                  <p>Have your order number and product details ready</p>
                </li>
                <li>
                  <strong className="text-foreground">Contact Our Warranty Team</strong>
                  <p>Call us at {phoneNumber} or email {siteEmail}</p>
                </li>
                <li>
                  <strong className="text-foreground">Describe the Issue</strong>
                  <p>Provide details about the problem you&apos;re experiencing</p>
                </li>
                <li>
                  <strong className="text-foreground">Schedule Service</strong>
                  <p>We&apos;ll arrange for pickup or you can bring it to our service center</p>
                </li>
                <li>
                  <strong className="text-foreground">Repair or Replacement</strong>
                  <p>If covered, we&apos;ll repair or replace the defective parts at no cost</p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Keep your original purchase receipt for warranty claims</li>
                <li>Register your product online within 30 days of purchase for extended warranty</li>
                <li>Follow the recommended maintenance schedule in your owner&apos;s manual</li>
                <li>Use only genuine {settings.general.siteName} parts for replacements</li>
                <li>Do not remove or alter warranty seals</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Need Warranty Support?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our dedicated warranty team is here to help you with any claims or questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button>Contact Warranty Support</Button>
                </Link>
                <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                  <Button variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {phoneNumber}
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
