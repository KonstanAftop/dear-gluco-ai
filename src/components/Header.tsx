import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn(
      "w-full gradient-hero", // Uses existing gradient-hero class
      "px-4 py-3",
      "shadow-sm border-b border-teal/10 animate-fade-in",
      className
    )}>
      <div className="flex justify-between items-center">
        {/* Logo di kiri */}
        <div className="flex items-center">
          <img
            src="/dear-gluco-logo.png"
            alt="Dear Gluco"
            className="h-10 w-auto"
          />
        </div>

        {/* User profile section di kanan */}
        <div className="flex items-center gap-3">
          {/* Profile photo mockup */}
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            <User className="h-5 w-5 text-white/80" />
            {/* Atau gunakan avatar mockup */}
            {/* <img
              src="/placeholder.svg"
              alt="User Profile"
              className="h-full w-full object-cover"
            /> */}
          </div>

          {/* Username mockup */}
          <div className="text-white">
            <span className="text-sm font-medium">Sarah Johnson</span>
          </div>

          {/* Logout button */}
          <button className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <LogOut className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;