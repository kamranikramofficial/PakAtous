import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export const metadata = {
  title: "Warranty Information | Pak Auto Generator",
  description: "Warranty information for Pak Auto Generator products - Learn about coverage, terms, and how to claim warranty.",
};

export default function WarrantyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Warranty Information</h1>
        <p className="text-muted-foreground mb-8">
          All products from Pak Auto Generator come with comprehensive warranty coverage for your peace of mind.
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
              <p className="text-3xl font-bold text-primary mb-2">1-3 Years</p>
              <p className="text-sm text-muted-foreground">Manufacturer Warranty</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M16 16h5v5"/>
                </svg>
              </div>
              <CardTitle>Refurbished</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">6 Months</p>
              <p className="text-sm text-muted-foreground">Limited Warranty</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <CardTitle>Spare Parts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">30 Days</p>
              <p className="text-sm text-muted-foreground">Defect Warranty</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Manufacturing defects in materials and workmanship",
                  "Electrical component failures under normal use",
                  "Engine defects (new generators only)",
                  "Alternator and starter motor issues",
                  "Control panel malfunctions",
                  "Fuel system defects",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Not Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Damage from accidents, misuse, or neglect",
                  "Normal wear and tear components (filters, spark plugs, etc.)",
                  "Damage from improper installation or unauthorized modifications",
                  "Damage from power surges or electrical abnormalities",
                  "Cosmetic damage that doesn't affect functionality",
                  "Products used for purposes other than intended",
                  "Damage from natural disasters or acts of God",
                  "Products without valid proof of purchase",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warranty Terms by Brand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Brand</th>
                      <th className="text-left py-3 px-4">Residential Use</th>
                      <th className="text-left py-3 px-4">Commercial Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { brand: "Honda", residential: "3 Years", commercial: "2 Years" },
                      { brand: "Yamaha", residential: "3 Years", commercial: "2 Years" },
                      { brand: "Perkins", residential: "2 Years", commercial: "1 Year" },
                      { brand: "Cummins", residential: "2 Years", commercial: "1 Year" },
                      { brand: "Caterpillar", residential: "2 Years", commercial: "1 Year" },
                      { brand: "Other Brands", residential: "1 Year", commercial: "6 Months" },
                    ].map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 font-medium">{row.brand}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.residential}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.commercial}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Claim Warranty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>Contact Support:</strong> Reach out to our customer service team via phone, email, or the contact form.
                </li>
                <li>
                  <strong>Provide Details:</strong> Include your order number, product details, and a description of the issue.
                </li>
                <li>
                  <strong>Documentation:</strong> Provide photos or videos showing the defect if applicable.
                </li>
                <li>
                  <strong>Assessment:</strong> Our team will review your claim and may request an inspection.
                </li>
                <li>
                  <strong>Resolution:</strong> Approved claims will be resolved through repair, replacement, or refund.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extended Warranty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We offer extended warranty plans for additional protection beyond the standard warranty period:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>1-Year Extension:</strong> PKR 15,000 - PKR 50,000 (based on generator value)</li>
                <li><strong>2-Year Extension:</strong> PKR 25,000 - PKR 85,000 (based on generator value)</li>
              </ul>
              <p>
                Extended warranty must be purchased within 30 days of original purchase. Contact us for more details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintaining Your Warranty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>To ensure your warranty remains valid:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep your original receipt and warranty card safe</li>
                <li>Follow the recommended maintenance schedule</li>
                <li>Use only genuine parts and accessories</li>
                <li>Have repairs done by authorized service centers</li>
                <li>Register your product within 30 days of purchase</li>
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
                <Button variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  +92 300 1234567
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
