"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, CheckCircle, Mail, Phone, MapPin } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Refund Policy</h1>
              <p className="text-xs text-muted-foreground">EWA Logistics Limited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-orange-500" />
              EWA Logistics Refund Policy
            </h2>
            <p className="text-sm text-muted-foreground">Effective Date: 31/08/2026</p>
            <p className="text-sm text-muted-foreground mt-2">
              EWA Logistics ("EWA") operates a technology-enabled marketplace connecting customers with construction-material suppliers and independent logistics providers. This Refund Policy explains when customers may request a refund for payments made through the EWA platform. By placing an order through EWA, you agree to the terms of this Refund Policy.
            </p>
          </div>

          <div className="space-y-6">
            <Section number="1" title="Payments Made Through EWA">
              <p>EWA may process separate payments for different components of an order, including construction materials, EWA service charges, and delivery and logistics charges. Where applicable, these payments may be processed separately through EWA's payment provider. The status of each payment will be reflected in the customer's EWA account.</p>
            </Section>

            <Section number="2" title="When a Customer May Request a Refund">
              <p className="mb-3">A customer may request a refund where:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li><strong className="text-foreground">Supplier Cannot Fulfil the Order:</strong> If a supplier accepts an order but subsequently cannot supply the materials as agreed, EWA may cancel the order and initiate a refund for the affected material payment.</li>
                <li><strong className="text-foreground">Supplier Rejects or Fails to Accept the Order:</strong> If a customer has successfully paid for materials but the order cannot proceed because the supplier does not accept or cannot fulfil the order, the affected payment may be refunded.</li>
                <li><strong className="text-foreground">No Suitable Driver Is Available:</strong> Where delivery is required and no driver accepts the delivery request within the applicable period, the customer may request a refund of any delivery payment already made.</li>
                <li><strong className="text-foreground">Delivery Cannot Be Completed:</strong> If delivery cannot be completed due to circumstances attributable to the supplier, driver, or EWA, EWA may review the transaction and determine whether the affected payment should be refunded.</li>
                <li><strong className="text-foreground">Duplicate or Incorrect Payment:</strong> If a customer is charged twice for the same transaction or an incorrect amount is successfully charged due to a technical or payment error, EWA will investigate and, where confirmed, refund the excess or incorrect amount.</li>
              </ul>
            </Section>

            <Section number="3" title="Delivery Confirmation and Escrow">
              <p>EWA uses a delivery-confirmation process to protect transactions. Where applicable, supplier and driver/fleet earnings remain pending until the delivery has been completed and the customer confirms receipt using the EWA delivery verification process. Once delivery has been successfully confirmed by the customer, the relevant supplier and driver/fleet payments may be released.</p>
              <p className="mt-2">After delivery confirmation, refunds are not automatically available simply because a customer changes their mind. However, customers may still raise a dispute where the delivered materials:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                <li>Were not delivered;</li>
                <li>Are materially different from what was ordered;</li>
                <li>Are materially short in quantity;</li>
                <li>Are damaged or unusable upon delivery; or</li>
                <li>Were delivered to the wrong location.</li>
              </ul>
              <p className="mt-2">Such disputes must be reported to EWA as soon as reasonably possible.</p>
            </Section>

            <Section number="4" title="Delivery Fee Refunds">
              <p>Delivery payments are separate from material payments where the EWA checkout flow requires the customer to pay for delivery after a driver has accepted the delivery request.</p>
              <p className="mt-2">A delivery fee may be refundable where:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                <li>The driver does not commence the delivery;</li>
                <li>The driver cancels before collecting the materials;</li>
                <li>The delivery cannot be completed due to circumstances attributable to the driver;</li>
                <li>The customer was charged for a delivery that did not occur; or</li>
                <li>A duplicate delivery payment was made.</li>
              </ul>
              <p className="mt-2">Once a delivery has been successfully completed and confirmed, the delivery fee is generally non-refundable unless EWA determines that a refund is justified following an investigation.</p>
            </Section>

            <Section number="5" title="Material Quantity and Quality Disputes">
              <p>Customers are expected to inspect materials upon delivery where reasonably possible. If a customer believes that the delivered materials are materially different from the order, including significant shortages, incorrect material type, or significant damage, the customer should report the issue through the EWA platform before confirming delivery.</p>
              <p className="mt-2">Where appropriate, EWA may request supporting evidence, including:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                <li>Photographs or videos of the delivered materials;</li>
                <li>Delivery photographs;</li>
                <li>Order information;</li>
                <li>Weighbridge or quantity documentation;</li>
                <li>Delivery records;</li>
                <li>GPS or tracking information; and</li>
                <li>Other information reasonably required to investigate the dispute.</li>
              </ul>
              <p className="mt-2">EWA may review information from the customer, supplier, driver, and available platform records before making a decision.</p>
            </Section>

            <Section number="6" title="Service Charge">
              <p>EWA's applicable service charge may be non-refundable once the transaction and marketplace service have been successfully initiated. However, where an order is cancelled because EWA or the relevant supplier cannot fulfil the transaction, EWA may review whether the service charge should also be refunded. Any applicable refund will depend on the circumstances of the cancellation.</p>
            </Section>

            <Section number="7" title="Customer-Initiated Cancellation">
              <p>Customers may cancel an order before fulfilment, subject to the status of the order. If the supplier has not accepted or started fulfilling the order, the customer may generally request cancellation and a refund of eligible amounts.</p>
              <p className="mt-2">If the supplier or driver has already accepted and commenced fulfilment, cancellation may be subject to applicable costs or restrictions. Once delivery has been completed and confirmed, customer-initiated cancellation will generally not be accepted.</p>
            </Section>

            <Section number="8" title="Refund Review Process">
              <p>All refund requests are subject to review. EWA may consider order status, payment status, supplier acceptance, driver acceptance, delivery status, delivery confirmation, customer communications, platform records, tracking information, and evidence provided by the parties.</p>
              <p className="mt-2">EWA reserves the right to approve, partially approve, or reject a refund request based on the circumstances of the transaction.</p>
            </Section>

            <Section number="9" title="How to Request a Refund">
              <p>Customers should submit refund requests through the EWA platform or contact EWA through the official support channels displayed on the website.</p>
              <p className="mt-2">A refund request should include:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                <li>Customer name;</li>
                <li>Order number;</li>
                <li>Payment reference, where available;</li>
                <li>Reason for the refund request;</li>
                <li>Relevant photographs, videos, or documents; and</li>
                <li>Any other information requested by EWA.</li>
              </ul>
            </Section>

            <Section number="10" title="Refund Processing">
              <p>Once EWA approves a refund, the refund will be processed through the applicable payment channel or payment provider. The time required for the refunded amount to reach the customer's account may depend on the payment method, bank, card issuer, payment provider, or other financial institution involved.</p>
              <p className="mt-2">EWA does not guarantee a specific timeframe for the final crediting of a refund where processing is controlled by a third-party financial institution.</p>
            </Section>

            <Section number="11" title="Fraudulent or Abusive Refund Claims">
              <p>EWA may investigate refund requests that appear fraudulent, misleading, duplicated, abusive, or inconsistent with available transaction and delivery records. Where evidence indicates that a customer, supplier, or driver has intentionally provided false information or attempted to obtain an improper refund, EWA may reject the claim and may take appropriate action under its Terms and Conditions.</p>
            </Section>

            <Section number="12" title="Disputes">
              <p>Where a dispute arises between a customer, supplier, or driver concerning an order, EWA may temporarily hold the affected funds while the matter is reviewed, where applicable. EWA may request information from the relevant parties and review available transaction, delivery, tracking, and verification records before determining the appropriate resolution.</p>
            </Section>

            <Section number="13" title="Changes to This Refund Policy">
              <p>EWA may update this Refund Policy from time to time to reflect changes to its services, payment processes, regulatory requirements, or business operations. The updated policy will be published on the EWA website with the revised effective date.</p>
            </Section>
          </div>

          {/* ✅ UPDATED: Contact Section for Flutterwave Compliance */}
          <div className="mt-12 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-orange-500" />
              Contact Information
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">EWA Logistics</p>
              <p>RC: 8131924</p>
              <p>Website: www.ewalogistics.com</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>Hamza Plaza, FHA, Lugbe, Abuja, Nigeria</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>08161305942</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <a href="mailto:info@ewalogistics.com" className="hover:text-orange-500 transition-colors">info@ewalogistics.com</a>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for consistent section styling
function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="p-6 bg-card rounded-2xl border border-border">
      <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {number}
        </span>
        {title}
      </h3>
      <div className="text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}