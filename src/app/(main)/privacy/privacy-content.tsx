"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings-context";

export function PrivacyContent() {
  const { settings } = useSettings();
  
  const phoneNumber = settings.general.sitePhone || "+92 300 1234567";
  const siteEmail = settings.general.siteEmail || "info@pakautose.com";
  const siteAddress = settings.general.siteAddress || "Lahore, Pakistan";
  const siteName = settings.general.siteName || "PakAutoSe";

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account or place an order</li>
                <li>Request a service or submit a contact form</li>
                <li>Subscribe to our newsletter</li>
                <li>Communicate with us via email or phone</li>
              </ul>
              <p>This information may include your name, email address, phone number, shipping address, payment information, and any other information you choose to provide.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about orders and services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Shipping carriers to deliver your orders</li>
                <li>Payment processors to complete transactions</li>
                <li>Service providers who assist in our operations</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and cart items</li>
                <li>Analyze website traffic and usage</li>
                <li>Personalize your experience</li>
              </ul>
              <p>You can control cookies through your browser settings.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-4">
                <p>Email: {siteEmail}</p>
                <p>Phone: {phoneNumber}</p>
                <p>Address: {siteAddress}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
