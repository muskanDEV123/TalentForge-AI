import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { TopNavBar, Footer, Icon } from "@/components/Shell";
import { apiAnalyze, token } from "@/lib/api";

export const Route = createFileRoute("/analyze")({
  head: () => ({ meta: [{ title: "Analyze — ATS Resume Analyzer" }] }),
  beforeLoad: () => {
    if (!token.get()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AnalyzePage,
});

function AnalyzePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) { alert("Please upload a PDF file."); return; }
    setFileName(f.name);
    setFile(f);
  };

  const analyze = async () => {
    if (!token.get()) {
      await navigate({ to: "/login" });
      return;
    }
    if (!file) { setError("Please upload a resume PDF first."); return; }
    if (!jobDescription.trim()) { setError("Please paste a job description first."); return; }

    setError(null);
    setLoading(true);
    try {
      const result = await apiAnalyze(file, jobDescription);
      sessionStorage.setItem("ats_result", JSON.stringify(result));
      await navigate({ to: "/results" });
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 401 || status === 403) {
        token.clear();
        await navigate({ to: "/login" });
        return;
      }
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopNavBar active="analyze" />
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-10 py-16 w-full">
        <div className="w-full max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-on-surface mb-2 tracking-tight">Analyze Your Resume</h1>
            <p className="text-on-surface-variant text-base max-w-2xl mx-auto">
              Optimize your job application by comparing your resume with specific job requirements using our advanced ATS engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col gap-2 h-full">
              <label className="text-sm font-semibold text-on-surface">Upload Resume</label>
              <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                className={`flex-grow glass-panel border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${dragOver ? "border-primary bg-primary-container/5" : "border-outline-variant hover:border-primary"}`}
              >
                <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                  <Icon name="upload_file" className="text-[32px]" />
                </div>
                <p className="text-sm font-semibold text-on-surface mb-1">
                  {fileName ?? "Click or drag and drop to upload"}
                </p>
                <p className="text-xs text-outline">PDF files only</p>
                <input ref={inputRef} type="file" accept=".pdf" hidden onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)} />
              </div>
            </div>

            <div className="flex flex-col gap-2 h-full">
              <label className="text-sm font-semibold text-on-surface">Paste Job Description</label>
              <div className="flex-grow glass-panel border border-outline-variant rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <textarea
                  className="w-full h-full min-h-[300px] p-4 bg-transparent border-none focus:ring-0 focus:outline-none text-base text-on-surface placeholder:text-outline resize-none"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-6 text-center text-sm text-error font-medium">{error}</p>
          )}

          <div className="mt-12 flex justify-center">
            <button
              onClick={analyze}
              disabled={loading}
              className="group relative flex items-center gap-2 bg-primary text-on-primary px-12 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-70"
            >
              {loading ? (<><Icon name="sync" className="animate-spin" /> Analyzing...</>) :
               (<>Analyze Now <Icon name="bolt" className="group-hover:translate-x-1 transition-transform" /></>)}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
