import { Bell, Pill, Droplets, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Reminder {
  id: number;
  type: "obat" | "cek_gula";
  title: string;
  time: string;
  priority: "high" | "normal";
  done: boolean;
}

const initialReminders: Reminder[] = [
  { id: 1, type: "obat", title: "Metformin 500mg", time: "07:00", priority: "normal", done: false },
  { id: 2, type: "cek_gula", title: "Cek Gula Darah", time: "07:30", priority: "high", done: false },
  { id: 3, type: "obat", title: "Glimepiride 2mg", time: "12:00", priority: "normal", done: false },
  { id: 4, type: "cek_gula", title: "Cek Gula Darah", time: "18:00", priority: "high", done: true },
];

const PengingatScreen = () => {
  const [reminders, setReminders] = useState(initialReminders);
  const [logSheetId, setLogSheetId] = useState<number | null>(null);
  const [logValue, setLogValue] = useState("");

  const markDone = (id: number) => {
    const r = reminders.find((r) => r.id === id);
    if (r?.type === "cek_gula" && !r.done) {
      setLogSheetId(id);
      return;
    }
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: true } : r)));
    toast.success("Pengingat selesai!");
  };

  const submitLog = () => {
    if (!logValue) return;
    setReminders((prev) => prev.map((r) => (r.id === logSheetId ? { ...r, done: true } : r)));
    setLogSheetId(null);
    setLogValue("");
    toast.success(`Gula darah ${logValue} mg/dL tercatat`);
  };

  const snooze = (id: number) => {
    toast("Ditunda 15 menit", { icon: "⏰" });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">Pengingat Hari Ini</h2>

      <div className="space-y-3">
        {reminders.map((r) => (
          <div
            key={r.id}
            className={`bg-card rounded-xl p-4 border ${
              r.done ? "border-border opacity-60" : r.priority === "high" ? "border-orange-vibrant" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {r.priority === "high" && !r.done && (
                  <Bell className="h-4 w-4 text-orange-vibrant animate-pulse" />
                )}
                {r.type === "obat" ? (
                  <Pill className="h-4 w-4 text-teal" />
                ) : (
                  <Droplets className="h-4 w-4 text-teal" />
                )}
                <span className="font-semibold text-foreground text-sm">{r.title}</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {r.time}
              </span>
            </div>
            {!r.done && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => markDone(r.id)} className="flex-1">
                  Selesai
                </Button>
                <Button variant="snooze" size="sm" onClick={() => snooze(r.id)}>
                  Tunda
                </Button>
                <Button variant="outline" size="sm" onClick={() => markDone(r.id)}>
                  Lewati
                </Button>
              </div>
            )}
            {r.done && <p className="text-xs text-teal font-medium">✓ Selesai</p>}
          </div>
        ))}
      </div>

      {/* Blood Sugar Log Sheet */}
      {logSheetId !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40">
          <div className="w-full max-w-[440px] bg-card rounded-t-3xl animate-slide-up p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="h-6 w-6 text-orange-vibrant" />
              <h3 className="text-lg font-bold text-foreground">Catat Gula Darah</h3>
            </div>
            <div className="flex flex-col items-center gap-4">
              <input
                type="number"
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                placeholder="0"
                className="text-5xl font-bold text-center w-full bg-transparent border-b-2 border-teal py-4 text-foreground focus:outline-none focus:border-orange-vibrant transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-muted-foreground">mg/dL</span>
              <div className="flex gap-3 w-full mt-2">
                <Button className="flex-1" onClick={submitLog}>
                  Simpan
                </Button>
                <Button variant="outline" onClick={() => setLogSheetId(null)}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengingatScreen;
