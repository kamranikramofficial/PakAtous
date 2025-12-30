import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Return Policy | Pak Auto Generator",
  description: "Return policy for Pak Auto Generator - Learn about our return and exchange procedures.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Return Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

        <div className="bg-primary/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Quick Summary</h2>
          <p className="text-muted-foreground">
            We offer a 7-day return policy for unused items in original packaging. 
            Defective items will be replaced or refunded under warranty terms.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Eligible Items for Return</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>The following items are eligible for return:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unused products in original, unopened packaging</li>
                <li>Items returned within 7 days of delivery</li>
                <li>Products with original tags, labels, and accessories</li>
                <li>Items accompanied by the original invoice or receipt</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Non-Returnable Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>The following items cannot be returned:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Custom or special-order generators and parts</li>
                <li>Installed or used products (unless defective)</li>
                <li>Items with removed or damaged packaging</li>
                <li>Electrical parts that have been tested or installed</li>
                <li>Items purchased more than 7 days ago</li>
                <li>Services that have been rendered</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Return Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>To initiate a return, follow these steps:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our customer service within 7 days of delivery</li>
                <li>Provide your order number and reason for return</li>
                <li>Receive a Return Authorization (RA) number</li>
                <li>Pack the item securely in its original packaging</li>
                <li>Include the RA number and original invoice inside the package</li>
                <li>Ship the item to our designated return address</li>
              </ol>
              <p className="mt-4">
                <strong>Note:</strong> Returns without an RA number will not be accepted.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Return Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>Return shipping costs are the responsibility of the customer for non-defective items</li>
                <li>We will cover return shipping for defective or incorrectly shipped items</li>
                <li>Use a trackable shipping method to ensure safe delivery</li>
                <li>We are not responsible for items lost or damaged during return shipping</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Inspection and Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Upon receiving your return:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Our team will inspect the item within 2-3 business days</li>
                <li>You will be notified of the inspection results via email</li>
                <li>Approved returns will be processed for refund or exchange</li>
                <li>Rejected returns will be shipped back at customer&apos;s expense</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Refund Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>For approved returns, you can choose:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Full Refund:</strong> Credited to original payment method within 7-14 business days</li>
                <li><strong>Store Credit:</strong> Instant credit added to your account</li>
                <li><strong>Exchange:</strong> Replace with another item of equal or greater value</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Original shipping charges are non-refundable unless the return is due to our error.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Defective Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>If you receive a defective item:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact us immediately upon discovery</li>
                <li>Provide photos or videos showing the defect</li>
                <li>Do not attempt to use or repair the item</li>
                <li>We will arrange for pickup or provide a prepaid shipping label</li>
                <li>You can choose a replacement or full refund</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Exchanges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>To exchange an item for a different product:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Follow the standard return process</li>
                <li>Specify the item you wish to exchange for</li>
                <li>Price differences will be charged or refunded accordingly</li>
                <li>Exchanges are subject to product availability</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Contact Us for Returns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Need to initiate a return? Contact our customer service team:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button>Contact Support</Button>
                </Link>
                <Button variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  returns@pakautogenerator.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
