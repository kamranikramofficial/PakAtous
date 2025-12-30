import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQ | Pak Auto Generator",
  description: "Frequently asked questions about Pak Auto Generator - Find answers to common questions about our products and services.",
};

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3-7 business days for major cities in Pakistan. Remote areas may take up to 10 business days. Express delivery options are available for urgent orders."
      },
      {
        q: "What are the shipping costs?",
        a: "Shipping costs are calculated based on the weight, dimensions, and delivery location of your order. Free shipping is available for orders above PKR 50,000."
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order is shipped, you'll receive a tracking number via email. You can also track your order from your account dashboard."
      },
      {
        q: "Do you deliver to all areas in Pakistan?",
        a: "We deliver to most areas in Pakistan. During checkout, enter your city and postal code to confirm delivery availability in your area."
      }
    ]
  },
  {
    category: "Products",
    questions: [
      {
        q: "Are your generators genuine?",
        a: "Yes, we only sell 100% genuine generators from authorized manufacturers. All products come with manufacturer warranty and authentic documentation."
      },
      {
        q: "What's the difference between new and refurbished generators?",
        a: "New generators are brand new from the manufacturer. Refurbished generators have been professionally restored to like-new condition and come with a 6-month warranty."
      },
      {
        q: "How do I choose the right generator for my needs?",
        a: "Consider your power requirements (kVA/kW), fuel type preference, noise level needs, and budget. Our team can help you choose the perfect generator - contact us for a free consultation."
      },
      {
        q: "Do you sell generator parts?",
        a: "Yes, we carry a wide range of genuine spare parts including filters, batteries, alternators, starters, and more for all major generator brands."
      }
    ]
  },
  {
    category: "Services",
    questions: [
      {
        q: "What services do you offer?",
        a: "We offer installation, regular maintenance, repairs, emergency services, and generator inspection services. Our certified technicians are available across Pakistan."
      },
      {
        q: "How do I book a service?",
        a: "You can request a service through our website by visiting the Services page and filling out the request form. Alternatively, call our service hotline for immediate assistance."
      },
      {
        q: "Do you offer emergency repair services?",
        a: "Yes, we offer 24/7 emergency repair services. Call our emergency hotline for immediate assistance. Additional charges may apply for after-hours service."
      },
      {
        q: "How much do services cost?",
        a: "Service costs vary based on the type of service and generator model. We provide free quotes for all service requests before proceeding with any work."
      }
    ]
  },
  {
    category: "Payments & Returns",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers, credit/debit cards, JazzCash, EasyPaisa, and Cash on Delivery (COD) for eligible orders."
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available for orders up to PKR 500,000. A small verification deposit may be required for high-value orders."
      },
      {
        q: "What is your return policy?",
        a: "Unused products in original packaging can be returned within 7 days of delivery. Please review our full return policy for detailed terms and conditions."
      },
      {
        q: "How long do refunds take?",
        a: "Approved refunds are processed within 7-14 business days. The refund will be credited to your original payment method."
      }
    ]
  },
  {
    category: "Warranty",
    questions: [
      {
        q: "What warranty do generators come with?",
        a: "New generators come with manufacturer warranty (typically 1-3 years depending on the brand). Refurbished generators include a 6-month limited warranty from us."
      },
      {
        q: "What does the warranty cover?",
        a: "Warranty covers manufacturing defects and component failures under normal use. It does not cover damage from misuse, accidents, or unauthorized modifications."
      },
      {
        q: "How do I claim warranty?",
        a: "Contact our support team with your order details and description of the issue. We'll guide you through the warranty claim process."
      },
      {
        q: "Do parts have warranty?",
        a: "Yes, genuine parts carry a 30-day warranty against manufacturing defects. Keep your receipt as proof of purchase for warranty claims."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about our products, services, and policies.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-2xl font-bold mb-6">{section.category}</h2>
            <div className="space-y-4">
              {section.questions.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-16 bg-primary/5 rounded-2xl p-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-8">
          Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg">Contact Us</Button>
          </Link>
          <Button variant="outline" size="lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            +92 300 1234567
          </Button>
        </div>
      </div>
    </div>
  );
}
