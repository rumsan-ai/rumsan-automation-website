import { ArrowRight, X, Volume2, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Workflow } from "@/components/home/types";

interface WorkflowModalProps {
  workflow: (Workflow & { status: string }) | undefined;
  expandedWorkflowId: string;
  onClose: () => void;
}

export const WorkflowModal = ({
  workflow,
  expandedWorkflowId,
  onClose,
}: WorkflowModalProps) => {
  if (!workflow) return null;

  const isOperational = workflow.status === "operational";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="w-full max-w-4xl max-h-[90vh] relative z-10 bg-white border-slate-200 shadow-2xl overflow-y-auto rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-20 bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>
        <CardHeader className="px-5 sm:px-8 pt-6 sm:pt-8 pb-2 sm:pb-3">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-inset backdrop-blur-sm bg-blue-500/10 text-blue-600 ring-blue-500/30 transition-all duration-300">
              <div className="relative flex h-2 w-2 shrink-0">
                {!isOperational && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${isOperational
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    }`}
                ></span>
              </div>
              {workflow.badge}
            </span>
          </div>
          <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
            {workflow.title}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base mt-3 sm:mt-4 text-slate-600 leading-relaxed text-justify">
            {workflow.fullDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 sm:px-8 pb-6 sm:pb-8 space-y-5 sm:space-y-8 mt-0">
          {/* Problems & Use Cases */}
          {((workflow.problems?.length ?? 0) > 0 || (workflow.useCases?.length ?? 0) > 0) && (
            <div className="grid md:grid-cols-2 gap-3 mt-2 mb-6">
              {/* Problems panel */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">Problems</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {workflow.problems?.map((problem, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-red-50/30 transition-colors"
                    >
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[10px] font-bold text-red-600">
                        {i + 1}
                      </span>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{problem}</p>
                    </li>
                  ))}
                  {(!workflow.problems || workflow.problems.length === 0) && (
                    <li className="px-4 py-6 text-center text-xs text-slate-400">
                      No problems listed.
                    </li>
                  )}
                </ul>
              </div>

              {/* Use cases panel */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">Use cases</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {workflow.useCases?.map((useCase, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-emerald-50/30 transition-colors"
                    >
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                        {i + 1}
                      </span>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{useCase}</p>
                    </li>
                  ))}
                  {(!workflow.useCases || workflow.useCases.length === 0) && (
                    <li className="px-4 py-6 text-center text-xs text-slate-400">
                      No use cases listed.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Demo Video Placeholder */}
          <div className="mt-8 sm:mt-10">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Product demo
            </h3>
            <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#0f172a] border border-slate-200 shadow-xl group">
                {expandedWorkflowId === "ai-quiz" ? (
                  <iframe
                    className="w-full h-full"
                    src="https://drive.google.com/file/d/1K6R2zoAn7jT4iv-KZYKefg4r8emUdlTE/preview"
                    title="AI Quiz Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : expandedWorkflowId === "invoice-validation" ? (
                  <iframe
                    className="w-full h-full"
                    src="https://drive.google.com/file/d/1myreoB0qLbeelmOmzvX7mll7CD2MFRoO/preview"
                    title="Invoice Validation Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : expandedWorkflowId === "cv-evaluation" ? (
                  <iframe
                    className="w-full h-full"
                    src="https://drive.google.com/file/d/1_QLTHsJA9VFsT9h5HDGCJVaHEBVLzvtt/preview"
                    title="CV Evaluation Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : expandedWorkflowId === "vox-flow" ? (
                  <iframe
                    className="w-full h-full"
                    src="https://drive.google.com/file/d/16uCAlIBkNMd_gHdUv443rUOcmvt482WP/preview"
                    title="Voxflow Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : expandedWorkflowId === "community-tool" ? (
                  <iframe
                    className="w-full h-full"
                    src="https://drive.google.com/file/d/1__jnuM-C3DT6KaTeVmtODl5q_-9f2DLC/preview"
                    title="Community Tool Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 fill-slate-300 ml-1" />
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm font-medium">{workflow.title}</p>
                  </div>
                )}
              </div>
          </div>

          {/* Key Steps */}
          {(workflow.steps?.length ?? 0) > 0 && (
            <div className="mt-8 sm:mt-10">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                User manual steps
              </h3>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {workflow.steps?.map((step, idx) => {
                  return (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-blue-600 font-bold text-[10px] sm:text-xs">{idx + 1}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-bold text-slate-900 text-sm sm:text-base leading-none mb-1.5">{step.title}</p>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Launch Button Area */}
          <div className="pt-5 sm:pt-6 border-t border-slate-100">
            {isOperational &&
              workflow.workflowUrl &&
              expandedWorkflowId !== "gmail-application" && (
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-16 text-sm sm:text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3"
                  asChild
                >
                  <a
                    href={workflow.workflowUrl}
                    target={workflow.isInternalRoute ? "_self" : "_blank"}
                    rel={
                      workflow.isInternalRoute
                        ? undefined
                        : "noopener noreferrer"
                    }
                  >
                    Launch Live Portal
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                </Button>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
