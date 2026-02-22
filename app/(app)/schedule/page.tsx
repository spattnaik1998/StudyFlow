"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { WeekCalendar } from "@/components/schedule/WeekCalendar";
import { BlockForm } from "@/components/schedule/BlockForm";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { ScheduleBlock, Project } from "@/types/database";

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return end;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const endDay = weekEnd.getDate();
  const year = weekStart.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

export default function SchedulePage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekEnd = getWeekEnd(weekStart);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["schedule_blocks", weekStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_blocks")
        .select("*")
        .gte("start_time", weekStart.toISOString())
        .lt("start_time", weekEnd.toISOString())
        .order("start_time");

      if (error) throw error;
      return data as ScheduleBlock[];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active");

      if (error) throw error;
      return data as Project[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (block: Omit<ScheduleBlock, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("schedule_blocks").insert([block]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule_blocks"] });
      setShowForm(false);
      setEditingBlock(null);
      setSelectedDate(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (block: ScheduleBlock) => {
      const { error } = await supabase
        .from("schedule_blocks")
        .update(block)
        .eq("id", block.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule_blocks"] });
      setShowForm(false);
      setEditingBlock(null);
      setSelectedDate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule_blocks"] });
    },
  });

  const handleOpenForm = (date?: Date) => {
    setEditingBlock(null);
    setSelectedDate(date || null);
    setShowForm(true);
  };

  const handleEditBlock = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setSelectedDate(null);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingBlock) {
        await updateMutation.mutateAsync({ ...editingBlock, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (err) {
      console.error("Error saving block:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this block?")) {
      try {
        await deleteMutation.mutateAsync(id);
        setShowForm(false);
        setEditingBlock(null);
      } catch (err) {
        console.error("Error deleting block:", err);
      }
    }
  };

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(getMonday(prev));
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(getMonday(next));
  };

  const handleToday = () => {
    setWeekStart(getMonday(new Date()));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Weekly Schedule</h1>
          <p className="text-zinc-400 mt-2">Manage your study blocks and time allocation</p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          Add Block
        </button>
      </div>

      {/* Week navigation */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-lg border border-white/20 hover:bg-white/10 text-zinc-300 transition"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center min-w-64">
          <p className="text-lg font-semibold text-white">{formatWeekRange(weekStart)}</p>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg border border-white/20 hover:bg-white/10 text-zinc-300 transition"
        >
          <ChevronRight size={20} />
        </button>

        <button
          onClick={handleToday}
          className="ml-4 px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition text-sm font-medium"
        >
          Today
        </button>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">Loading schedule...</p>
        </div>
      ) : (
        <WeekCalendar
          blocks={blocks}
          weekStart={weekStart}
          onSlotClick={handleOpenForm}
          onBlockClick={handleEditBlock}
        />
      )}

      {/* Block form modal */}
      {showForm && (
        <BlockForm
          block={editingBlock}
          selectedDate={selectedDate}
          projects={projects}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onClose={() => {
            setShowForm(false);
            setEditingBlock(null);
            setSelectedDate(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
