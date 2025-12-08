import { Home, MessageCircle, Search, PlusCircle, LayoutDashboard, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: PlusCircle, label: "Create", path: "/create" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Contacts", path: "/contacts" },
];

const BottomNav = () => {
  return (
    <nav className="nav-bottom">
      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn("nav-item", isActive && "active")
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={cn(
                    "nav-icon w-5 h-5 transition-all duration-300",
                    isActive && "text-neon-cyan"
                  )} 
                />
                <span className="text-xs hidden sm:block">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
