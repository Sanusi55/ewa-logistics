import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function EarningsPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="glass rounded-2xl border border-border p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl md:text-3xl font-bold">Earnings, Commission & Withdrawal Policy</h1>
          </div>
          <p className="text-muted-foreground mb-8">Effective Date: 13 August 2026</p>
          
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
            <p>EWA Logistics separates user earnings from withdrawable balances to protect customers, suppliers, and drivers throughout the order and delivery process.</p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">1. EWA Platform Charges</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supplier Commission:</strong> EWA charges suppliers a 5% commission on the applicable material sale amount. Automatically deducted.</li>
              <li><strong>Driver Commission:</strong> EWA charges drivers a 5% commission on the accepted delivery charge. Automatically deducted.</li>
              <li><strong>Customer Service Fee:</strong> Customers pay a ₦5,000 service fee per order. This is charged separately and is not deducted from supplier or driver earnings.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">2. Net Earnings Calculation</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supplier:</strong> Material amount − 5% EWA commission.</li>
              <li><strong>Driver:</strong> Delivery charge − 5% EWA commission.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">3. Earnings Dashboard & Withdrawal Restriction</h3>
            <p>Users can see their earnings on their dashboard before delivery confirmation. However, funds remain <strong>locked</strong> until the customer's delivery has been successfully confirmed. The dashboard clearly distinguishes between Net earnings, Locked/Pending earnings, and Available for withdrawal.</p>

            <h3 className="text-lg font-semibold mt-6 mb-2">4. Customer Delivery Confirmation</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Verification Code:</strong> The customer provides the EWA delivery verification code after receiving materials. The driver enters it to confirm.</li>
              <li><strong>Manual Confirmation:</strong> EWA may conduct an authorized manual confirmation process if the code cannot be used.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">5. Unlocking Earnings</h3>
            <p>Once delivery is confirmed, the order is marked completed, and net earnings become available for withdrawal immediately, subject to compliance checks.</p>

            <h3 className="text-lg font-semibold mt-6 mb-2">6. Disputes and Reviews</h3>
            <p>Earnings may remain locked while EWA reviews any customer dispute, payment issue, suspected fraud, or compliance matter.</p>

            <p className="mt-8 pt-6 border-t border-border font-semibold">
              EWA Logistics<br/>
              Website: <a href="https://www.ewalogistics.com" className="text-orange-500 hover:underline">https://www.ewalogistics.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}