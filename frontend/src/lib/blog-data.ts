export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "future-of-construction-logistics",
    title: "The Future of Construction Logistics in Nigeria",
    excerpt: "Discover how technology is revolutionizing the way building materials are sourced, tracked, and delivered across Nigeria's booming construction sector.",
    content: "The construction industry in Nigeria has traditionally been plagued by inefficiencies, delayed deliveries, and lack of transparency. However, the advent of digital logistics platforms like EWA Logistics is changing the game. By leveraging real-time GPS tracking, secure escrow payments, and a verified network of suppliers, we are ensuring that projects stay on schedule and within budget. The future is digital, and it's already here.",
    category: "Industry Trends",
    author: "EWA Team",
    date: "2024-05-15",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    readTime: "5 min read"
  },
  {
    slug: "understanding-escrow-payments",
    title: "Why Escrow Payments are a Game Changer for Contractors",
    excerpt: "Learn how our secure escrow system protects both buyers and suppliers, ensuring fair transactions and eliminating payment disputes.",
    content: "Payment disputes are one of the biggest headaches in the construction industry. Suppliers worry about getting paid, while contractors worry about paying for materials that never arrive or don't meet quality standards. EWA Logistics solves this with our Escrow Payment system. Funds are held securely and only released when the delivery is confirmed via our unique 6-digit delivery code. This builds trust and ensures smooth operations for everyone involved.",
    category: "Platform Features",
    author: "EWA Team",
    date: "2024-04-22",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop",
    readTime: "4 min read"
  },
  {
    slug: "optimizing-supply-chain",
    title: "5 Ways to Optimize Your Construction Supply Chain",
    excerpt: "Practical tips for project managers to reduce material waste, lower costs, and improve delivery times on their construction sites.",
    content: "Managing a construction site requires juggling dozens of suppliers and delivery schedules. Here are 5 ways to optimize your supply chain: 1. Consolidate orders to reduce delivery fees. 2. Use digital platforms for real-time tracking. 3. Build relationships with verified suppliers. 4. Implement just-in-time delivery to reduce on-site storage issues. 5. Always inspect materials before confirming delivery. By following these steps, you can significantly improve your project's bottom line.",
    category: "Tips & Guides",
    author: "Operations Team",
    date: "2024-03-10",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop",
    readTime: "6 min read"
  },
  {
    slug: "driver-partnership-success",
    title: "How Our Driver Partners are Earning 3x More",
    excerpt: "A deep dive into how the EWA bidding system empowers truck drivers to choose profitable routes and grow their independent businesses.",
    content: "Before EWA Logistics, many independent truck drivers struggled to find consistent work and often faced delayed payments from middlemen. Our platform flips the script. Drivers can browse available delivery jobs, bid on routes that make sense for them, and get paid instantly upon successful delivery confirmation. We've seen our top driver partners increase their monthly income by up to 300% while enjoying the freedom of being their own boss.",
    category: "Success Stories",
    author: "EWA Team",
    date: "2024-02-18",
    imageUrl: "https://images.unsplash.com/photo-1590496793929-36417d31176b?q=80&w=1200&auto=format&fit=crop",
    readTime: "4 min read"
  }
];