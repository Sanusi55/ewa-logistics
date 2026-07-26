"use client";

import { motion } from "framer-motion";
import { 
  Newspaper, Mail, Phone, Download, Calendar, ExternalLink,
  CheckCircle, ArrowRight, Image, FileText, Award,
  Users, TrendingUp, Globe, Clock, MapPin
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function PressPage() {
  const pressReleases = [
    {
      id: 1,
      title: "EWA Logistics Launches Revolutionary Construction Materials Platform in Nigeria",
      date: "2024-01-15",
      category: "Product Launch",
      excerpt: "EWA Logistics announces the launch of Nigeria's first comprehensive construction materials marketplace with secure escrow payments and real-time tracking.",
      readMore: "#"
    },
    {
      id: 2,
      title: "EWA Logistics Partners with Leading Construction Firms Across Nigeria",
      date: "2024-02-20",
      category: "Partnerships",
      excerpt: "Major construction companies including Dangote Group and Julius Berger join EWA Logistics platform to streamline material procurement.",
      readMore: "#"
    },
    {
      id: 3,
      title: "EWA Logistics Achieves 98% Delivery Success Rate in First Quarter",
      date: "2024-03-10",
      category: "Milestones",
      excerpt: "The platform reports exceptional performance metrics with over 1,250 successful deliveries and 340+ verified suppliers.",
      readMore: "#"
    },
    {
      id: 4,
      title: "New Features: Real-Time GPS Tracking and Delivery Code System",
      date: "2024-04-05",
      category: "Product Updates",
      excerpt: "EWA Logistics introduces advanced tracking capabilities and secure delivery verification system for enhanced customer experience.",
      readMore: "#"
    }
  ];

  const mediaCoverage = [
    {
      title: "How EWA Logistics is Transforming Nigeria's Construction Industry",
      publication: "TechCabal",
      date: "March 2024",
      url: "#"
    },
    {
      title: "The Future of Construction Logistics in Africa",
      publication: "Disrupt Africa",
      date: "February 2024",
      url: "#"
    },
    {
      title: "Startup Spotlight: EWA Logistics Brings Transparency to Material Delivery",
      publication: "Nigerian Tribune",
      date: "January 2024",
      url: "#"
    }
  ];

  const stats = [
    { label: "Active Deliveries", value: "1,250+", icon: TrendingUp },
    { label: "Verified Suppliers", value: "340+", icon: Users },
    { label: "Success Rate", value: "98%", icon: Award },
    { label: "Cities Covered", value: "15+", icon: MapPin }
  ];

  const brandAssets = [
    {
      name: "EWA Logistics Logo (PNG)",
      type: "Logo",
      size: "High Resolution",
      format: "PNG with transparency"
    },
    {
      name: "EWA Logistics Logo (SVG)",
      type: "Logo",
      size: "Vector Format",
      format: "SVG scalable"
    },
    {
      name: "Brand Guidelines",
      type: "Document",
      size: "Complete Guide",
      format: "PDF"
    },
    {
      name: "Product Screenshots",
      type: "Images",
      size: "Multiple Sizes",
      format: "PNG/JPG"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
              <Newspaper className="w-4 h-4" />
              Press & Media Center
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Press & <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Media</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find press releases, media resources, and brand assets. 
              For media inquiries, please contact our press team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border text-center"
              >
                <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Press Releases</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news and announcements from EWA Logistics.
            </p>
          </motion.div>

          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/30">
                        {release.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(release.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                      {release.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {release.excerpt}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <a 
                      href={release.readMore}
                      className="inline-flex items-center gap-2 text-orange-500 font-medium hover:underline"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Media Coverage</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what media outlets are saying about EWA Logistics.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaCoverage.map((coverage, index) => (
              <motion.div
                key={coverage.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Newspaper className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-orange-500 font-medium mb-1">{coverage.publication}</p>
                    <p className="text-xs text-muted-foreground">{coverage.date}</p>
                  </div>
                </div>
                <h3 className="font-bold mb-3 group-hover:text-orange-500 transition-colors">
                  {coverage.title}
                </h3>
                <a 
                  href={coverage.url}
                  className="inline-flex items-center gap-2 text-sm text-orange-500 font-medium hover:underline"
                >
                  Read Article <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Brand Assets</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Download official EWA Logistics logos, images, and brand guidelines for media use.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {brandAssets.map((asset, index) => (
              <motion.div
                key={asset.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    {asset.type === "Logo" ? (
                      <Image className="w-6 h-6 text-orange-500" />
                    ) : asset.type === "Document" ? (
                      <FileText className="w-6 h-6 text-orange-500" />
                    ) : (
                      <Image className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  <a 
                    href="#"
                    className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-orange-500" />
                  </a>
                </div>
                <h3 className="font-bold mb-2">{asset.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Type: {asset.type}</p>
                  <p>Size: {asset.size}</p>
                  <p>Format: {asset.format}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Brand Usage Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  When using EWA Logistics brand assets, please follow our brand guidelines to ensure 
                  consistent representation. The EWA Logistics logo should always be used with proper 
                  spacing and on appropriate backgrounds. For specific usage questions, contact our 
                  media team.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl border border-border"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Media Inquiries
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              For press inquiries, interview requests, or media partnerships, 
              please contact our media relations team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a 
                href="mailto:press@ewalogistics.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
              >
                <Mail className="w-4 h-4" /> press@ewalogistics.com
              </a>
              <a 
                href="tel:+2348161305942"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" /> +234 816 130 5942
              </a>
            </div>
            <div className="flex flex-col md:flex-row gap-6 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2 justify-center">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Babangida Market FHA Lugbe, Abuja</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Mon - Fri: 9:00 AM - 5:00 PM</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ for Journalists */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Common questions from journalists and media professionals.
            </p>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: "How do I request an interview with EWA Logistics leadership?",
                a: "Please email press@ewalogistics.com with your request, including the publication, topic, and deadline. We typically respond within 24 hours."
              },
              {
                q: "Can I use EWA Logistics images in my article?",
                a: "Yes, you can use our brand assets for editorial purposes. Please download from the Brand Assets section above and follow our brand guidelines."
              },
              {
                q: "How does EWA Logistics make money?",
                a: "EWA Logistics charges a small commission on transactions processed through our platform. We also offer premium features for suppliers and drivers."
              },
              {
                q: "What makes EWA Logistics different from competitors?",
                a: "Our secure escrow payment system, real-time GPS tracking, and delivery code verification system set us apart. We're focused on trust and transparency in construction logistics."
              },
              {
                q: "How many deliveries has EWA Logistics completed?",
                a: "We've completed over 1,250 successful deliveries with a 98% success rate. Our platform connects 340+ verified suppliers with customers across Nigeria."
              }
            ].map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl border border-border group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors rounded-xl list-none">
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} EWA Logistics Limited. All rights reserved.</p>
        <p className="mt-2">RC: 9608218 | Babangida Market FHA Lugbe, Abuja, Nigeria</p>
      </footer>
    </div>
  );
}