import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface LogEntry {
  date: string;
  time: string;
  value: number;
  trend: "up" | "down" | "stable";
}

const logs: LogEntry[] = [
  { date: "7 Apr", time: "07:00", value: 95, trend: "stable" },
  { date: "7 Apr", time: "12:30", value: 142, trend: "up" },
  { date: "6 Apr", time: "07:00", value: 102, trend: "stable" },
  { date: "6 Apr", time: "19:00", value: 168, trend: "up" },
  { date: "5 Apr", time: "07:00", value: 88, trend: "down" },
];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-orange-vibrant" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-teal" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const getValueColor = (v: number) => {
  if (v > 140) return "text-orange-vibrant font-bold";
  if (v < 70) return "text-destructive font-bold";
  return "text-teal font-bold";
};

const RiwayatScreen = () => (
  <div className="space-y-4 animate-fade-in">
    <h2 className="text-xl font-bold text-foreground">Riwayat Gula Darah</h2>

    {/* Summary bar */}
    <div className="gradient-hero rounded-xl p-4 flex justify-around text-primary-foreground text-center">
      <div>
        <p className="text-2xl font-bold">95</p>
        <p className="text-[10px] opacity-80">Terendah</p>
      </div>
      <div className="border-l border-primary-foreground/20" />
      <div>
        <p className="text-2xl font-bold">119</p>
        <p className="text-[10px] opacity-80">Rata-rata</p>
      </div>
      <div className="border-l border-primary-foreground/20" />
      <div>
        <p className="text-2xl font-bold">168</p>
        <p className="text-[10px] opacity-80">Tertinggi</p>
      </div>
    </div>

    <div className="space-y-2">
      {logs.map((log, i) => (
        <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{log.date}</p>
            <p className="text-xs text-muted-foreground">{log.time}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${getValueColor(log.value)}`}>{log.value}</span>
            <span className="text-xs text-muted-foreground">mg/dL</span>
            <TrendIcon trend={log.trend} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RiwayatScreen;
