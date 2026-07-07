import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardNavBar, Footer, Icon } from "@/components/Shell";
import type { AnalysisResult } from "@/lib/api";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Results — ATS Resume Analyzer" }] }),
  component: ResultsPage,
});

const R = 90;
const C = 2 * Math.PI * R;

const DEMO: AnalysisResult = {
  id: null,
  score: 82,
  matched_skills: ["Python", "SQL", "Project Management", "Data Visualization", "Pandas", "Machine Learning"],
  missing_skills: ["Docker", "AWS", "Spark", "CI/CD"],
  recommendations: [
    'Add specific metrics to your experience (e.g., "Increased efficiency by 20%").',
    'Include "Docker" and "AWS" under a dedicated Technical Skills section.',
    'Rewrite professional summary to include "Agile Methodology".',
  ],
  summary: "Great job! Your resume has a strong alignment with the job description.",
};

function ResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [offset, setOffset] = useState(C);

  useEffect(() => {
    const raw = sessionStorage.getItem("ats_result");
    const data: AnalysisResult = raw ? (JSON.parse(raw) as AnalysisResult) : DEMO;
    setResult(data);
    const t = setTimeout(() => setOffset(C - (data.score / 100) * C), 300);
    return () => clearTimeout(t);
  }, []);

  if (!result) return null;

  const scoreColor = result.score >= 80 ? "text-tertiary" : result.score >= 60 ? "text-primary" : "text-error";

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <DashboardNavBar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">

        {/* Score */}
        <div className="flex flex-col items-center justify-center mb-16">
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            <svg className="w-full h-full" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r={R} fill="transparent" stroke="currentColor" className="text-surface-container-high" strokeWidth="12" />
              <circle
                cx="128" cy="128" r={R} fill="transparent"
                stroke="currentColor" className="text-primary"
                strokeDasharray={C} strokeDashoffset={offset}
                strokeLinecap="round" strokeWidth="12"
                style={{ transition: "stroke-dashoffset 1s ease-in-out", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${scoreColor}`}>{result.score}%</div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-widest mt-1">ATS Match</div>
            </div>
          </div>
          <p className="text-lg text-on-surface-variant text-center max-w-xl mt-6">{result.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card iconBg="bg-tertiary/10" iconColor="text-tertiary" icon="check_circle" title={`Matched Skills (${result.matched_skills.length})`}>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.matched_skills.length > 0 ? result.matched_skills.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-tertiary-container/10 text-tertiary text-sm font-medium border border-tertiary/20">{s}</span>
              )) : <p className="text-sm text-on-surface-variant">No matching skills detected.</p>}
            </div>
            <p className="mt-auto text-xs text-on-surface-variant">These keywords are successfully detected and match the job requirements.</p>
          </Card>

          <Card iconBg="bg-error/10" iconColor="text-error" icon="warning" title={`Missing Skills (${result.missing_skills.length})`}>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.missing_skills.length > 0 ? result.missing_skills.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-error-container/40 text-error text-sm font-medium border border-error/20">{s}</span>
              )) : <p className="text-sm text-tertiary font-medium">🎉 No critical skills missing!</p>}
            </div>
            <p className="mt-auto text-xs text-on-surface-variant">Missing these critical keywords may lower your ranking in automated screenings.</p>
          </Card>

          <Card iconBg="bg-primary/10" iconColor="text-primary" icon="lightbulb" title="Recommendations">
            <ul className="space-y-4">
              {result.recommendations.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <p className="text-sm text-on-surface-variant">{t}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => { sessionStorage.removeItem("ats_result"); navigate({ to: "/dashboard" }); }}
            className="bg-primary text-on-primary text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-on-primary-fixed-variant transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            <Icon name="refresh" /> Analyze Another Resume
          </button>
          <button
            onClick={() => window.print()}
            className="border border-outline text-on-surface text-lg px-8 py-4 rounded-lg hover:bg-surface-container transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            <Icon name="print" /> Print / Save PDF
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Card({ icon, iconBg, iconColor, title, children }: { icon: string; iconBg: string; iconColor: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col h-full shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon name={icon} filled className={iconColor} />
        </div>
        <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      </div>
      {children}
    </div>
  );
}
