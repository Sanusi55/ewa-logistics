import Link from "next/link";
import { Truck, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Truck className="w-6 h-6 text-orange-500" />
              </div>
              <span className="font-bold text-xl tracking-tight">EWA Logistics</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nigeria's leading construction materials marketplace. Secure escrow payments, real-time tracking, and verified suppliers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
              <li><Link href="/materials" className="hover:text-orange-500 transition-colors">Browse Materials</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link href="/#contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* ✅ FLUTTERWAVE REQUIRED: Legal & Policies */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Policies & Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/policies/earnings" className="hover:text-orange-500 transition-colors">Earnings & Withdrawal</Link></li>
              <li><Link href="/policies/acceptable-use" className="hover:text-orange-500 transition-colors">Acceptable Use Policy</Link></li>
              <li><Link href="/policies/disputes" className="hover:text-orange-500 transition-colors">Dispute Resolution</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              {/* ✅ NEW: Refund Policy Link */}
              <li><Link href="/refund-policy" className="hover:text-orange-500 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* ✅ UPDATED: Contact Info for Flutterwave Compliance */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>info@ewalogistics.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>08161305942</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>Hamza Plaza, FHA, Lugbe, Abuja</span>
              </li>
            </ul>
            
            <div className="flex gap-3 mt-6">
              <a href="https://ewalogistics.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full hover:bg-orange-500 hover:text-white transition-colors text-muted-foreground">
                <Globe className="w-4 h-4" />
              </a>
              <a href="mailto:info@ewalogistics.com" className="p-2 bg-muted rounded-full hover:bg-orange-500 hover:text-white transition-colors text-muted-foreground">
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:08161305942" className="p-2 bg-muted rounded-full hover:bg-orange-500 hover:text-white transition-colors text-muted-foreground">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ✅ COPYRIGHT TEXT */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground text-center md:text-left">
          <p>© 2026 EWA Logistics Limited. All rights reserved. | Hamza Plaza, FHA, Lugbe, Abuja | RC: 9608218</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors">Terms</Link>
            <Link href="/refund-policy" className="hover:text-orange-500 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}