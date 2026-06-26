import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Utensils, Soup, Sandwich, TrendingUp, Coffee } from "lucide-react";
import { formatDateISO } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MessMate" }] }),
  component: Dashboard,
});

function Dashboard() {
  const today = formatDateISO(new Date());
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("members").select("*");
      if (error) throw error;
      return (data ?? []).map((m) => {
        const localPlan = localStorage.getItem(`messmate.member_meal_plan.${m.id}`);
        return localPlan ? { ...m, meal_plan: localPlan as any } : m;
      });
    },
  });
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ["attendance", "today", today],
    queryFn: async () => (await supabase.from("attendance").select("*").eq("date", today)).data ?? [],
  });

  const breakfastToday = members.reduce((acc, m) => {
    const isEligible = m.meal_plan.includes("breakfast") || m.meal_plan === "all";
    if (isEligible) {
      const status = localStorage.getItem(`messmate.attendance_breakfast.${m.id}_${today}`);
      if (status === "present") return acc + 1;
    }
    return acc;
  }, 0);

  const lunchToday = todayAttendance.filter((a) => a.lunch_status === "present").length;
  const dinnerToday = todayAttendance.filter((a) => a.dinner_status === "present").length;

  const absentToday = members.reduce((acc, m) => {
    const hasBreakfastAbsence = (m.meal_plan.includes("breakfast") || m.meal_plan === "all") &&
      localStorage.getItem(`messmate.attendance_breakfast.${m.id}_${today}`) === "absent";
    
    const dbRecord = todayAttendance.find((a) => a.member_id === m.id);
    const hasLunchAbsence = (m.meal_plan.includes("lunch") || m.meal_plan === "all") && dbRecord?.lunch_status === "absent";
    const hasDinnerAbsence = (m.meal_plan.includes("dinner") || m.meal_plan === "all") && dbRecord?.dinner_status === "absent";
    
    if (hasBreakfastAbsence || hasLunchAbsence || hasDinnerAbsence) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const tiles = [
    { label: "Total Members", value: members.length, icon: Users, color: "from-violet-500 to-fuchsia-500" },
    { label: "Breakfast Today", value: breakfastToday, icon: Coffee, color: "from-yellow-400 to-amber-500" },
    { label: "Lunch Today", value: lunchToday, icon: Soup, color: "from-orange-400 to-amber-500" },
    { label: "Dinner Today", value: dinnerToday, icon: Sandwich, color: "from-blue-500 to-sky-500" },
    { label: "Absent Today", value: absentToday, icon: TrendingUp, color: "from-rose-500 to-red-500" },
  ];

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Today's mess overview</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow`}>
              <t.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-3xl font-bold">{t.value}</div>
              <div className="truncate text-xs uppercase tracking-wide text-muted-foreground">{t.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold"><Utensils className="h-4 w-4 text-primary" /> Welcome back, Mess Manager</div>
        <p className="mt-2 text-sm text-muted-foreground">Open the Members page to mark today's attendance, search members, or review the notebook for any member.</p>
      </div>
    </div>
  );
}
