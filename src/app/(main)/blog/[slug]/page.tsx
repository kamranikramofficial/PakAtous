import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";

// Sample blog posts data
const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
}> = {
  "how-to-choose-right-generator-for-home": {
    title: "How to Choose the Right Generator for Your Home",
    excerpt: "Selecting the perfect generator for your home can be challenging. Learn about different types, power ratings, and features to make an informed decision.",
    content: `
## Understanding Your Power Needs

Before shopping for a generator, you need to understand your power requirements. Start by listing all the essential appliances and devices you want to power during an outage.

### Essential Appliances to Consider:
- Refrigerator (400-800 watts)
- Lights (60-200 watts)
- Air Conditioner (1000-4000 watts)
- Fans (75-150 watts)
- Water Pump (500-2000 watts)
- Television (100-400 watts)
- Computer/Laptop (100-300 watts)

## Types of Generators

### 1. Portable Generators
Portable generators are versatile and can be moved easily. They're ideal for:
- Emergency backup during outages
- Outdoor events and camping
- Construction sites

**Pros:** Affordable, mobile, easy to store
**Cons:** Noisier, requires manual start, fuel storage needed

### 2. Inverter Generators
These produce clean, stable power suitable for sensitive electronics.
- Quieter operation
- Fuel efficient
- Higher price point

### 3. Standby Generators
Permanently installed generators that start automatically during power outages.
- High power output
- Automatic operation
- Professional installation required

## Calculating Generator Size

Use this formula to calculate your needs:
1. List all appliances with their running watts
2. Add starting watts for motor-driven appliances (usually 2-3x running watts)
3. Add 20% buffer for safety

**Example:**
- Refrigerator: 400W running + 1200W starting
- AC: 1500W running + 4500W starting
- Lights: 300W
- Total: ~6500W recommended

## Key Features to Look For

1. **Fuel Type:** Petrol, Diesel, or Gas
2. **Electric Start:** Easier than manual pull-start
3. **Noise Level:** Look for below 70 decibels for residential use
4. **Fuel Efficiency:** Hours of runtime per liter
5. **Warranty:** Minimum 2 years recommended

## Budget Considerations

Generator prices vary widely:
- Small portable (1-3 kW): PKR 30,000 - 80,000
- Medium portable (3-7 kW): PKR 80,000 - 200,000
- Large portable/standby (7-15 kW): PKR 200,000 - 500,000

## Conclusion

Choosing the right generator involves balancing your power needs, budget, and desired features. Consider consulting with our experts for personalized recommendations based on your specific requirements.
    `,
    category: "Buying Guide",
    author: "Ahmed Khan",
    date: "December 15, 2024",
    readTime: "8 min read",
  },
  "generator-maintenance-tips": {
    title: "10 Essential Generator Maintenance Tips",
    excerpt: "Regular maintenance is key to keeping your generator running smoothly. Follow these expert tips to extend the life of your generator.",
    content: `
## Why Generator Maintenance Matters

A well-maintained generator can last 15-30 years, while a neglected one might fail in just a few years. Regular maintenance ensures reliability, efficiency, and safety.

## 10 Essential Maintenance Tips

### 1. Run Your Generator Regularly
Even if you don't need it, run your generator for 30 minutes every month. This keeps the engine lubricated and prevents fuel system problems.

### 2. Check Oil Levels
Before every use, check the oil level. Change oil:
- First change: After 25 hours
- Subsequent changes: Every 50-100 hours

### 3. Replace Air Filters
A dirty air filter reduces efficiency and can damage the engine. Check monthly and replace:
- Paper filters: Every 200 hours
- Foam filters: Clean every 50 hours

### 4. Maintain Fuel Quality
- Use fresh fuel (less than 30 days old)
- Add fuel stabilizer for storage
- Drain fuel if storing for extended periods

### 5. Check Spark Plugs
Inspect spark plugs every 100 hours. Replace if:
- Electrodes are worn
- Deposits are visible
- Gap is incorrect

### 6. Inspect Battery (Electric Start Models)
- Keep terminals clean
- Check electrolyte levels
- Ensure tight connections
- Replace every 2-3 years

### 7. Test the Transfer Switch
If you have an automatic transfer switch, test it annually to ensure proper operation.

### 8. Keep It Clean
- Wipe exterior regularly
- Remove debris from cooling vents
- Clean fuel tank cap area before refueling

### 9. Check Exhaust System
Look for:
- Loose connections
- Rust or corrosion
- Leaks

### 10. Annual Professional Service
Schedule a professional inspection annually for:
- Load testing
- Electrical connections
- Internal components

## Maintenance Schedule Summary

| Task | Frequency |
|------|-----------|
| Run generator | Monthly |
| Check oil | Before use |
| Change oil | Every 100 hours |
| Air filter | Every 200 hours |
| Spark plug | Every 100 hours |
| Professional service | Annually |

## When to Call a Professional

Contact a professional if you notice:
- Unusual noises or vibrations
- Smoke or unusual exhaust
- Difficulty starting
- Power fluctuations
- Fuel leaks

Regular maintenance might seem like extra work, but it's far cheaper than major repairs or early replacement. Your generator is an investment in your family's comfort and safety—treat it accordingly.
    `,
    category: "Maintenance",
    author: "Muhammad Ali",
    date: "December 10, 2024",
    readTime: "6 min read",
  },
  "understanding-generator-power-ratings": {
    title: "Understanding Generator Power Ratings: kVA vs kW",
    excerpt: "Confused about kVA and kW ratings? This comprehensive guide explains the difference and helps you calculate your power needs.",
    content: `
## The Basics of Electrical Power

Understanding generator power ratings is crucial for selecting the right unit. Let's break down the key terms and concepts.

## What is kW (Kilowatt)?

Kilowatt measures **real power** - the actual power that does useful work. When you see a device rated at 1000W or 1kW, that's the power it actually consumes.

## What is kVA (Kilovolt-Ampere)?

kVA measures **apparent power** - the total power in an electrical circuit. It includes both:
- Real power (kW)
- Reactive power (kVAR)

## The Power Factor

The relationship between kW and kVA is determined by the **power factor (PF)**:

$$kW = kVA × Power Factor$$

For most generators:
- Residential: PF = 0.8
- Commercial: PF = 0.8 - 1.0

### Example Calculation:
A 10 kVA generator with 0.8 power factor delivers:
$$10 kVA × 0.8 = 8 kW$$

## Why Two Ratings?

Manufacturers often list both because:
1. **kVA** represents the generator's capacity
2. **kW** represents usable power
3. Different loads have different power factors

## Types of Loads

### Resistive Loads (PF ≈ 1.0)
- Light bulbs
- Heaters
- Toasters

### Inductive Loads (PF ≈ 0.6-0.8)
- Motors
- Pumps
- Air conditioners
- Refrigerators

### Starting vs Running Power

Inductive loads require extra power to start:
- Running watts: Normal operation
- Starting watts: Initial surge (2-6x running)

## How to Calculate Your Needs

### Step 1: List Your Appliances
| Appliance | Running Watts | Starting Watts |
|-----------|---------------|----------------|
| AC (1.5 ton) | 1500 | 4500 |
| Refrigerator | 400 | 1200 |
| TV | 200 | 200 |
| Lights | 300 | 300 |
| Fan | 75 | 150 |

### Step 2: Calculate Total
- **Running Total:** 2475W
- **Starting Total (highest):** 4500W
- **Recommended:** 2475 + 4500 = ~7000W (7kW)

### Step 3: Convert to kVA
$$kVA = kW ÷ 0.8 = 7 ÷ 0.8 = 8.75 kVA$$

**Recommendation:** Choose a 10 kVA generator for this load.

## Common Generator Sizes

| kVA Rating | kW Output | Typical Use |
|------------|-----------|-------------|
| 2.5 kVA | 2 kW | Small home, basic needs |
| 5 kVA | 4 kW | Medium home, most appliances |
| 10 kVA | 8 kW | Large home, AC + appliances |
| 15 kVA | 12 kW | Large home, multiple ACs |
| 25+ kVA | 20+ kW | Commercial/Industrial |

## Pro Tips

1. **Always size up** - It's better to have extra capacity
2. **Consider future needs** - Plan for additional appliances
3. **Check power factor** - Different loads affect efficiency
4. **Don't overload** - Stay under 80% of capacity for optimal performance

## Conclusion

Understanding the difference between kVA and kW helps you make an informed decision. When in doubt, consult with our experts for a personalized assessment of your power needs.
    `,
    category: "Technical",
    author: "Usman Tariq",
    date: "December 5, 2024",
    readTime: "10 min read",
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  if (!post) {
    return { title: "Article Not Found" };
  }
  
  return {
    title: `${post.title} | Pak Auto Generator Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  const relatedPosts = Object.entries(blogPosts)
    .filter(([key]) => key !== slug)
    .slice(0, 2)
    .map(([key, value]) => ({ slug: key, ...value }));

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-6 border-b">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </header>

          {/* Featured Image Placeholder */}
          <div className="h-64 md:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            {post.content.split('\n').map((line, index) => {
              if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={index} className="ml-6 text-muted-foreground">{line.replace('- ', '')}</li>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={index} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.trim() === '') {
                return <br key={index} />;
              }
              if (line.startsWith('|')) {
                return null; // Skip table rows for simplicity
              }
              if (line.startsWith('$$')) {
                return <div key={index} className="bg-muted p-4 rounded-lg font-mono text-center my-4">{line.replace(/\$\$/g, '')}</div>;
              }
              return <p key={index} className="text-muted-foreground mb-4">{line}</p>;
            })}
          </div>

          {/* Share Section */}
          <div className="flex items-center gap-4 mt-12 pt-8 border-t">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Share2 className="h-4 w-4" />
              Share this article:
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded w-fit">
                    {relatedPost.category}
                  </span>
                  <CardTitle className="text-lg">{relatedPost.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{relatedPost.excerpt}</p>
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <Button variant="outline" size="sm">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing a Generator?</h2>
          <p className="text-muted-foreground mb-6">
            Our experts are here to help you find the perfect generator for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generators">
              <Button size="lg">Browse Generators</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
