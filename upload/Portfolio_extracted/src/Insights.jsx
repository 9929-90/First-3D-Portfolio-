import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// ─── BLOG DATA ────────────────────────────────────────────────────────────────

const blogs = [
  {
    id: 1,
    number: '01',
    tag: 'Architecture',
    title: 'Why System Design Still Humbles Me',
    summary: 'System design isn\'t just about drawing boxes. It\'s about making decisions under incomplete information.',
    rating: 4.5,
    readTime: '4 min read',
    accent: '#ff3333',
    content: `There's a moment in every system design interview — or in every real project — where you realize you've been thinking too small. You sketch a box that says "database" and someone asks: "What happens when it gets 10 million writes a day?" That pause? That's where real engineering lives.

System design humbled me early. I built AapnoKaam with a single PostgreSQL instance and thought I was done. Then I started thinking — what if this scaled? What if 10,000 workers were searching simultaneously using the Haversine query I wrote? Suddenly that elegant SQL felt fragile.

The core of system design isn't memorizing CAP theorem or knowing when to use Kafka. It's about trade-offs. Every decision you make — SQL vs NoSQL, monolith vs microservices, sync vs async — has a cost on the other side. The best engineers aren't the ones who know all the patterns. They're the ones who can explain *why* they chose one over another given the constraints.

Start with the problem. What are the read/write ratios? What's the SLA? What breaks first under load? Work backwards from failure, not forwards from enthusiasm.

The boxes you draw don't matter. The reasoning behind them does.

A system that's "good enough" and ships is infinitely better than a perfect architecture that lives in a Notion doc. Design for today's load. Build extension points for tomorrow's. And never forget — the most expensive line in any distributed system is the one you added before you needed it.`,
  },
  {
    id: 2,
    number: '02',
    tag: 'AI / Prompting',
    title: 'Prompting Is a Skill, Not a Trick',
    summary: 'Most people treat prompts like Google searches. The ones who get real value treat them like conversations.',
    rating: 5,
    readTime: '3 min read',
    accent: '#60a5fa',
    content: `I used to type prompts like I was Googling. Short, vague, hoping the model would just figure it out. I'd get mediocre responses and blame the AI. Then I started treating it like briefing a smart colleague — and everything changed.

The model doesn't know your context unless you give it. It doesn't know you're a backend developer building a Spring Boot service for a multi-tenant SaaS. It doesn't know you want clean, production-ready code without unnecessary abstractions. It assumes the median case unless you tell it otherwise.

Here's what actually works: role + context + constraint + output format. "You are a senior Java engineer. I'm building a distributed SaaS with Spring Boot 3 and PostgreSQL. Generate a service layer for user onboarding that handles duplicate emails gracefully. Return only the service class, no explanation." That prompt gets you something you can actually use.

Chain your prompts. Start broad, then narrow. Ask it to critique its own output. Say "what edge cases did you miss?" The model is surprisingly good at catching its own blind spots when you ask directly.

And stop using prompts as a crutch for thinking. The best use of an AI prompt is to accelerate a decision you've already half-made in your head — not to outsource the thinking entirely. Use it to draft, validate, explore — not to replace the judgment that comes from actually building things.

Prompting well is a leverage multiplier. A bad prompt wastes a good model. A good prompt makes you dangerous.`,
  },
  {
    id: 3,
    number: '03',
    tag: 'Hardware / ML',
    title: 'CPU, GPU, TPU, NPU — What Actually Matters',
    summary: 'Four letters. Wildly different purposes. Here\'s how to think about them without the marketing noise.',
    rating: 4,
    readTime: '5 min read',
    accent: '#a78bfa',
    content: `Everyone's throwing these acronyms around and half the time they don't know what they mean past "GPU = fast for AI." Let me break it down in a way that actually sticks.

A CPU is a generalist. It's brilliant at sequential tasks, branching logic, OS management — anything that requires flexibility. Your Spring Boot server runs on a CPU. Your database query planner runs on a CPU. It's designed to handle one complex thing at a time, really well.

A GPU was built for graphics — rendering thousands of pixels in parallel. Then the ML world noticed something: training neural networks is just matrix multiplication at massive scale. The GPU's parallel architecture fits perfectly. So it got hijacked for AI. Today an NVIDIA A100 runs billions of floating-point operations per second. It's overkill for your laptop but essential for training LLMs.

A TPU (Tensor Processing Unit) is Google's custom silicon designed specifically for tensor operations — the math inside neural networks. It's even more specialized than a GPU. You can't run general code on it, but for training and inference on large models, it destroys everything else on throughput-per-watt.

An NPU (Neural Processing Unit) is what's showing up in phones and laptops now — Apple's Neural Engine, Qualcomm's AI Engine. It's a small, power-efficient chip that handles on-device inference. Running face unlock, voice detection, real-time translation — without draining your battery.

The pattern: the more specialized the chip, the faster and more efficient it is at its specific task — and the less flexible it becomes for everything else. Know your workload before picking your hardware.`,
  },
  {
    id: 4,
    number: '04',
    tag: 'Full-Stack',
    title: 'What "Full-Stack" Actually Means in 2025',
    summary: 'The title has been watered down. Here\'s what it really takes to own both ends of a production system.',
    rating: 4.5,
    readTime: '4 min read',
    accent: '#4ade80',
    content: `Full-stack used to mean HTML + PHP. Then it meant React + Node. Now it means something much heavier — and most people using the title aren't carrying the full weight of it.

A real full-stack developer in 2025 isn't just someone who can write a React component and a REST endpoint. It's someone who can reason about the entire system: database schema design, API contract design, frontend state management, auth flows, deployment pipelines, and observability.

When I built SQLPilot, I had to think about every layer. The Gemini AI integration on the backend. The JWT + role-based access. The Redis caching layer so we're not hammering the AI API on repeated queries. The React frontend with paginated history. The Docker container. The Render deployment. Netlify for the frontend. One person, every layer.

That's not a flex — that's what the job actually is when you're building solo or in a small team.

The trap most devs fall into is getting comfortable in one layer and pretending the other one doesn't exist. Frontend devs who've never thought about N+1 queries. Backend devs who ship APIs without thinking about the loading states they force on the UI. Both are half the picture.

The honest truth: being full-stack means being willing to be uncomfortable everywhere. You won't be the best at any one thing. But you'll be the person who can ship something real without waiting on anyone else. In a world of slow teams and long PR queues, that's genuinely powerful.`,
  },
  {
    id: 5,
    number: '05',
    tag: 'Career',
    title: 'FAANG Interviews Are a Game — Learn the Rules',
    summary: 'Talent alone won\'t get you in. You need to understand what they\'re actually testing for.',
    rating: 5,
    readTime: '5 min read',
    accent: '#fbbf24',
    content: `Here's the uncomfortable truth about FAANG interviews: they're not testing if you're a good engineer. They're testing if you can perform well on a specific type of problem, under time pressure, while narrating your thoughts out loud. Those are learnable skills.

The DSA round exists not because you'll be writing Dijkstra's at Google, but because it's a standardized filter. You learn the patterns — sliding window, two pointers, BFS/DFS, dynamic programming, heap problems — and then you drill them until they become reflexes. LeetCode medium is the bar. Hard problems are bonus.

But most people underestimate the system design round. This is where senior roles are won or lost. You need to be able to walk through — clearly and confidently — how you'd design something like a URL shortener, a notification service, or a ride-sharing backend. The interviewer wants to see how you think, how you handle ambiguity, and whether you understand trade-offs.

Behavioral rounds are underrated. STAR format isn't optional, it's mandatory. Have 6-8 stories ready that you can reshape for different questions. Conflict with a teammate. A project that failed. A time you pushed back on requirements. These stories need to sound natural, not rehearsed.

One thing nobody tells you: mock interviews are more valuable than solo practice. You can solve 300 LeetCode problems alone and still freeze when someone is watching. Practice performing, not just solving.

The game is learnable. The timeline is 3-6 months of focused prep. Don't let the mystique of these companies convince you it's out of reach. It's a skill set, and skill sets are buildable.`,
  },
  {
    id: 6,
    number: '06',
    tag: 'Dev Culture',
    title: 'Vibe Coding Will Break Your Production',
    summary: 'Shipping fast on vibes feels amazing — until 3am when the alerts start firing.',
    rating: 4,
    readTime: '3 min read',
    accent: '#f97316',
    content: `There's a certain energy you get when everything is flowing. The code is writing itself, the feature works on the first try, and you're pushing to main at midnight because you're in the zone. I've been there. It feels like flying.

And then, two weeks later, something breaks in a way you didn't expect. And you look at the code you wrote that night and it's confident, it's fast, and it has no error handling. No edge case coverage. A transaction that never rolls back. An async call with no timeout.

Vibe coding — shipping on momentum and intuition without slowing down to think — is genuinely fun and genuinely dangerous. The output looks clean. The logic is usually right for the happy path. But production isn't the happy path. Production is the user who uploads a 500MB file. The network timeout that happens once a week. The race condition that only appears under concurrent load.

The fix isn't to stop coding with energy. It's to add one ritual: after the vibe session, do a slow read. Go through every function you wrote and ask — what breaks this? What if the input is null? What if the DB call fails halfway? What if two users hit this endpoint at the same time?

I built a rule for myself: never push a vibe session to prod on the same day. Sleep on it. The confidence you felt at midnight looks different at 9am.

Stability isn't the opposite of speed. It's what lets you move fast without lying awake at night.`,
  },
  {
  id: 4,
  number: '04',
  tag: 'AI / Software',
  title: 'Vibe Coding Is Real — And It’s Changing Engineering',
  summary: 'Half the internet thinks AI will replace developers. The other half is shipping faster than ever with it.',
  rating: 5,
  readTime: '6 min read',
  accent: '#60a5fa',
  content: `A year ago people used AI for autocomplete. Today people are building entire SaaS products with a prompt window open 24/7.

The industry calls it "vibe coding" now — describing what you want in plain English and letting models generate massive chunks of the implementation. Sounds fake until you watch someone scaffold a React frontend, build APIs, write SQL migrations, configure Docker, and deploy to Vercel in a single afternoon.

But here's the thing nobody says loud enough: AI didn't remove engineering. It removed friction.

Good developers still win because they know architecture, debugging, scalability, edge cases, security, and product thinking. AI can generate code fast. It still struggles with system-level reasoning across large projects. That's where humans step in.

The dangerous part is beginners thinking generated code equals production-ready software. It doesn't. Most AI-generated apps collapse the second real users hit them. Memory leaks. Race conditions. Broken auth. Zero observability. No separation of concerns.

The developers growing fastest right now are the ones treating AI like a junior engineer that works insanely fast but needs supervision. They delegate repetitive implementation and spend more time on decisions that actually matter.

Coding is shifting from typing syntax to directing systems. The skill ceiling didn't disappear. It just moved upward.`
},
{
  id: 5,
  number: '05',
  tag: 'Cloud / Backend',
  title: 'Why Every Startup Suddenly Wants Microservices',
  summary: 'Spoiler: half of them absolutely should not.',
  rating: 4,
  readTime: '5 min read',
  accent: '#fb7185',
  content: `Somewhere along the way, microservices became a status symbol.

A startup with 3 developers and 200 users somehow ends up with 14 services, Kubernetes clusters, event buses, distributed tracing, and enough YAML to summon a demon. Meanwhile a monolith would've handled the workload perfectly.

Microservices solve a real problem: scale. Not just traffic scale — team scale. When dozens of teams work on independent domains, splitting systems makes coordination easier. Payments can evolve separately from notifications. Search can deploy independently from auth.

But distributed systems come with a tax.

Now your "simple API call" becomes network communication. Failures become unpredictable. Debugging requires tracing across services. Deployment pipelines multiply. Infrastructure costs rise. Local development becomes painful.

The irony? Companies like Amazon and Netflix earned microservices through years of scaling pain. Most modern startups copy the architecture before they copy the user growth.

A well-structured monolith is still one of the best ways to build software fast. Clean modular boundaries. Single deployment unit. Easier debugging. Lower operational complexity.

People underestimate how far a monolith can scale when engineered properly. Instagram handled millions of users with a surprisingly compact backend for years.

Architecture isn't about sounding advanced. It's about choosing the minimum complexity required for your current problem.`
},
{
  id: 6,
  number: '06',
  tag: 'Cybersecurity',
  title: 'The Scariest Hacker Isn’t Breaking In Anymore',
  summary: 'Modern attacks target humans first, systems second.',
  rating: 5,
  readTime: '6 min read',
  accent: '#f87171',
  content: `People imagine hackers as hoodie-wearing geniuses brute-forcing passwords in dark rooms. Reality is much less cinematic — and way more dangerous.

Most modern breaches start with social engineering.

A fake login page. A convincing email. A Slack message from "IT support." A deepfake voice call pretending to be a manager asking for credentials. The attack surface today isn't just software. It's human psychology.

AI made this worse fast.

Phishing emails used to be laughably bad. Broken grammar. Weird formatting. Now LLMs generate near-perfect corporate communication in seconds. Deepfake tools clone voices from minutes of audio. Scam operations became scalable.

The crazy part? Even highly technical people fall for these attacks under pressure. Because security failures usually happen when humans are distracted, rushed, or overloaded.

Meanwhile companies obsess over buying expensive security tools while ignoring basic operational hygiene: weak MFA policies, leaked API keys, exposed S3 buckets, reused passwords, unpatched dependencies.

Cybersecurity isn't one giant shield. It's layers.

Good security feels annoying. That's how you know it's working. Rate limits. Hardware keys. Approval flows. Session expiration. Audit logs. Least-privilege access. These tiny frictions stop catastrophic failures.

The future of security won't just be about stronger encryption. It'll be about designing systems that assume humans will eventually make mistakes.`
},
{
  id: 7,
  number: '07',
  tag: 'AI / Hardware',
  title: 'Why AI Companies Are Obsessed With Energy Now',
  summary: 'The next bottleneck in AI might not be intelligence. It might be electricity.',
  rating: 5,
  readTime: '5 min read',
  accent: '#34d399',
  content: `Training frontier AI models sounds futuristic until you look at the electricity bill.

Modern LLM training runs across thousands of GPUs simultaneously. Entire data centers consume insane amounts of power just to train one generation of models. Then comes inference — millions of users querying those models every day.

AI isn't just competing for better algorithms anymore. It's competing for energy infrastructure.

That's why companies are racing to build specialized chips, optimize inference engines, and reduce parameter inefficiencies. Every millisecond saved at scale becomes massive operational savings.

People think AI progress is only about bigger models. The real innovation now is efficiency.

Quantization. Sparse architectures. Mixture-of-experts systems. Better caching. Smaller distilled models. Engineers are trying to squeeze maximum intelligence out of minimum compute.

Even geopolitics entered the picture. Countries now treat semiconductor manufacturing like strategic infrastructure because advanced AI depends on advanced chips.

The fascinating shift is this: software companies are suddenly caring about physics.

Cooling systems matter. Power delivery matters. Chip fabrication matters. Data center geography matters. The future of AI won't just be decided by researchers. It'll also be shaped by whoever can sustain the compute required to run intelligence at planetary scale.`
},
{
  id: 8,
  number: '08',
  tag: 'Frontend / UX',
  title: 'People Don’t Want More Features Anymore',
  summary: 'Most apps are bloated. The winners now feel invisible.',
  rating: 4,
  readTime: '4 min read',
  accent: '#fbbf24',
  content: `For years the software industry treated feature count like a flex.

More integrations. More dashboards. More toggles. More AI buttons randomly glued onto interfaces. Somewhere along the way, apps became exhausting.

Now users are moving toward products that feel calm.

The best software today reduces cognitive load. Fast load times. Clear navigation. Predictable interactions. Minimal friction between intention and action.

That's why products like Notion, Linear, Raycast, Arc, and modern AI tools exploded. They're not necessarily simple under the hood — they're disciplined about what the user experiences.

Performance became part of UX too.

Nobody wants a web app consuming 2GB RAM just to open a settings page. Users subconsciously associate speed with quality. Tiny delays destroy trust faster than people realize.

The funniest part? Most product problems aren't technical limitations. They're prioritization failures. Teams keep shipping because they can, not because users need it.

Great UX design is subtraction.

Every unnecessary popup removed. Every click eliminated. Every confusing state simplified. The highest level of product design often looks deceptively obvious after it's done.

Good software feels effortless. That's incredibly hard to engineer.`
},
{
  id: 9,
  number: '09',
  tag: 'Future Tech',
  title: 'The Real Race in Tech Isn’t AI vs Humans',
  summary: 'It’s centralized platforms versus individual creators.',
  rating: 5,
  readTime: '6 min read',
  accent: '#818cf8',
  content: `Technology quietly shifted power back toward individuals.

One developer can now launch a global SaaS product. One creator can build a media company. One engineer with AI tools can outperform entire small teams from a few years ago.

The leverage is absurd.

Cloud infrastructure removed hardware barriers. Open-source removed knowledge barriers. AI is removing execution barriers. Distribution through social media removed marketing gatekeepers.

Which means the modern advantage isn't access anymore. It's clarity and consistency.

The people winning right now are combining multiple skills instead of specializing too narrowly. Coding + design. Engineering + storytelling. AI + product intuition. Technical depth + audience building.

Meanwhile giant platforms are fighting to stay dominant by locking ecosystems tighter — app stores, proprietary APIs, subscription ecosystems, cloud dependencies.

That's the hidden tension shaping the industry.

Independent builders want ownership and speed. Platforms want retention and control. AI accelerated both sides simultaneously.

The next generation of successful tech people probably won't fit traditional job titles cleanly. They'll build products, market them, automate workflows, design experiences, manage communities, and use AI as force multiplication across everything.

The line between developer, founder, creator, and operator is collapsing fast.`
}
];

// ─── STAR RATING ──────────────────────────────────────────────────────────────

const StarRating = ({ rating, size = 14 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = !filled && i === full && half;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
            {isHalf ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={`url(#half-${i})`}
                  stroke="#fbbf24"
                  strokeWidth="1"
                />
              </>
            ) : (
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={filled ? '#fbbf24' : 'rgba(255,255,255,0.08)'}
                stroke={filled ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
                strokeWidth="1"
              />
            )}
          </svg>
        );
      })}
      <span style={{
        marginLeft: '5px', fontSize: '0.7rem',
        fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.05em',
      }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// ─── BLOG CARD ────────────────────────────────────────────────────────────────

const BlogCard = ({ blog, index, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onClick(blog)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.018)',
        border: hovered
          ? `1px solid ${blog.accent}55`
          : '1px solid rgba(255,255,255,0.07)',
        padding: '1.75rem',
        cursor: 'pointer',
        transition: 'background 0.3s, border-color 0.3s, transform 0.3s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Accent line at top */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: hovered ? blog.accent : 'transparent',
        transition: 'background 0.3s',
      }} />

      {/* Watermark number */}
      <div style={{
        position: 'absolute',
        bottom: '-1rem', right: '1rem',
        fontSize: '6rem', fontWeight: 800,
        fontFamily: "'Open Sans', sans-serif",
        color: hovered ? `${blog.accent}08` : 'rgba(255,255,255,0.025)',
        lineHeight: 1, userSelect: 'none',
        letterSpacing: '-0.05em',
        transition: 'color 0.3s',
        pointerEvents: 'none',
      }}>
        {blog.number}
      </div>

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{
          fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase',
          fontFamily: 'monospace', color: blog.accent,
          border: `1px solid ${blog.accent}33`, padding: '3px 9px',
        }}>
          {blog.tag}
        </span>
        <span style={{
          fontSize: '0.65rem', fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em',
        }}>
          {blog.readTime}
        </span>
      </div>

      {/* Number + title */}
      <div>
        <div style={{
          fontSize: '0.65rem', fontFamily: 'monospace',
          color: hovered ? blog.accent : '#444',
          letterSpacing: '0.1em', marginBottom: '0.45rem',
          transition: 'color 0.3s',
        }}>
          {blog.number}
        </div>
        <h3 style={{
          margin: 0,
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          fontWeight: 400,
          color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
          fontFamily: "'Open Sans', sans-serif",
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          transition: 'color 0.3s',
        }}>
          {blog.title}
        </h3>
      </div>

      {/* Summary */}
      <p style={{
        margin: 0, fontSize: '0.86rem',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: "'Open Sans', sans-serif",
        lineHeight: 1.7,
        flex: 1,
      }}>
        {blog.summary}
      </p>

      {/* Footer: stars + read more */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', paddingTop: '0.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <StarRating rating={blog.rating} />
        <span style={{
          fontSize: '0.72rem', fontFamily: 'monospace',
          color: hovered ? blog.accent : 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}>
          Read →
        </span>
      </div>
    </motion.div>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────

const BlogModal = ({ blog, onClose }) => {
  if (!blog) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#0f0f0f',
            border: `1px solid ${blog.accent}33`,
            maxWidth: '680px',
            width: '100%',
            maxHeight: '88vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: `0 0 80px ${blog.accent}15, 0 32px 64px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Accent top bar */}
          <div style={{
            height: '3px',
            background: `linear-gradient(90deg, ${blog.accent}, transparent)`,
          }} />

          <Helmet>
  <title>Insights | By Rohit Suthar</title>
  <meta name="description" content="Honest takes on system design, AI prompting, hardware, full-stack engineering, and FAANG interview prep — by Rohit Suthar." />
  <meta name="author" content="Rohit Suthar" />
  <meta property="og:title" content="Insights | By Rohit Suthar" />
  <meta property="og:description" content="Honest takes on system design, AI prompting, hardware, full-stack engineering, and FAANG interview prep." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Insights | By Rohit Suthar" />
  <meta name="twitter:description" content="Honest takes on system design, AI prompting, hardware, full-stack engineering, and FAANG interview prep." />
</Helmet>

          <div style={{ padding: '2rem 2.5rem 2.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                    fontFamily: 'monospace', color: blog.accent,
                    border: `1px solid ${blog.accent}44`, padding: '3px 9px',
                  }}>
                    {blog.tag}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em',
                  }}>
                    {blog.readTime}
                  </span>
                </div>
                <h2 style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                  fontWeight: 300,
                  color: '#fff',
                  fontFamily: "'Open Sans', sans-serif",
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                }}>
                  {blog.title}
                </h2>
                <StarRating rating={blog.rating} size={16} />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  width: '2.2rem', height: '2.2rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                  lineHeight: 1,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#ff3333';
                  e.currentTarget.style.color = '#ff3333';
                  e.currentTarget.style.background = 'rgba(255,51,51,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: `linear-gradient(90deg, ${blog.accent}44, transparent)`,
              marginBottom: '1.75rem',
            }} />

            {/* Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {blog.content.split('\n\n').map((para, i) => (
                <p key={i} style={{
                  margin: 0,
                  fontSize: '0.96rem',
                  color: 'rgba(255,255,255,0.72)',
                  fontFamily: "'Open Sans', sans-serif",
                  lineHeight: 1.85,
                  letterSpacing: '0.01em',
                }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <span style={{
                fontSize: '0.7rem', fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                {blog.number} / 06 — Insights by Rohit
              </span>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.45)',
                  padding: '0.45rem 1.1rem',
                  fontFamily: 'monospace', fontSize: '0.75rem',
                  letterSpacing: '0.1em', cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                Close ×
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Insights() {
  const [activeBlog, setActiveBlog] = useState(null);

  return (
    <section style={{
      minHeight: '100vh',
      width: '100%',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: "'Open Sans', sans-serif",
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
      <Helmet>
        <title>Insights | Rohit Suthar</title>
        <meta name="description" content="Thoughts on system design, AI prompting, hardware, full-stack engineering, and FAANG interview prep by Rohit Suthar." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@200;300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
        ::selection { background: rgba(255,51,51,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 3rem) 5rem',
      }}>

        {/* Back */}
        <motion.a
          href="/"
          whileHover={{ x: -3 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '2rem',
            color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
            fontSize: '0.82rem', fontFamily: 'monospace', letterSpacing: '0.14em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
        >
          ← Back to Home
        </motion.a>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          <div style={{
            fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase',
            color: '#555', fontFamily: 'monospace', marginBottom: '0.85rem',
          }}>
            Insights — {String(blogs.length).padStart(2, '0')} Essays
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 200,
            letterSpacing: '-0.03em',
            color: '#fff',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: 1.1,
          }}>
            Things Worth Writing Down
          </h1>
          <p style={{
            margin: '1rem 0 0',
            fontSize: '0.92rem',
            color: 'rgba(255,255,255,0.38)',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
            maxWidth: '480px',
            lineHeight: 1.7,
          }}>
            No tutorials. No listicles. Just honest takes on the craft of building software.
          </p>
        </motion.div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: '1.25rem',
        }}>
          {blogs.map((blog, i) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              index={i}
              onClick={setActiveBlog}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeBlog && (
          <BlogModal blog={activeBlog} onClose={() => setActiveBlog(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}