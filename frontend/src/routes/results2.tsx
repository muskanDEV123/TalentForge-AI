import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopNavBar, Footer, Icon } from "@/components/Shell";

export const Route = createFileRoute("/results2")({
  head: () => ({ meta: [{ title: "Results — ATS Resume Analyzer" }] }),
  component: Results2,
});

function Results2() {
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPct(82), 300); return () => clearTimeout(t); }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopNavBar active="analyze" />
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-10 py-16 space-y-16 w-full">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            <div
              className="w-full h-full rounded-full absolute transition-all duration-1000 ease-out"
              style={{ background: `conic-gradient(#2563eb 0% ${pct}%, #e0e3e5 ${pct}% 100%)` }}
            />
            <div
              className="w-[90%] h-[90%] bg-white rounded-full flex flex-col items-center justify-center relative z-10"
              style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)" }}
            >
              <div className="text-4xl font-bold text-primary">82%</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">ATS Score</div>
            </div>
          </div>
          <div className="max-w-md text-center mt-6">
            <h1 className="text-2xl font-bold mb-2">Great work!</h1>
            <p className="text-on-surface-variant">
              Your resume is highly optimized for the target job description. A few minor tweaks could push you over 90%.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Section span={6} icon="check_circle" iconColor="text-tertiary" title="Matched Skills">
            <div className="flex flex-wrap gap-2">
              {["Project Management", "Python", "Agile Methodology", "Data Visualization", "SQL", "Stakeholder Management", "Budgeting"].map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#D1FAE5", color: "#065F46" }}>{s}</span>
              ))}
            </div>
          </Section>

          <Section span={6} icon="error" iconColor="text-error" title="Missing Skills">
            <div className="flex flex-wrap gap-2">
              {["AWS Cloud", "JIRA Administration", "Kubernetes"].map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>{s}</span>
              ))}
            </div>
          </Section>

          <Section span={12} icon="lightbulb" iconColor="text-primary" title="Recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Quantify your achievements in the Project Management section with specific metrics (e.g., "Increased efficiency by 15%").',
                'Include mentions of Cloud Infrastructure even if it\'s "familiarity" to bridge the AWS gap.',
                "Reduce the length of your Professional Summary to under 4 lines for better readability.",
                "Standardize date formats throughout your experience list to avoid parsing errors.",
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                  <Icon name="arrow_forward" className="text-primary text-sm mt-1" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="flex justify-center pt-8 pb-4">
          <Link
            to="/dashboard"
            className="group bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2"
          >
            <Icon name="refresh" className="group-hover:-rotate-45 transition-transform" />
            Analyze Another Resume
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ span, icon, iconColor, title, children }: { span: 6 | 12; icon: string; iconColor: string; title: string; children: React.ReactNode }) {
  const cls = span === 6 ? "md:col-span-6" : "md:col-span-12";
  return (
    <div className={`${cls} bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm hover:shadow-lg transition-all`}>
      <div className="flex items-center gap-2 border-b border-outline-variant pb-2 mb-4">
        <Icon name={icon} className={iconColor} />
        <h2 className="text-sm font-semibold text-on-surface">{title}</h2>
      </div>
      {children}
    </div>
  );
}
