import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { DashboardNavBar, Footer, Icon } from "@/components/Shell";
import { apiAnalyze } from "@/lib/api";
import type { AnalysisResult } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ATS Resume Analyzer" }] }),
  component: Dashboard,
});

type Step = "idle" | "analyzing" | "done" | "error";

function Dashboard() {
  console.log("Dashboard Loaded");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const dashedBg = "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%232563EBFF' stroke-width='2' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")";

  const onFile = (f?: File) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleAnalyze = async () => {
    console.log("===== Analyze Button Clicked =====");
    setError(null);
    if (!file) {
  console.log("No File Selected");
  setError("Please upload your resume first.");
  return;
}
   console.log("Job Description Too Short");
   console.log("Validation Passed");

    setStep("analyzing");
    try {
      console.log("Calling API...");
      const result: AnalysisResult = await apiAnalyze(file, jd);
      console.log("API Response:", result);
      sessionStorage.setItem("ats_result", JSON.stringify(result));
      setStep("done");
      navigate({ to: "/results" });
    } catch (err) {
  setStep("error");

  const msg =
    err instanceof Error ? err.message : "Unexpected error";

  if (
    msg.includes("401") ||
    msg.toLowerCase().includes("not authenticated")
  ) {
    navigate({ to: "/login" });
    return;
  }

  setError(msg);
}
  };

  const busy = step === "analyzing";

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <DashboardNavBar />
      <main className="flex-grow flex flex-col items-center pt-12 pb-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="text-5xl font-bold text-on-surface tracking-tight mb-4">Analyze Your Resume with AI</h2>
          <p className="text-lg text-on-surface-variant">
            Optimize your professional profile for Applicant Tracking Systems. Get instant feedback powered by Google Gemini.
          </p>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 rounded-xl bg-error/10 border border-error/30 flex items-start gap-3">
            <Icon name="error" className="text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error font-medium">{error}</p>
          </div>
        )}

        {busy && (
          <div className="w-full mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <Icon name="sync" className="text-primary animate-spin shrink-0" />
            <p className="text-sm text-primary font-medium">Gemini AI is analyzing your resume against the job description…</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
          {/* Upload */}
          <div className="glass-card rounded-xl p-6 shadow-sm flex flex-col h-full min-h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                <Icon name="upload_file" className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Your Resume</h3>
                <p className="text-xs text-on-surface-variant">Upload PDF (max 10 MB)</p>
              </div>
            </div>
            {!file ? (
              <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0]); }}
                className={`flex-grow rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all ${dragOver ? "bg-primary-fixed/40 scale-[1.02]" : ""}`}
                style={{ backgroundImage: dashedBg }}
              >
                <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon name="cloud_upload" filled className="text-primary text-5xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-base font-semibold text-primary mb-2">Drag & Drop Resume</p>
                <p className="text-sm text-outline">or click to browse — PDF only</p>
                <input ref={inputRef} type="file" accept=".pdf" hidden onChange={(e) => onFile(e.target.files?.[0] ?? undefined)} />
              </div>
            ) : (
              <div className="flex-grow flex flex-col">
                <div className="flex-grow rounded-xl p-8 flex flex-col items-center justify-center" style={{ backgroundImage: dashedBg }}>
                  <Icon name="task_alt" filled className="text-tertiary text-5xl mb-2" />
                  <p className="text-sm text-on-surface-variant">Resume ready for analysis</p>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-surface-container flex items-center justify-between border border-primary-container/20">
                  <div className="flex items-center gap-2">
                    <Icon name="picture_as_pdf" className="text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-outline">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-error hover:bg-error-container p-1 rounded">
                    <Icon name="close" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* JD */}
          <div className="glass-card rounded-xl p-6 shadow-sm flex flex-col h-full min-h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/10 border border-tertiary-container/30 flex items-center justify-center">
                <Icon name="description" className="text-tertiary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Target Job</h3>
                <p className="text-xs text-on-surface-variant">Paste the job description here</p>
              </div>
            </div>
            <label className="text-sm font-semibold text-secondary mb-2">Job Description Content</label>
            <textarea
              value={jd} onChange={(e) => setJd(e.target.value)}
              className="flex-grow w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary-container focus:border-primary-container resize-none p-4 text-base text-on-surface-variant placeholder:text-outline/50 outline-none transition-shadow"
              placeholder="Paste requirements, responsibilities, and skills from the job posting..."
            />
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${jd.length < 50 ? "text-error" : "text-tertiary"}`}>
                {jd.length} chars {jd.length < 50 ? `(${50 - jd.length} more needed)` : "✓"}
              </span>
              <span className="text-xs text-outline">Min. 50 characters required</span>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-4">
          <button
            onClick={handleAnalyze} disabled={busy}
            className="bg-primary-container text-white px-12 py-4 rounded-lg text-lg font-semibold shadow-lg hover:bg-primary transition-all duration-200 hover:-translate-y-1 active:scale-95 flex items-center gap-3 disabled:opacity-70"
          >
            {busy ? (<><Icon name="sync" className="animate-spin" /> Analyzing…</>) :
             (<>Analyze Now <Icon name="auto_awesome" /></>)}
          </button>
          <p className="text-sm text-outline italic">Powered by Google Gemini AI</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
