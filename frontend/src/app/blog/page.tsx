"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, User, Tag } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { blogPosts } from "@/lib/blog-data";
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonBlogPost, 
  SkeletonStats 
} from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export default function BlogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  // Simulate loading to showcase skeleton loaders
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // 1.2 second loading simulation

    return () => clearTimeout(timer);
  }, []);

  // ✅ Skeleton Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Skeleton */}
        <section className="relative pt-32 pb-16 px-6">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <Skeleton className="h-14 w-2/3 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
        </section>

        {/* Featured Post Skeleton */}
        <section className="pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 glass p-6 rounded-3xl border border-border">
              <Skeleton className="h-80 w-full rounded-2xl" />
              <div className="space-y-4 py-4">
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-32 rounded-full" />
                </div>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
                <div className="pt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Posts Skeleton Grid */}
        <section className="py-16 px-6 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-9 w-48 mb-12" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SkeletonBlogPost />
              <SkeletonBlogPost />
              <SkeletonBlogPost />
            </div>
          </div>
        </section>

        {/* Newsletter Skeleton */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass p-12 rounded-3xl border border-border text-center space-y-6">
              <Skeleton className="h-10 w-2/3 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ✅ Actual Content
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Insights & <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Updates</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay up to date with the latest news, tips, and trends in construction logistics and the EWA platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 glass p-4 md:p-6 rounded-3xl border border-border hover:border-orange-500/30 transition-all overflow-hidden">
                <div className="relative h-64 md:h-full min-h-[300px] rounded-2xl overflow-hidden">
                  <img 
                    src={featuredPost.imageUrl} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-lg">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center py-4">
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {featuredPost.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 group-hover:text-orange-500 transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 text-base md:text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <span className="flex items-center gap-2 text-orange-500 font-semibold group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Other Posts Grid */}
      <section className="py-16 px-4 md:px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold">Latest Articles</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {otherPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="group h-full block">
                  <div className="glass rounded-2xl border border-border hover:border-orange-500/30 transition-all overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/30 font-medium">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-orange-500 font-medium group-hover:gap-2 transition-all">
                          Read <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-8 md:p-12 rounded-3xl border border-border"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Get the latest industry insights, platform updates, and construction tips delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} EWA Logistics Limited. All rights reserved.</p>
      </footer>
    </div>
  );
}