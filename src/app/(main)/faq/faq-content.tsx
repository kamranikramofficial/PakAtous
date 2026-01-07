"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/settings-context";

export function FAQContent() {
  const { settings, formatPrice, isCODEnabled } = useSettings();
  const freeThreshold = parseFloat(settings.shipping.freeShippingThreshold) || 50000;
  const codEnabled = isCODEnabled();
  const codFee = parseFloat(settings.shipping.codFee) || 0;

  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How long does delivery take?",
          a: `Standard delivery takes ${settings.shipping.estimatedDeliveryDays || "3-7"} business days for major cities in Pakistan. Remote areas may take up to 10 business days. Express delivery options are available for urgent orders.`
        },
        {
          q: "What are the shipping costs?",
          a: `Shipping costs are calculated based on the weight, dimensions, and delivery location of your order. Free shipping is available for orders above ${formatPrice(freeThreshold)}.`
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
          a: `We accept ${settings.payment.enableBankTransfer !== "false" ? "bank transfers, " : ""}credit/debit cards${settings.payment.enableEasypaisa !== "false" ? ", EasyPaisa" : ""}${settings.payment.enableJazzCash !== "false" ? ", JazzCash" : ""}${codEnabled ? ", and Cash on Delivery (COD) for eligible orders" : ""}.`
        },
        {
          q: "Is Cash on Delivery available?",
          a: codEnabled 
            ? `Yes, COD is available for most orders.${codFee > 0 ? ` A ${formatPrice(codFee)} COD fee applies.` : ""}` 
            : "Cash on Delivery is currently not available. Please use bank transfer or other payment methods."
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
          q: "How do I claim warranty?",
          a: "To claim warranty, contact us with your order number and proof of purchase. Our team will guide you through the process and arrange for inspection if needed."
        },
        {
          q: "What does the warranty cover?",
          a: "Warranty typically covers manufacturing defects and component failures under normal use. Damage from misuse, accidents, or unauthorized modifications is not covered."
        }
      ]
    },
    {
      category: "Account & Support",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Register' button in the header and fill in your details. You can also register during checkout."
        },
        {
          q: "How can I contact customer support?",
          a: `You can reach us via email at ${settings.general.siteEmail || "support@pakautogenerator.com"}, phone at ${settings.general.sitePhone || "our hotline"}, or through our contact form.`
        },
        {
          q: "Can I sell my used generator through your platform?",
          a: "Yes! We offer a marketplace for selling used generators. Register an account and use the 'Sell Generator' feature to list your generator."
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {faqs.map((section) => (
        <div key={section.category}>
          <h2 className="text-2xl font-bold mb-4">{section.category}</h2>
          <div className="grid gap-4">
            {section.questions.map((faq, index) => (
              <Card key={index}>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
