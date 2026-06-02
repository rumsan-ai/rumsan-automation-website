"use client";

import { useState, useEffect, useRef } from "react";
import { URLS } from "@/constants";

export function useHealthStatus() {
  const [dynamicStatuses, setDynamicStatuses] = useState<
    Record<string, string>
  >({});
  const ollamaFetched = useRef(false); 

  useEffect(() => {
    const fetchStatuses = async () => {
      // Community Tool Check
      if (URLS.COMMUNITY_TOOL) {
        try {
          const communityRes = await fetch(`${URLS.COMMUNITY_TOOL}/health`, {
            headers: { accept: "application/json" },
          });
          const communityData = (await communityRes.json()) as {
            status: string;
          };
          setDynamicStatuses((prev) => ({
            ...prev,
            "community-tool":
              communityData.status === "healthy" ? "operational" : "outage",
          }));
        } catch (error) {
          setDynamicStatuses((prev) => ({
            ...prev,
            "community-tool": "outage",
          }));
        }
      }

      // AI Quiz Check
      if (URLS.AI_QUIZ) {
        try {
          const aiQuizRes = await fetch(`${URLS.AI_QUIZ}`, {
            headers: { accept: "application/json" },
          });
          if (!aiQuizRes.ok) throw new Error("Health check failed");
          const aiQuizData = (await aiQuizRes.json()) as { status: string };
          setDynamicStatuses((prev) => ({
            ...prev,
            "ai-quiz":
              aiQuizData.status === "running" ? "operational" : "outage",
          }));
        } catch (error) {
          setDynamicStatuses((prev) => ({ ...prev, "ai-quiz": "outage" }));
        }
      }

      // VoxFlow Check
      if (URLS.VOX_FLOW) {
        try {
          const voxRes = await fetch(`${URLS.VOX_FLOW}/docs`, {
            headers: { accept: "application/json" },
          });
          setDynamicStatuses((prev) => ({
            ...prev,
            "vox-flow": voxRes.ok ? "operational" : "outage",
          }));
        } catch (error) {
          setDynamicStatuses((prev) => ({ ...prev, "vox-flow": "outage" }));
        }
      }

      // Ollama (only change: run once)
      if (URLS.OLLAMA_ENDPOINT && !ollamaFetched.current) {
        ollamaFetched.current = true;

        try {
          const ollamaRes = await fetch(URLS.OLLAMA_ENDPOINT, {
            headers: { accept: "application/json" },
          });

          setDynamicStatuses((prev) => ({
            ...prev,
            "telegram-integration": ollamaRes.ok ? "operational" : "outage",
            "discord-integration": ollamaRes.ok ? "operational" : "outage",
            "invoice-validation": ollamaRes.ok ? "operational" : "outage",
            "cv-evaluation": ollamaRes.ok ? "operational" : "outage",
            askbhunte: ollamaRes.ok ? "operational" : "outage",
          }));
        } catch (error) {
          setDynamicStatuses((prev) => ({
            ...prev,
            "telegram-integration": "outage",
            "discord-integration": "outage",
            "invoice-validation": "outage",
            "cv-evaluation": "outage",
            askbhunte: "outage",
          }));
        }
      }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return dynamicStatuses;
}
