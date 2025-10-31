"use client";
import Classic from "@/components/templates/Classic";
import Italy from "@/components/templates/Italy";

export default function CVPreviewThemed({ theme = "classic", resume, innerRef, highlightKeywords = [] }) {
  // Transmitem keywords către template-uri pentru evidențiere
  if (theme === "italy") return <Italy resume={resume} innerRef={innerRef} highlightKeywords={highlightKeywords} />;
  return <Classic resume={resume} innerRef={innerRef} highlightKeywords={highlightKeywords} />;
}



