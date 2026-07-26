"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, Users, Heart, TrendingUp, MapPin, Clock,
  CheckCircle, ArrowRight, Mail, Phone, Award,
  Zap, Target, Shield, Coffee, Home, Calendar,
  DollarSign, Star, GraduationCap, Globe
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function CareersPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Salary",
      description: "Industry-leading compensation packages with regular performance reviews and bonuses."
    },
    {
      icon: Home,
      title: "Remote Work Options",
      description: "Flexible work arrangements with hybrid and fully remote positions available."
    },
    {
      icon: Heart,
      title: "Health Insurance",
      description: "Comprehensive health, dental, and vision coverage for you and your family."
    },
    {
      icon: GraduationCap,
      title: "Learning & Development",
      description: "Annual learning budget, conferences, and professional development opportunities."
    },
    {
      icon: Calendar,
      title: "Generous PTO",
      description: "25+ days paid time off, plus company holidays and flexible scheduling."
    },
    {
      icon: Coffee,
      title: "Team Culture",
      description: "Regular team events, retreats, and a supportive, collaborative environment."
    }
  ];

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Backend Developer",
      department: "Engineering",
      location: "Abuja, Nigeria (Hybrid)",
      type: "Full-time",
      experience: "5+ years",
      salary: "₦8M - ₦12M",
      description: "Build and maintain our scalable backend infrastructure using Node.js and PostgreSQL."
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "₦6M - ₦9M",
      description: "Create intuitive user experiences for our logistics platform across web and mobile."
    },
    {
      id: 3,
      title: "Operations Manager",
      department: "Operations",
      location: "Lagos, Nigeria",
      type: "Full-time",
      experience: "4+ years",
      salary: "₦7M - ₦10M",
      description: "Oversee daily operations and ensure smooth delivery coordination across Nigeria."
    },
    {
      id: 4,
      title: "Customer Success Specialist",
      department: "Customer Support",
      location: "Abuja, Nigeria",
      type: "Full-time",
      experience: "2+ years",
      salary: "₦4M - ₦6M",
      description: "Provide exceptional support to our customers and help them succeed on our platform."
    },
    {
      id: 5,
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      experience: "4+ years",
      salary: "₦6M - ₦9M",
      description: "Lead marketing campaigns and grow our brand presence across Nigeria."
    },
    {
      id: 6,
      title: "Data Analyst",
      department: "Analytics",
      location: "Abuja, Nigeria (Hybrid)",
      type: "Full-time",
      experience: "2+ years",
      salary: "₦5M - ₦7M",
      description: "Analyze platform data to drive business decisions and improve user experience."
    }
  ];

  const process = [
    {
      step: 1,
      title: "Apply Online",
      description: "Submit your application through our website with your resume and cover letter.",
      icon: Mail
    },
    {
      step: 2,
      title: "Initial Screening",
      description: "Our HR team reviews your application and reaches out if there's a match.",
      icon: CheckCircle
    },
    {
      step: 3,
      title: "Technical Interview",
      description: "Meet with our team for a technical or role-specific interview.",
      icon: Users
    },
    {
      step: 4,
      title: "Final Interview",
      description: "Meet with leadership to discuss culture fit and career goals.",
      icon: Star
    },
    {
      step: 5,
      title: "Offer & Onboarding",
      description: "Receive your offer and join our amazing team!",
      icon: Award
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Innovation",
      description: "We constantly push boundaries and embrace new technologies to solve real problems."
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We do the right thing, even when no one is watching. Trust is our foundation."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe the best solutions come from diverse teams working together."
    },
    {
      icon: Zap,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from code to customer service."
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
              <Briefcase className="w-4 h-4" />
              We're Hiring!
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Build Your Career with <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">EWA Logistics</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join Nigeria's leading construction materials platform and help revolutionize 
              how building materials are delivered across the country.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#openings"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
              >
                View Open Positions <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Contact HR
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Team Members", value: "50+", icon: Users },
              { label: "Countries", value: "1", icon: Globe },
              { label: "Open Positions", value: "6", icon: Briefcase },
              { label: "Growth Rate", value: "200%", icon: TrendingUp },
            ].map((stat, index) => (
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

      {/* Why Work With Us */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Work at EWA Logistics?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're building something special, and we want you to be part of it.
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

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Amazing Benefits</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We take care of our team so they can take care of our customers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
              >
                <div className="p-3 bg-orange-500/10 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section id="openings" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Current Openings</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find your next career opportunity with us.
            </p>
          </motion.div>

          <div className="space-y-4">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/30">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {job.experience}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <a 
                      href={`mailto:careers@ewalogistics.com?subject=Application for ${job.title}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Don't see a position that fits your skills?
            </p>
            <a 
              href="mailto:careers@ewalogistics.com?subject=Spontaneous Application"
              className="inline-flex items-center gap-2 text-orange-500 font-medium hover:underline"
            >
              Send us your resume anyway <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Hiring Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple, transparent process designed to find the best fit for both you and us.
            </p>
          </motion.div>

          <div className="space-y-6">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="glass p-6 rounded-2xl border border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                        <step.icon className="w-7 h-7 text-white" />
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center">
                          <span className="text-xs font-bold">{step.step}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6">
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
              Ready to Join Our Team?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              We'd love to hear from you! Send your resume and let's explore how you can 
              contribute to our mission of revolutionizing construction logistics in Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a 
                href="mailto:careers@ewalogistics.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
              >
                <Mail className="w-4 h-4" /> careers@ewalogistics.com
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

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} EWA Logistics Limited. All rights reserved.</p>
        <p className="mt-2">RC: 9608218 | Babangida Market FHA Lugbe, Abuja, Nigeria</p>
      </footer>
    </div>
  );
}