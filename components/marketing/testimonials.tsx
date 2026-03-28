"use client";
import React from "react";

interface Testimonial {
  quote: string;
  role: string;
  context?: string;
}

const testimonials: Testimonial[] = [
  // Government clients
  {
    quote: "The input I have seen is great and helpful for me to open up discussions with my DG. The engagement process was extremely productive and impactful.",
    role: "Director, Program Operations Branch",
    context: "Employment & Social Development Canada · Government of Canada",
  },
  {
    quote: "The foresight work gave us a vocabulary for decisions we didn't know how to frame. That clarity was the most valuable deliverable.",
    role: "Executive Director, Strategic Planning",
    context: "Environment & Climate Change Canada · Government of Canada",
  },
  {
    quote: "Working with Dauntless completely changed how our team thinks about process. We came in with a problem and left with a system that runs itself.",
    role: "Director General, Policy & Program Design",
    context: "Treasury Board Secretariat · Government of Canada",
  },

  // AI Literacy Program participants
  {
    quote: "The Program was an eye-opening experience that provided valuable insights into the potential of AI to augment various processes and act as a collaborative partner in our work.",
    role: "Program Participant",
    context: "AI Literacy Program",
  },
  {
    quote: "Participating in the Program has been a transformative experience. As a professional, I approached AI with both curiosity and caution — but the Program struck the perfect balance between strategic experimentation and responsible innovation. I now use AI in my daily practice to accelerate research, streamline routine tasks, and explore new ways of delivering value to clients — without compromising on ethics, quality, human touch or judgment.",
    role: "Legal Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program exceeded all expectations! The depth and breadth of the program is truly impressive. Be prepared to think deeply and quickly. Be prepared for learning, doing, building, and collaborating. These two weeks have been life-changing. The Program helped me upgrade my way of thinking, upskill for the age of AI, and empowered me to lead change.",
    role: "Operations Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The instructor's passion, energy and knowledge in the full two-week syllabus was uncanny. The ability to blend and drive home the importance of the Human at the center of a great AI Champion was spot on. The Program is truly creating an army of Elite AI Operators that are on the frontlines of creating the future.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "This is an incredible initiative. I leave this intense two-week workshop with a mind full of ideas, a wealth of new knowledge and an excited mindset for what the next few years hold. It is more than just learning how AI works — it is crafting leaders with innovation mindsets, and elevating us to be able to make a difference.",
    role: "Risk Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "Amazing program! Having used AI fairly extensively before attending, I was worried this program would be too limited in value for me. I was completely wrong! The training of concepts related to Systems Thinking, Design Thinking, Ethics in AI, and Change Management have opened my eyes on how to organize, plan and pitch AI enhancements. I feel more energized and anxious to get down to work on these workflow enhancements than anything work-related in quite some time.",
    role: "Procurement Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program has been an eye-opening experience. It's not just about learning how to use AI but about understanding how to adapt, lead, and collaborate in an AI-driven world. It gave me practical tools and a fresh perspective on how AI can transform our work while staying grounded in ethical practices and human connection.",
    role: "Assurance Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program has revolutionized my learning experience through its innovative approach to professional development. The experience points system adds an exciting gamification element, squad missions promote valuable collaborative learning, and the level progression system provides a clear sense of achievement. It's not just a learning opportunity — it's an opportunity for professional growth, networking, and collaboration.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "This journey hasn't just equipped me with technical skills; it's fundamentally shifted my perspective on how we can harmoniously blend human expertise with AI capabilities to deliver exceptional client service while staying true to our core business values.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "This program has been an incredible learning experience. The potential that AI integration has in terms of efficiency, cost/time savings, enhanced learning and development for staff, and the ability to leverage AI to help staff undertake tasks well above their current complexity level has been eye opening. The instructor is an amazing teacher, keeping us all engaged, provoking critical thinking.",
    role: "Assurance Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program is comprehensive, covering from foundational concepts to advanced techniques. The group and hands-on sessions allowed me to practice what I learned immediately and share experience with members from different service lines. I highly recommend joining the Program to be ready for challenging AI projects and bring innovative contribution to your field.",
    role: "Assurance Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The instructor reinforced the importance of using AI to augment our workflows in the exponential age. The frameworks taught — such as Systems Thinking and Mental Models — provided me with immense clarity on how to create a firm-wide strategy. The course also offered a great opportunity to build my internal network across different service lines.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program has transformed the way I approach problems in my professional and personal life. The topics covered allowed me to gain comfort over using AI and new technologies, which I used to be intimidated by. I would recommend this course for anyone who has an interest in using new tools and finding efficient solutions to common problems.",
    role: "Assurance Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "My journey started as an exciting way to explore AI, but it quickly became a transformative experience. Prompt engineering became a key strength for me, and I saw how collaborating with AI enhanced my projects. I now have the confidence and expertise to support our organization's AI transformation.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "I joined the Program to explore AI-driven solutions that could automate my tasks. What I discovered was far more — I found a community of innovators across different service lines, all learning together and inspiring one another. My perspective has broadened beyond my immediate tasks, and I'm now thinking about how to create value by integrating multiple service areas.",
    role: "Accounting Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program gave me an entirely new perspective on how to approach challenges within my role. The Program introduced me to concepts and tools that make it easier to achieve both efficiency and effectiveness. Overall, this was an extremely valuable experience, and I would recommend it to anyone looking to enhance their skills.",
    role: "Finance Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program is a well-designed, high-impact experience. What stood out most was its strong human focus — it goes beyond the mechanics of change to emphasize how to lead it with empathy and clarity. It offered both practical tools and meaningful reflection, making it a truly valuable learning journey.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The instructor effectively communicated, demonstrated and facilitated the program. My experience was transformative, where I was able to consider my role in adopting AI technology to improve our ability to deliver value effectively to clients.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "Having the time available to collaborate with a wide range of future leaders on the future of the business has been invigorating and eye opening.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program was an awesome experience. Prior to the course I had been confident with using AI and thought I was aware of most features, however, I learned so much more after completing this course!",
    role: "HR Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "Eye opening if I had to sum it up. It redefined how I see our current processes and transformed how I view things outside of work as well. After taking this course — especially the session when we broke down workflows — you realize how much AI can be integrated into process and how inefficient our current processes are.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "Really grateful I was able to be a part of the Program. It definitely lived up to the hype and I would recommend anyone given the opportunity takes it. Programs like this are what keep me excited to come to work.",
    role: "HR Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "I came into the Program having used AI but never fully trusting it. The sessions surprised me in the most positive way. It was less about learning new things and more about re-thinking my entire job. I feel the mentality around AI that I gained in this program is something I will be able to carry with me for the rest of my career if not life.",
    role: "Accounting Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program was a powerful experience that helped us think boldly about what's possible while staying true to our values. Our team left with stronger alignment, renewed energy, and a shared vision for the future. I would highly recommend the Program to any organization seeking innovative and practical ways to prepare for what's ahead.",
    role: "Risk Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program has been incredibly valuable to me. I've realized that not knowing something is no longer a limitation. I've learned practical ways to apply AI in my day-to-day work and discovered new opportunities to improve my performance. In the past, I would spend hours researching to skill up — now we have a digital companion that helps us work exponentially better.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "Literally an eye opener on what we can achieve with AI when properly incorporated in our work.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "AI is not a cost, it is a multiplier. It multiplies what our people can do, the speed at which we can deliver, and the value we create for clients. The Program transforms participants into influential change agents who can harness AI to enhance efficiency, creativity, and client value while maintaining ethical standards.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "This was such a great mental reset for me. I was getting frustrated with inefficiencies and in the last week I've already designed multiple AI tools to solve some of the issues. I can only imagine what I will be able to do over time. The ideas shared in the course were wonderful.",
    role: "Accounting Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "This program helped me to understand how AI can be used productively in business environments and reassured me of the human value necessary to use it properly.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program was eye opening as it made me start thinking of AI usage not just as a tool to make the current way of doing things easier, but as a tool that can be used to develop new insights and new value creation opportunities.",
    role: "Finance Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program was an incredible opportunity to truly immerse ourselves in learning about AI. What stood out most was discovering the exponential value that emerges when we combine ourselves as the use case with AI to build solutions for our teams. Equally meaningful was collaborating with colleagues I wouldn't normally work with.",
    role: "Advisory Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "One of the best courses I've taken in my career. The Program is a thoughtful and inspiring culmination of future-forward thinking, practical AI skills, and team development. I learned way more than just AI skills. A true way to show employees they're valued and empowered to make changes for a better working future!",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program has been a truly transformational experience. I gained new ways of thinking — especially systems thinking and design thinking — and learned how to use them to identify AI-integration opportunities across an entire workflow. I'm walking away feeling far more prepared to lead my practice group and drive impact that extends well beyond my immediate team.",
    role: "Learning & Development Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program bridged the gap between understanding AI's technical potential and leading its practical integration into complex advisory work. By grounding AI learning in systems thinking and design thinking, the Program moved me beyond theory into building solutions that create tangible business value.",
    role: "HR Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "It was fun, engaging, and a massively helpful program. I think it is critical that it continues and more people experience it. I am confident that it will result in a great ROI. It really feels like we've been given super powers.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program left me energized, aligned, and genuinely excited about what's possible. It gave me a strategic lens, a concrete roadmap, and the confidence to help drive meaningful change within my practice. This wasn't just a workshop; it was a catalyst.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program was a great hands-on experience that showed me how AI can make work smoother, faster, and more meaningful. The sessions were practical, collaborative, and full of insights I could use right away. They helped our team rethink how we work, sparked new ideas, and made innovation feel accessible to everyone.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "When I began this journey, I was the person in the room who felt the least confident about AI. Today, I stand transformed — confident, inspired, and genuinely excited about the future. The Program didn't just teach me about AI tools; it fundamentally changed how I view my role as a professional and leader. The tools amplify our existing expertise rather than replace it, and this insight was incredibly liberating.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "This course was great — so much more than just learning how to use AI tools. We developed critical thinking skills and learned how to apply professional judgement alongside AI.",
    role: "Assurance Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program fundamentally changed my approach to AI implementation. Seminars on change management and stakeholder engagement equipped me with methods to address leadership concerns about ROI, navigate team resistance during workflow transitions, and build evidence-based cases for scaling AI tools. Effective AI adoption requires equal attention to technical implementation and human factors.",
    role: "Tax Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "The Program didn't just teach me something, it rewired me. It flipped a switch I didn't know existed and showed me what our organization could become if we stopped whispering innovation and started shouting it. The Program was the first experience that made me feel like an innovator, not a passenger. AI is not a tool, it's a superpower.",
    role: "IT Professional",
    context: "AI Literacy Program",
  },
  {
    quote: "This program has been great in familiarizing us with AI — certainly feel a lot more competent and comfortable using AI. Overall, noticing a shift in my approach to solving problems.",
    role: "Assurance Professional",
    context: "AI Literacy Program",
  },
];

// Duplicate for seamless loop
const track = [...testimonials, ...testimonials];

export function Testimonials() {
  return (
    <section className="relative bg-[--mkt-bg] py-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.07) 0%, transparent 65%)" }}
        />
      </div>

      {/* Header */}
      <div className="relative text-center mb-10 px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">What Clients Say</p>
      </div>

      {/* Scrolling track */}
      <div className="relative w-full select-none">
        {/* Fade masks */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to right, var(--mkt-bg), transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to left, var(--mkt-bg), transparent)" }}
        />

        <div
          className="flex items-stretch gap-5"
          style={{
            animation: "testimonial-scroll 400s linear infinite",
            width: "max-content",
          }}
        >
          {track.map((t, i) => (
            <TestimonialCard key={`${t.role}-${i}`} testimonial={t} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes testimonial-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div
      className="shrink-0 w-[360px] rounded-2xl p-7 flex flex-col gap-4"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(16,16,30,0.9) 50%, rgba(109,40,217,0.08) 100%)",
        border: "1px solid rgba(139,92,246,0.18)",
        boxShadow: "0 8px 24px -6px rgba(0,0,0,0.4)",
      }}
    >
      {/* Quote mark */}
      <div
        className="text-5xl leading-none font-bold select-none opacity-[0.15]"
        style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #a78bfa)", WebkitBackgroundClip: "text", color: "transparent" }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      {/* Quote text */}
      <blockquote className="text-sm text-[--text-primary] leading-relaxed italic flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Attribution */}
      <div className="space-y-0.5 border-t border-[rgba(139,92,246,0.15)] pt-4">
        <p className="text-sm font-semibold text-[--text-primary]">{testimonial.role}</p>
        {testimonial.context && (
          <p className="text-xs text-[--text-muted]">{testimonial.context}</p>
        )}
      </div>
    </div>
  );
}
