"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { blogPosts } from "@/lib/blog-data";
import { notFound } from "next/navigation";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Link href="/blog" className="text-orange-500 hover:underline flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <article className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to all articles
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/30 font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" /> {post.category}
              </span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{post.author}</p>
                <p className="text-xs text-muted-foreground">EWA Logistics Team</p>
              </div>
            </div>
          </motion.header>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-2xl"
          >
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg prose-invert max-w-none"
          >
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed font-medium">
              {post.excerpt}
            </p>
            <div className="text-foreground leading-relaxed space-y-6">
              <p>{post.content}</p>
              <p>At EWA Logistics, we are committed to continuously improving our platform to serve the needs of Nigeria's construction industry. Whether you are a contractor looking for reliable materials, a supplier wanting to reach more customers, or a driver seeking profitable routes, our platform is built with you in mind.</p>
              <p>Stay tuned for more updates, and don't hesitate to reach out to our support team if you have any questions or feedback.</p>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 glass rounded-2xl border border-border text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Ready to streamline your logistics?</h3>
            <p className="text-muted-foreground mb-6">Join thousands of professionals using EWA Logistics every day.</p>
            <Link 
              href="/materials"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
            >
              Get Started Today <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </motion.div>
        </div>
      </article>

      <footer className="py-8 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} EWA Logistics Limited. All rights reserved.</p>
      </footer>
    </div>
  );
}