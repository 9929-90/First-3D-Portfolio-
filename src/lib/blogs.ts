/* ─────────────────────────────────────────────────────────────
   BLOG ARTICLES — full content extracted verbatim from the
   original portfolio source (12 articles, unchanged).
   Rendered by components/portfolio/ArticleReader.tsx
   ───────────────────────────────────────────────────────────── */

export interface Blog {
  id: number;
  number: string;
  tag: string;
  title: string;
  summary: string;
  readTime: string;
  content: string;
}

export const BLOGS: Blog[] = [
  {
    "id": 1,
    "number": "01",
    "tag": "Architecture",
    "title": "Why System Design Still Humbles Me",
    "summary": "System design isn't just about drawing boxes. It's about making decisions under incomplete information.",
    "readTime": "4 min read",
    "content": "There's a moment in every system design interview — or in every real project — where you realize you've been thinking too small. You sketch a box that says \"database\" and someone asks: \"What happens when it gets 10 million writes a day?\" That pause? That's where real engineering lives.\n\nSystem design humbled me early. I built AapnoKaam with a single PostgreSQL instance and thought I was done. Then I started thinking — what if this scaled? What if 10,000 workers were searching simultaneously using the Haversine query I wrote? Suddenly that elegant SQL felt fragile.\n\nThe core of system design isn't memorizing CAP theorem or knowing when to use Kafka. It's about trade-offs. Every decision you make — SQL vs NoSQL, monolith vs microservices, sync vs async — has a cost on the other side. The best engineers aren't the ones who know all the patterns. They're the ones who can explain *why* they chose one over another given the constraints.\n\nStart with the problem. What are the read/write ratios? What's the SLA? What breaks first under load? Work backwards from failure, not forwards from enthusiasm.\n\nThe boxes you draw don't matter. The reasoning behind them does.\n\nA system that's \"good enough\" and ships is infinitely better than a perfect architecture that lives in a Notion doc. Design for today's load. Build extension points for tomorrow's. And never forget — the most expensive line in any distributed system is the one you added before you needed it."
  },
  {
    "id": 2,
    "number": "02",
    "tag": "AI / Prompting",
    "title": "Prompting Is a Skill, Not a Trick",
    "summary": "Most people treat prompts like Google searches. The ones who get real value treat them like conversations.",
    "readTime": "3 min read",
    "content": "I used to type prompts like I was Googling. Short, vague, hoping the model would just figure it out. I'd get mediocre responses and blame the AI. Then I started treating it like briefing a smart colleague — and everything changed.\n\nThe model doesn't know your context unless you give it. It doesn't know you're a backend developer building a Spring Boot service for a multi-tenant SaaS. It doesn't know you want clean, production-ready code without unnecessary abstractions. It assumes the median case unless you tell it otherwise.\n\nHere's what actually works: role + context + constraint + output format. \"You are a senior Java engineer. I'm building a distributed SaaS with Spring Boot 3 and PostgreSQL. Generate a service layer for user onboarding that handles duplicate emails gracefully. Return only the service class, no explanation.\" That prompt gets you something you can actually use.\n\nChain your prompts. Start broad, then narrow. Ask it to critique its own output. Say \"what edge cases did you miss?\" The model is surprisingly good at catching its own blind spots when you ask directly.\n\nAnd stop using prompts as a crutch for thinking. The best use of an AI prompt is to accelerate a decision you've already half-made in your head — not to outsource the thinking entirely. Use it to draft, validate, explore — not to replace the judgment that comes from actually building things.\n\nPrompting well is a leverage multiplier. A bad prompt wastes a good model. A good prompt makes you dangerous."
  },
  {
    "id": 3,
    "number": "03",
    "tag": "Hardware / ML",
    "title": "CPU, GPU, TPU, NPU — What Actually Matters",
    "summary": "Four letters. Wildly different purposes. Here's how to think about them without the marketing noise.",
    "readTime": "5 min read",
    "content": "Everyone's throwing these acronyms around and half the time they don't know what they mean past \"GPU = fast for AI.\" Let me break it down in a way that actually sticks.\n\nA CPU is a generalist. It's brilliant at sequential tasks, branching logic, OS management — anything that requires flexibility. Your Spring Boot server runs on a CPU. Your database query planner runs on a CPU. It's designed to handle one complex thing at a time, really well.\n\nA GPU was built for graphics — rendering thousands of pixels in parallel. Then the ML world noticed something: training neural networks is just matrix multiplication at massive scale. The GPU's parallel architecture fits perfectly. So it got hijacked for AI. Today an NVIDIA A100 runs billions of floating-point operations per second. It's overkill for your laptop but essential for training LLMs.\n\nA TPU (Tensor Processing Unit) is Google's custom silicon designed specifically for tensor operations — the math inside neural networks. It's even more specialized than a GPU. You can't run general code on it, but for training and inference on large models, it destroys everything else on throughput-per-watt.\n\nAn NPU (Neural Processing Unit) is what's showing up in phones and laptops now — Apple's Neural Engine, Qualcomm's AI Engine. It's a small, power-efficient chip that handles on-device inference. Running face unlock, voice detection, real-time translation — without draining your battery.\n\nThe pattern: the more specialized the chip, the faster and more efficient it is at its specific task — and the less flexible it becomes for everything else. Know your workload before picking your hardware."
  },
  {
    "id": 4,
    "number": "04",
    "tag": "Full-Stack",
    "title": "What \"Full-Stack\" Actually Means in 2025",
    "summary": "The title has been watered down. Here's what it really takes to own both ends of a production system.",
    "readTime": "4 min read",
    "content": "Full-stack used to mean HTML + PHP. Then it meant React + Node. Now it means something much heavier — and most people using the title aren't carrying the full weight of it.\n\nA real full-stack developer in 2025 isn't just someone who can write a React component and a REST endpoint. It's someone who can reason about the entire system: database schema design, API contract design, frontend state management, auth flows, deployment pipelines, and observability.\n\nWhen I built SQLPilot, I had to think about every layer. The Gemini AI integration on the backend. The JWT + role-based access. The Redis caching layer so we're not hammering the AI API on repeated queries. The React frontend with paginated history. The Docker container. The Render deployment. Netlify for the frontend. One person, every layer.\n\nThat's not a flex — that's what the job actually is when you're building solo or in a small team.\n\nThe trap most devs fall into is getting comfortable in one layer and pretending the other one doesn't exist. Frontend devs who've never thought about N+1 queries. Backend devs who ship APIs without thinking about the loading states they force on the UI. Both are half the picture.\n\nThe honest truth: being full-stack means being willing to be uncomfortable everywhere. You won't be the best at any one thing. But you'll be the person who can ship something real without waiting on anyone else. In a world of slow teams and long PR queues, that's genuinely powerful."
  },
  {
    "id": 5,
    "number": "05",
    "tag": "Career",
    "title": "FAANG Interviews Are a Game — Learn the Rules",
    "summary": "Talent alone won't get you in. You need to understand what they're actually testing for.",
    "readTime": "5 min read",
    "content": "Here's the uncomfortable truth about FAANG interviews: they're not testing if you're a good engineer. They're testing if you can perform well on a specific type of problem, under time pressure, while narrating your thoughts out loud. Those are learnable skills.\n\nThe DSA round exists not because you'll be writing Dijkstra's at Google, but because it's a standardized filter. You learn the patterns — sliding window, two pointers, BFS/DFS, dynamic programming, heap problems — and then you drill them until they become reflexes. LeetCode medium is the bar. Hard problems are bonus.\n\nBut most people underestimate the system design round. This is where senior roles are won or lost. You need to be able to walk through — clearly and confidently — how you'd design something like a URL shortener, a notification service, or a ride-sharing backend. The interviewer wants to see how you think, how you handle ambiguity, and whether you understand trade-offs.\n\nBehavioral rounds are underrated. STAR format isn't optional, it's mandatory. Have 6-8 stories ready that you can reshape for different questions. Conflict with a teammate. A project that failed. A time you pushed back on requirements. These stories need to sound natural, not rehearsed.\n\nOne thing nobody tells you: mock interviews are more valuable than solo practice. You can solve 300 LeetCode problems alone and still freeze when someone is watching. Practice performing, not just solving.\n\nThe game is learnable. The timeline is 3-6 months of focused prep. Don't let the mystique of these companies convince you it's out of reach. It's a skill set, and skill sets are buildable."
  },
  {
    "id": 6,
    "number": "06",
    "tag": "Dev Culture",
    "title": "Vibe Coding Will Break Your Production",
    "summary": "Shipping fast on vibes feels amazing — until 3am when the alerts start firing.",
    "readTime": "3 min read",
    "content": "There's a certain energy you get when everything is flowing. The code is writing itself, the feature works on the first try, and you're pushing to main at midnight because you're in the zone. I've been there. It feels like flying.\n\nAnd then, two weeks later, something breaks in a way you didn't expect. And you look at the code you wrote that night and it's confident, it's fast, and it has no error handling. No edge case coverage. A transaction that never rolls back. An async call with no timeout.\n\nVibe coding — shipping on momentum and intuition without slowing down to think — is genuinely fun and genuinely dangerous. The output looks clean. The logic is usually right for the happy path. But production isn't the happy path. Production is the user who uploads a 500MB file. The network timeout that happens once a week. The race condition that only appears under concurrent load.\n\nThe fix isn't to stop coding with energy. It's to add one ritual: after the vibe session, do a slow read. Go through every function you wrote and ask — what breaks this? What if the input is null? What if the DB call fails halfway? What if two users hit this endpoint at the same time?\n\nI built a rule for myself: never push a vibe session to prod on the same day. Sleep on it. The confidence you felt at midnight looks different at 9am.\n\nStability isn't the opposite of speed. It's what lets you move fast without lying awake at night."
  },
  {
    "id": 4,
    "number": "04",
    "tag": "AI / Software",
    "title": "Vibe Coding Is Real — And It’s Changing Engineering",
    "summary": "Half the internet thinks AI will replace developers. The other half is shipping faster than ever with it.",
    "readTime": "6 min read",
    "content": "A year ago people used AI for autocomplete. Today people are building entire SaaS products with a prompt window open 24/7.\n\nThe industry calls it \"vibe coding\" now — describing what you want in plain English and letting models generate massive chunks of the implementation. Sounds fake until you watch someone scaffold a React frontend, build APIs, write SQL migrations, configure Docker, and deploy to Vercel in a single afternoon.\n\nBut here's the thing nobody says loud enough: AI didn't remove engineering. It removed friction.\n\nGood developers still win because they know architecture, debugging, scalability, edge cases, security, and product thinking. AI can generate code fast. It still struggles with system-level reasoning across large projects. That's where humans step in.\n\nThe dangerous part is beginners thinking generated code equals production-ready software. It doesn't. Most AI-generated apps collapse the second real users hit them. Memory leaks. Race conditions. Broken auth. Zero observability. No separation of concerns.\n\nThe developers growing fastest right now are the ones treating AI like a junior engineer that works insanely fast but needs supervision. They delegate repetitive implementation and spend more time on decisions that actually matter.\n\nCoding is shifting from typing syntax to directing systems. The skill ceiling didn't disappear. It just moved upward."
  },
  {
    "id": 5,
    "number": "05",
    "tag": "Cloud / Backend",
    "title": "Why Every Startup Suddenly Wants Microservices",
    "summary": "Spoiler: half of them absolutely should not.",
    "readTime": "5 min read",
    "content": "Somewhere along the way, microservices became a status symbol.\n\nA startup with 3 developers and 200 users somehow ends up with 14 services, Kubernetes clusters, event buses, distributed tracing, and enough YAML to summon a demon. Meanwhile a monolith would've handled the workload perfectly.\n\nMicroservices solve a real problem: scale. Not just traffic scale — team scale. When dozens of teams work on independent domains, splitting systems makes coordination easier. Payments can evolve separately from notifications. Search can deploy independently from auth.\n\nBut distributed systems come with a tax.\n\nNow your \"simple API call\" becomes network communication. Failures become unpredictable. Debugging requires tracing across services. Deployment pipelines multiply. Infrastructure costs rise. Local development becomes painful.\n\nThe irony? Companies like Amazon and Netflix earned microservices through years of scaling pain. Most modern startups copy the architecture before they copy the user growth.\n\nA well-structured monolith is still one of the best ways to build software fast. Clean modular boundaries. Single deployment unit. Easier debugging. Lower operational complexity.\n\nPeople underestimate how far a monolith can scale when engineered properly. Instagram handled millions of users with a surprisingly compact backend for years.\n\nArchitecture isn't about sounding advanced. It's about choosing the minimum complexity required for your current problem."
  },
  {
    "id": 6,
    "number": "06",
    "tag": "Cybersecurity",
    "title": "The Scariest Hacker Isn’t Breaking In Anymore",
    "summary": "Modern attacks target humans first, systems second.",
    "readTime": "6 min read",
    "content": "People imagine hackers as hoodie-wearing geniuses brute-forcing passwords in dark rooms. Reality is much less cinematic — and way more dangerous.\n\nMost modern breaches start with social engineering.\n\nA fake login page. A convincing email. A Slack message from \"IT support.\" A deepfake voice call pretending to be a manager asking for credentials. The attack surface today isn't just software. It's human psychology.\n\nAI made this worse fast.\n\nPhishing emails used to be laughably bad. Broken grammar. Weird formatting. Now LLMs generate near-perfect corporate communication in seconds. Deepfake tools clone voices from minutes of audio. Scam operations became scalable.\n\nThe crazy part? Even highly technical people fall for these attacks under pressure. Because security failures usually happen when humans are distracted, rushed, or overloaded.\n\nMeanwhile companies obsess over buying expensive security tools while ignoring basic operational hygiene: weak MFA policies, leaked API keys, exposed S3 buckets, reused passwords, unpatched dependencies.\n\nCybersecurity isn't one giant shield. It's layers.\n\nGood security feels annoying. That's how you know it's working. Rate limits. Hardware keys. Approval flows. Session expiration. Audit logs. Least-privilege access. These tiny frictions stop catastrophic failures.\n\nThe future of security won't just be about stronger encryption. It'll be about designing systems that assume humans will eventually make mistakes."
  },
  {
    "id": 7,
    "number": "07",
    "tag": "AI / Hardware",
    "title": "Why AI Companies Are Obsessed With Energy Now",
    "summary": "The next bottleneck in AI might not be intelligence. It might be electricity.",
    "readTime": "5 min read",
    "content": "Training frontier AI models sounds futuristic until you look at the electricity bill.\n\nModern LLM training runs across thousands of GPUs simultaneously. Entire data centers consume insane amounts of power just to train one generation of models. Then comes inference — millions of users querying those models every day.\n\nAI isn't just competing for better algorithms anymore. It's competing for energy infrastructure.\n\nThat's why companies are racing to build specialized chips, optimize inference engines, and reduce parameter inefficiencies. Every millisecond saved at scale becomes massive operational savings.\n\nPeople think AI progress is only about bigger models. The real innovation now is efficiency.\n\nQuantization. Sparse architectures. Mixture-of-experts systems. Better caching. Smaller distilled models. Engineers are trying to squeeze maximum intelligence out of minimum compute.\n\nEven geopolitics entered the picture. Countries now treat semiconductor manufacturing like strategic infrastructure because advanced AI depends on advanced chips.\n\nThe fascinating shift is this: software companies are suddenly caring about physics.\n\nCooling systems matter. Power delivery matters. Chip fabrication matters. Data center geography matters. The future of AI won't just be decided by researchers. It'll also be shaped by whoever can sustain the compute required to run intelligence at planetary scale."
  },
  {
    "id": 8,
    "number": "08",
    "tag": "Frontend / UX",
    "title": "People Don’t Want More Features Anymore",
    "summary": "Most apps are bloated. The winners now feel invisible.",
    "readTime": "4 min read",
    "content": "For years the software industry treated feature count like a flex.\n\nMore integrations. More dashboards. More toggles. More AI buttons randomly glued onto interfaces. Somewhere along the way, apps became exhausting.\n\nNow users are moving toward products that feel calm.\n\nThe best software today reduces cognitive load. Fast load times. Clear navigation. Predictable interactions. Minimal friction between intention and action.\n\nThat's why products like Notion, Linear, Raycast, Arc, and modern AI tools exploded. They're not necessarily simple under the hood — they're disciplined about what the user experiences.\n\nPerformance became part of UX too.\n\nNobody wants a web app consuming 2GB RAM just to open a settings page. Users subconsciously associate speed with quality. Tiny delays destroy trust faster than people realize.\n\nThe funniest part? Most product problems aren't technical limitations. They're prioritization failures. Teams keep shipping because they can, not because users need it.\n\nGreat UX design is subtraction.\n\nEvery unnecessary popup removed. Every click eliminated. Every confusing state simplified. The highest level of product design often looks deceptively obvious after it's done.\n\nGood software feels effortless. That's incredibly hard to engineer."
  },
  {
    "id": 9,
    "number": "09",
    "tag": "Future Tech",
    "title": "The Real Race in Tech Isn’t AI vs Humans",
    "summary": "It’s centralized platforms versus individual creators.",
    "readTime": "6 min read",
    "content": "Technology quietly shifted power back toward individuals.\n\nOne developer can now launch a global SaaS product. One creator can build a media company. One engineer with AI tools can outperform entire small teams from a few years ago.\n\nThe leverage is absurd.\n\nCloud infrastructure removed hardware barriers. Open-source removed knowledge barriers. AI is removing execution barriers. Distribution through social media removed marketing gatekeepers.\n\nWhich means the modern advantage isn't access anymore. It's clarity and consistency.\n\nThe people winning right now are combining multiple skills instead of specializing too narrowly. Coding + design. Engineering + storytelling. AI + product intuition. Technical depth + audience building.\n\nMeanwhile giant platforms are fighting to stay dominant by locking ecosystems tighter — app stores, proprietary APIs, subscription ecosystems, cloud dependencies.\n\nThat's the hidden tension shaping the industry.\n\nIndependent builders want ownership and speed. Platforms want retention and control. AI accelerated both sides simultaneously.\n\nThe next generation of successful tech people probably won't fit traditional job titles cleanly. They'll build products, market them, automate workflows, design experiences, manage communities, and use AI as force multiplication across everything.\n\nThe line between developer, founder, creator, and operator is collapsing fast."
  }
];
