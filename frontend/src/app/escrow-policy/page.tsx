import Link from "next/link";
import { ArrowLeft, Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function EscrowPolicyPage() {
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Escrow Policy</h1>
              <p className="text-xs text-muted-foreground">EWA Logistics Limited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Lock className="w-6 h-6 text-orange-500" />
              EWA PAYMENT PROTECTION AND ESCROW POLICY
            </h2>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6">
            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                Purpose
              </h3>
              <p className="text-muted-foreground">
                EWA Logistics Limited ("EWA") operates a payment protection system designed to protect customers, suppliers, and logistics partners throughout the transaction process. Under this policy, customer payments may be held by EWA until delivery obligations have been fulfilled or otherwise resolved.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                Payment Collection
              </h3>
              <p className="text-muted-foreground">
                All payments for orders placed through the EWA platform shall be made directly through approved EWA payment channels. By making payment, the customer authorizes EWA to manage and disburse funds in accordance with this policy.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                Payment Security
              </h3>
              <p className="text-muted-foreground">
                Customer funds received for an order shall be recorded and linked to the specific transaction. EWA shall not release supplier payments until the order has met the applicable release conditions.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                Order Processing
              </h3>
              <p className="text-muted-foreground mb-3">Upon confirmation that payment has been received:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>The supplier shall be notified that payment has been secured</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>The supplier may proceed with loading and dispatching the order</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Logistics arrangements may commence</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">5</span>
                Delivery Verification
              </h3>
              <p className="text-muted-foreground mb-3">Delivery may be verified through one or more of the following:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Delivery Code</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>GPS Tracking Records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Delivery Photographs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Site Representative Confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Driver Delivery Records</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">6</span>
                Payment Release
              </h3>
              <p className="text-muted-foreground mb-3">Supplier payment may be released when:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>The customer confirms successful delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>A valid delivery code is submitted</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Delivery is verified through available evidence and no dispute is reported</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>EWA determines that contractual delivery obligations have been fulfilled</span>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">7</span>
                Customer Review Period
              </h3>
              <p className="text-muted-foreground">
                Customers shall have up to 3 hours after verified delivery to raise a dispute. If no dispute is submitted within the review period, EWA may release payment to the supplier.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">8</span>
                Dispute Resolution
              </h3>
              <p className="text-muted-foreground">
                Where a dispute is raised, payment may be temporarily suspended while EWA reviews the matter. Customers may be required to provide evidence including photographs, videos, quantity measurements, and written explanations.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">9</span>
                EWA Investigation Authority
              </h3>
              <p className="text-muted-foreground">
                EWA shall have the authority to review all available evidence and make a final determination regarding delivery completion, quantity disputes, product specification disputes, and payment release decisions.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">10</span>
                Driver Protection
              </h3>
              <p className="text-muted-foreground">
                Drivers completing deliveries through the EWA platform may submit delivery records including GPS logs, delivery photographs, delivery codes, and site confirmations. These records may be used during dispute investigations.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">11</span>
                Fraud Prevention
              </h3>
              <p className="text-muted-foreground">
                Any attempt to provide false information, manipulate delivery records, submit fraudulent claims, or interfere with transaction integrity may result in account suspension, termination, withholding of funds, or reporting to relevant authorities.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">12</span>
                Refunds
              </h3>
              <p className="text-muted-foreground">
                Where EWA determines that a supplier has materially failed to fulfill an order, EWA may authorize a partial or full refund to the customer based on the facts and evidence available.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">13</span>
                Limitation of Liability
              </h3>
              <p className="text-muted-foreground">
                EWA acts as a transaction facilitator and payment protection administrator. While EWA will use reasonable efforts to investigate disputes fairly, EWA does not guarantee the performance of any customer, supplier, or logistics provider.
              </p>
            </section>

            <section className="p-6 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">14</span>
                Policy Changes
              </h3>
              <p className="text-muted-foreground">
                EWA reserves the right to amend this policy at any time. Updated versions shall be published on the EWA platform.
              </p>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-orange-500" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>EWA Logistics Limited</strong></p>
              <p>RC: 9608218</p>
              <p>Phone: +234 816 130 5942</p>
              <p>WhatsApp: 0903 579 0128</p>
              <p>Address: Babangida Market FHA Lugbe, Abuja, Nigeria</p>
              <p>Email: support@ewalogistics.com</p>
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