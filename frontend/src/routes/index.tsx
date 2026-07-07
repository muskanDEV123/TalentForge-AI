import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNavBar, Footer, Icon } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATS Resume Analyzer — Beat the bots, land the interview" },
      { name: "description", content: "AI-powered resume analysis that scores your ATS match, identifies skill gaps, and gives instant optimization tips." },
      { property: "og:title", content: "ATS Resume Analyzer" },
      { property: "og:description", content: "AI-powered ATS resume scoring and optimization." },
    ],
  }),
  component: Home,
});

function FeatureMini({ icon, iconBg, iconColor, title, desc }: { icon: string; iconBg: string; iconColor: string; title: string; desc: string }) {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col gap-4 md:col-span-4">
      <div className={`${iconBg} p-3 rounded-xl self-start`}>
        <Icon name={icon} className={`${iconColor} text-3xl`} />
      </div>
      <h4 className="font-semibold text-on-surface">{title}</h4>
      <p className="text-on-surface-variant text-sm">{desc}</p>
    </div>
  );
}

function Home() {
  return (
    <div className="flex flex-col bg-background text-on-background min-h-screen">
      <TopNavBar active="home" />

      {/* Hero */}
      <section className="hero-gradient pt-24 pb-32 px-4 md:px-10 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-medium mb-4 border border-primary/20">
            <Icon name="verified" className="text-[18px]" />
            AI-Powered Precision Scoring
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-on-surface mb-4 tracking-tight md:leading-[1.1]">
            Check How Well Your Resume Matches the Job
          </h1>
          <p className="text-on-surface-variant text-base md:text-xl mb-8 max-w-2xl mx-auto opacity-80">
            Upload your resume and paste the job description to get instant AI analysis, skill gap identification, and ATS optimization tips.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="bg-primary text-on-primary px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary-container shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              Get Started <Icon name="arrow_forward" />
            </Link>
            <Link
              to="/results"
              className="border border-outline text-on-surface px-10 py-4 rounded-xl font-semibold text-lg hover:bg-surface-container transition-all duration-200"
            >
              View Sample Report
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-100 transition-all">
            {[
              ["shield", "PRIVACY GUARANTEED"],
              ["bolt", "INSTANT ANALYSIS"],
              ["award_star", "98% ACCURACY"],
            ].map(([icon, txt]) => (
              <div key={txt} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                <Icon name={icon} />
                {txt}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento grid */}
      <section className="py-16 px-4 md:px-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main visual */}
          <div className="glass-card rounded-3xl p-8 overflow-hidden relative group h-[400px] md:col-span-8 flex flex-col">
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-primary text-sm font-semibold mb-2">Visual Dashboard</span>
              <h3 className="text-2xl font-bold text-on-surface mb-4">Comprehensive Analytics at a Glance</h3>
              <p className="text-on-surface-variant text-sm max-w-sm">
                Our sophisticated dashboard highlights keywords, formatting issues, and cultural fit markers in seconds.
              </p>
              <div className="mt-auto flex gap-4">
                <div className="bg-surface-container-highest p-4 rounded-2xl w-32 shadow-sm border border-outline-variant">
                  <div className="text-primary font-bold text-2xl">85%</div>
                  <div className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Match Score</div>
                </div>
                <div className="bg-surface-container-highest p-4 rounded-2xl w-32 shadow-sm border border-outline-variant">
                  <div className="text-tertiary font-bold text-2xl">12</div>
                  <div className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">Missing Skills</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-1/2 h-full pointer-events-none opacity-80 group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-fixed-dim/40 to-transparent rounded-3xl" />
              <div className="absolute top-1/4 right-1/4 w-32 h-44 bg-white rounded-xl shadow-2xl rotate-6 border border-outline-variant flex flex-col p-3 gap-1.5">
                <div className="h-2 bg-primary/30 rounded w-3/4" />
                <div className="h-1.5 bg-outline-variant rounded w-full" />
                <div className="h-1.5 bg-outline-variant rounded w-5/6" />
                <div className="h-1.5 bg-outline-variant rounded w-4/6" />
                <div className="mt-2 h-2 bg-tertiary/40 rounded w-1/2" />
                <div className="h-1.5 bg-outline-variant rounded w-full" />
              </div>
            </div>
          </div>

          {/* Action card */}
          <div className="bg-primary rounded-3xl p-8 text-on-primary flex flex-col justify-between shadow-xl md:col-span-4">
            <div>
              <Icon name="upload_file" className="text-4xl mb-4" />
              <h3 className="text-2xl font-bold mb-2">Smart File Parsing</h3>
              <p className="text-primary-fixed-dim text-sm opacity-80">
                Supports PDF, DOCX, and TXT with advanced structural recognition.
              </p>
            </div>
            <Link to="/analyze" className="group inline-flex items-center gap-1 mt-4 font-semibold">
              Try Now <Icon name="chevron_right" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <FeatureMini icon="psychology" iconBg="bg-tertiary-container/10 border border-tertiary/20" iconColor="text-tertiary" title="NLP Skill Mapping" desc="We use Natural Language Processing to find semantic matches for your experience." />
          <FeatureMini icon="edit_note" iconBg="bg-primary-container/10 border border-primary/20" iconColor="text-primary" title="Keyword Optimization" desc="Get specific lists of industry keywords to add to your bullet points." />
          <FeatureMini icon="history_edu" iconBg="bg-secondary-container" iconColor="text-secondary" title="Formatting Checks" desc="Ensure your resume isn't getting rejected by old ATS systems due to layout." />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-10 text-center bg-surface-container mt-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight">Ready to beat the bots?</h2>
          <p className="text-on-surface-variant text-base mb-8">
            Join thousands of job seekers who have optimized their resumes for top-tier companies.
          </p>
          <Link
            to="/analyze"
            className="inline-block bg-primary text-on-primary px-12 py-5 rounded-full font-semibold text-lg hover:shadow-2xl hover:bg-primary-container transition-all"
          >
            Start Your Free Analysis
          </Link>
        </div>
      </section>

      <Footer showSocial />
    </div>
  );
}
