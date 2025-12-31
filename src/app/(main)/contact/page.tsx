import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact Us | Pak Auto Generator",
  description: "Get in touch with Pak Auto Generator for all your generator needs, service requests, and inquiries.",
};

export default function ContactPage() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions? We&apos;re here to help. Reach out to us through any of the channels below.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Our Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Main Office: Karachi, Pakistan<br />
                Service Center: Industrial Area, Lahore
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Phone Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                <strong>Sales:</strong> +92 300 1234567
              </p>
              <p className="text-muted-foreground">
                <strong>Service:</strong> +92 300 7654321
              </p>
              <p className="text-muted-foreground">
                <strong>Emergency:</strong> +92 300 1111111
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                <strong>General:</strong> info@pakautogenerator.com
              </p>
              <p className="text-muted-foreground">
                <strong>Sales:</strong> sales@pakautogenerator.com
              </p>
              <p className="text-muted-foreground">
                <strong>Support:</strong> support@pakautogenerator.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
                <p className="text-sm mt-2 text-primary">
                  * Emergency services available 24/7
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <ContactForm />

          {/* Map Placeholder */}
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
                  <p className="text-sm">Karachi, Pakistan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What are your delivery areas?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We deliver generators and parts across Pakistan. Delivery times vary by location - typically 2-5 business days for major cities.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer installation services?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! We provide professional installation services for all generators purchased from us. Contact us to schedule an installation.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What warranty do you offer?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All new generators come with manufacturer warranty. We also offer extended warranty packages for additional coverage.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How can I track my order?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Once your order is shipped, you&apos;ll receive a tracking number via email. You can also track your order from your account dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
