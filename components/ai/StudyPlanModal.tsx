"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { GenerateStudyPlanRequest } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sparkles, X, Check } from "lucide-react";
import type { Project } from "@/types/database";

interface StudyBlock {
  title: string;
  start_time: string;
  end_time: string;
  block_type: string;
  color: string;
}

interface StudyPlanModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudyPlanModal({
  project,
  open,
  onOpenChange,
}: StudyPlanModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [phase, setPhase] = useState<"input" | "preview">("input");
  const [topicsInput, setTopicsInput] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [generatedBlocks, setGeneratedBlocks] = useState<StudyBlock[]>([]);

  const generatePlan = useMutation({
    mutationFn: async () => {
      const topics = topicsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (!topics.length) {
        throw new Error("Please add at least one topic");
      }

      const response = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          exam_date: project.exam_date,
          chapters: topics,
          total_study_hours: hoursPerDay * 7,
        } as GenerateStudyPlanRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedBlocks(data.data.blocks || []);
      setPhase("preview");
    },
  });

  const addToSchedule = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const blocks = generatedBlocks.map((block) => ({
        user_id: user?.id,
        title: block.title,
        block_type: block.block_type,
        start_time: block.start_time,
        end_time: block.end_time,
        color: block.color,
        is_recurring: false,
        recurrence_rule: null,
        project_id: project.id,
      }));

      const { error } = await supabase
        .from("schedule_blocks")
        .insert(blocks);

      if (error) throw error;
    },
    onSuccess: () => {
      onOpenChange(false);
      router.push("/schedule");
    },
  });

  const handleClose = () => {
    if (phase === "preview") {
      setPhase("input");
      setGeneratedBlocks([]);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {phase === "input" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Generate Study Plan
              </DialogTitle>
              <DialogDescription>
                {project.name} • Exam: {project.exam_date}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <label className="text-sm font-medium block mb-2 text-gray-300">
                  Topics/Chapters (comma-separated)
                </label>
                <Input
                  placeholder="e.g. Chapter 1, Chapter 2, Thermodynamics, Quantum Physics"
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2 text-gray-300">
                  Hours per day: {hoursPerDay}h
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => generatePlan.mutate()}
                  disabled={generatePlan.isPending || !topicsInput.trim()}
                  className="flex-1"
                >
                  {generatePlan.isPending ? "Generating..." : "Generate Plan"}
                </Button>
              </div>

              {generatePlan.isError && (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                  {generatePlan.error instanceof Error
                    ? generatePlan.error.message
                    : "Failed to generate plan"}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Review Study Schedule</DialogTitle>
              <DialogDescription>
                {generatedBlocks.length} blocks scheduled
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto py-4">
              {generatedBlocks.map((block, idx) => (
                <Card key={idx} className="border-l-4" style={{ borderLeftColor: block.color }}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{block.title}</h3>
                        <p className="text-sm text-zinc-400">
                          {new Date(block.start_time).toLocaleDateString()} •{" "}
                          {new Date(block.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {new Date(block.end_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-white/10 text-zinc-400">
                          {block.block_type}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={addToSchedule.isPending}
              >
                Back
              </Button>
              <Button
                onClick={() => addToSchedule.mutate()}
                disabled={addToSchedule.isPending}
                className="flex-1"
              >
                {addToSchedule.isPending ? "Adding..." : "Add to Schedule"}
              </Button>
            </div>

            {addToSchedule.isError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                {addToSchedule.error instanceof Error
                  ? addToSchedule.error.message
                  : "Failed to add blocks"}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
