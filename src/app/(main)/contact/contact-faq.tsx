"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings-context";

export function ContactFAQ() {
  const { settings } = useSettings();
  const estimatedDays = settings.shipping.estimatedDeliveryDays || "3-5";

  const faqs = [
    {
      question: "What are your delivery areas?",
      answer: `We deliver generators and parts across Pakistan. Delivery times vary by location - typically ${estimatedDays} business days for major cities.`
    },
    {
      question: "Do you offer installation services?",
      answer: "Yes! We provide professional installation services for all generators purchased from us. Contact us to schedule an installation."
    },
    {
      question: "What warranty do you offer?",
      answer: "All new generators come with manufacturer warranty. We also offer extended warranty packages for additional coverage."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email. You can also track your order from your account dashboard."
    }
  ];

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
