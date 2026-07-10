import { createFileRoute } from "@tanstack/react-router";
import { TopNavBar, Footer, Icon } from "@/components/Shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ATS Resume Analyzer" },
      { name: "description", content: "Meet the architects behind ATS Resume Analyzer." },
    ],
  }),
  component: About,
});

function TeamCard({ initial, gradient, name, role, bio }: { initial: string; gradient: string; name: string; role: string; bio: string }) {
  return (
    <div className="glass-card rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300">
      <div
        className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-surface-container flex items-center justify-center text-white text-4xl font-bold"
        style={{ background: gradient }}
      >
        {initial}
      </div>
      <h3 className="text-2xl font-bold text-on-surface">{name}</h3>
      <p className="text-sm font-semibold text-primary mb-4">{role}</p>
      <p className="text-sm text-on-surface-variant mb-6">{bio}</p>
      <div className="flex space-x-4">
        <a href="#" className="text-outline hover:text-primary transition-colors"><Icon name="link" /></a>
        <a href="#" className="text-outline hover:text-primary transition-colors"><Icon name="alternate_email" /></a>
      </div>
    </div>
  );
}

function Tech({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 group">
      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon name={icon} className="text-primary text-3xl" />
      </div>
      <span className="text-sm font-medium text-on-surface">{label}</span>
    </div>
  );
}

function About() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9ff", color: "#0b1c30" }}>
      <TopNavBar active="about" />

      <main className="flex-grow flex flex-col items-center px-4 md:px-10 py-16 space-y-16 max-w-5xl mx-auto w-full">
        <section className="text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-surface-container text-primary rounded-full mb-4">
            <Icon name="info" className="text-sm" />
            <span className="text-xs font-semibold uppercase tracking-wider">Mission Statement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Empowering Careers Through Precision Intelligence
          </h1>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
            ATS Resume Analyzer was built to bridge the gap between talented professionals and their dream opportunities. By leveraging state-of-the-art AI, we help candidates optimize their resumes for Applicant Tracking Systems with clinical accuracy.
          </p>
        </section>

        <section className="w-full space-y-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Meet the Architects</h2>
            <p className="text-sm text-outline">The visionaries behind the analytical engine.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamCard
              initial="S"
              gradient="linear-gradient(135deg, #2563eb, #b4c5ff)"
              name="Saurabh"
              role="React, API & AI Integration"
              bio="Full-Stack Developer specializing in React.js, API Integration, and AI-powered solutions. I build fast, scalable, and modern web applications that combine clean UI with smart automation — turning ideas into functional, intelligent products."
            />
            <TeamCard
              initial="M"
              gradient="linear-gradient(135deg, #2563eb, #b4c5ff)"
              name="Muskan"
              role="Backend & AI Integration"
              bio="Specializing in distributed systems and LLM orchestration, Muskan ensures the core analysis engine is fast, scalable, and remarkably accurate."
            />
            <TeamCard
              initial="R"
              gradient="linear-gradient(135deg, #943700, #ffb596)"
              name="Richa"
              role="Frontend & UI Design"
              bio="With a keen eye for functional aesthetics, Richa crafts the seamless interfaces that transform complex data into actionable career insights."
            />
          </div>
        </section>

        <section className="w-full bg-surface-container-low rounded-2xl p-12 border border-outline-variant/30 text-center">
          <p className="text-xs uppercase tracking-widest text-outline mb-8 font-semibold">Powered by Modern Technology</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-80 hover:opacity-100 transition-all duration-500">
            <Tech icon="deployed_code" label="React" />
            <Tech icon="bolt" label="FastAPI" />
            <Tech icon="database" label="Supabase" />
            <Tech icon="psychology" label="Gemini AI" />
          </div>
        </section>
      </main>

      <Footer showSocial />
    </div>
  );
}
