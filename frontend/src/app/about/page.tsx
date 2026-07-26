"use client";

import { motion } from "framer-motion";
import { 
  Target, Eye, Heart, Users, Award, TrendingUp, 
  Shield, Clock, CheckCircle, ArrowRight, MapPin, Phone, Mail
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function AboutPage() {
  const stats = [
    { label: "Active Deliveries", value: "1,250+", icon: TrendingUp },
    { label: "Verified Suppliers", value: "340+", icon: Users },
    { label: "Success Rate", value: "98%", icon: Award },
    { label: "Years Experience", value: "5+", icon: Clock },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We believe in honest pricing, clear communication, and secure transactions. Every delivery is tracked and verified."
    },
    {
      icon: Target,
      title: "Quality First",
      description: "We partner only with verified suppliers and drivers who meet our strict quality standards."
    },
    {
      icon: Heart,
      title: "Customer-Centric",
      description: "Your satisfaction is our priority. We're available 24/7 to support you through every step."
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "We empower local suppliers and drivers, creating opportunities and supporting Nigeria's construction industry."
    }
  ];

  const team = [
    {
      name: "Leadership Team",
      role: "Experienced Professionals",
      description: "Our leadership team brings decades of experience in logistics, construction, and technology.",
      icon: Users
    },
    {
      name: "Operations",
      role: "Efficient & Reliable",
      description: "Our operations team ensures every delivery is coordinated seamlessly from start to finish.",
      icon: CheckCircle
    },
    {
      name: "Customer Support",
      role: "Always Available",
      description: "Our support team is available 24/7 to assist you with any questions or concerns.",
      icon: Phone
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">EWA Logistics</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building Nigeria's construction industry through innovative logistics and trusted partnerships.
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

      {/* Mission & Vision */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize Nigeria's construction industry by providing a reliable, transparent, and efficient platform 
                that connects customers with verified suppliers and drivers. We're committed to making construction material 
                delivery seamless, secure, and accessible to everyone.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Eye className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To become Nigeria's leading construction materials marketplace, known for trust, innovation, and excellence. 
                We envision a future where every construction project, big or small, can access quality materials and reliable 
                delivery services at their fingertips.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at EWA Logistics.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
                    <value.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dedicated professionals working together to deliver excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white mx-auto mb-4">
                  <member.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-orange-500 mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EWA Logistics?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're more than just a delivery platform. We're your trusted partner in construction.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Secure Escrow Payments",
              "Real-Time GPS Tracking",
              "Verified Suppliers & Drivers",
              "24/7 Customer Support",
              "Competitive Pricing",
              "Fast & Reliable Delivery"
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-card/50 rounded-xl border border-border"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl border border-border"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust EWA Logistics for their construction material needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/materials"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Order Materials <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 px-6 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium">Babangida Market FHA Lugbe, Abuja</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Phone className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium">+234 816 130 5942</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium">support@ewalogistics.com</p>
            </div>
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