import { Home, ClipboardList, Bell, BookOpen } from "lucide-react";

type Tab = "beranda" | "riwayat" | "pengingat" | "glosarium";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "beranda", label: "Beranda", icon: Home },
  { id: "riwayat", label: "Riwayat", icon: ClipboardList },
  { id: "pengingat", label: "Pengingat", icon: Bell },
  { id: "glosarium", label: "Glosarium", icon: BookOpen },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-navy z-40">
    <div className="flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
              isActive ? "text-teal-light" : "text-primary-foreground/60"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
export type { Tab };
