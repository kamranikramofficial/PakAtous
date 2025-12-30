import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Terms of Service | Pak Auto Generator",
  description: "Terms of service for Pak Auto Generator - Read our terms and conditions for using our services.",
};

export default function TermsOfServicePage() {
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
              <p>By accessing and using the Pak Auto Generator website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Products and Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Pak Auto Generator offers:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sales of new and refurbished generators</li>
                <li>Genuine generator parts and accessories</li>
                <li>Installation, maintenance, and repair services</li>
                <li>Emergency service support</li>
              </ul>
              <p>All products are subject to availability. We reserve the right to limit quantities and discontinue products without notice.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pricing and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices are in Pakistani Rupees (PKR) unless otherwise stated</li>
                <li>Prices are subject to change without prior notice</li>
                <li>Payment must be made in full before delivery for prepaid orders</li>
                <li>Cash on Delivery (COD) is available for eligible orders</li>
                <li>We accept bank transfers, credit/debit cards, and other approved payment methods</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Shipping and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Standard delivery: 3-7 business days for major cities</li>
                <li>Shipping costs are calculated based on weight, dimensions, and delivery location</li>
                <li>Risk of loss passes to customer upon delivery</li>
                <li>Installation services may be scheduled separately</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>Products may be returned within 7 days of delivery if unused and in original packaging</li>
                <li>Custom or special-order items are non-returnable</li>
                <li>Defective products will be replaced or repaired under warranty</li>
                <li>Refunds will be processed within 7-14 business days after approval</li>
                <li>Return shipping costs are the responsibility of the customer unless the item is defective</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Warranty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>New generators come with manufacturer warranty (varies by brand)</li>
                <li>Refurbished generators include a 6-month limited warranty</li>
                <li>Parts carry a 30-day warranty against manufacturing defects</li>
                <li>Warranty does not cover damage from misuse, neglect, or improper installation</li>
                <li>Warranty claims must be accompanied by proof of purchase</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Service Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>Service quotes are valid for 30 days</li>
                <li>Emergency service is subject to technician availability</li>
                <li>Additional charges may apply for parts and materials</li>
                <li>Service guarantees apply only to work performed by our technicians</li>
                <li>Cancellation fees may apply for scheduled services cancelled within 24 hours</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to provide accurate and complete information</li>
                <li>You are responsible for all activities under your account</li>
                <li>We reserve the right to suspend or terminate accounts for violations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>To the maximum extent permitted by law, Pak Auto Generator shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific product or service in question.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts in Karachi, Pakistan.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>For questions about these Terms of Service, please contact us at:</p>
              <div className="mt-4">
                <p>Email: legal@pakautogenerator.com</p>
                <p>Phone: +92 300 1234567</p>
                <p>Address: Karachi, Pakistan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
