"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings-context";

export function TermsContent() {
  const { settings } = useSettings();
  
  const phoneNumber = settings.general.sitePhone || "+92 300 1234567";
  const siteEmail = settings.general.siteEmail || "info@pakautose.com";
  const siteAddress = settings.general.siteAddress || "Lahore, Pakistan";
  const siteName = settings.general.siteName || "PakAutoSe";

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>By accessing and using the {siteName} website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Products and Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>{siteName} offers:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sale of new and used generators</li>
                <li>Generator spare parts and accessories</li>
                <li>Repair and maintenance services</li>
                <li>Installation services</li>
                <li>Rental services</li>
              </ul>
              <p>All products are subject to availability. We reserve the right to limit quantities and refuse any order at our discretion.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pricing and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices are in Pakistani Rupees (PKR) unless otherwise stated</li>
                <li>Prices are subject to change without notice</li>
                <li>We accept bank transfers, mobile payments (JazzCash, Easypaisa), and cash on delivery</li>
                <li>Payment must be received before order processing (except COD)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Shipping and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>We deliver across Pakistan</li>
                <li>Delivery times vary by location (typically 3-7 business days)</li>
                <li>Shipping costs are calculated based on weight and destination</li>
                <li>Risk of loss transfers to buyer upon delivery</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>Returns accepted within 7 days of delivery for unused products</li>
                <li>Products must be in original packaging with all accessories</li>
                <li>Refunds processed within 7-10 business days after inspection</li>
                <li>Custom or special-order items are non-refundable</li>
              </ul>
              <p>See our full <a href="/returns" className="text-primary hover:underline">Return Policy</a> for details.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Warranty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>All products come with manufacturer warranty. See our <a href="/warranty" className="text-primary hover:underline">Warranty Page</a> for complete coverage details.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining account confidentiality</li>
                <li>You must provide accurate and complete information</li>
                <li>We reserve the right to suspend or terminate accounts</li>
                <li>You must be 18 years or older to create an account</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>All content on this website, including text, graphics, logos, and images, is the property of {siteName} and protected by intellectual property laws. Unauthorized use is prohibited.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>{siteName} shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase price of the product.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts in {siteAddress.split(",")[0] || "Pakistan"}.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>For questions about these Terms of Service, please contact us at:</p>
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
