import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Search,
  Wallet,
  ShieldAlert,
  Bell,
  Users,
  BarChart3,
  FileText,
  Server,
  Settings,
} from "lucide-react";

interface MenuItem {
  name: string;
  path: string;
  icon: any;
}

const menu: MenuItem[] = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: Activity,
  },
  {
    name: "Investigation",
    path: "/investigation",
    icon: Search,
  },
  {
    name: "Scam & Mule Analysis",
    path: "/scam-analysis",
    icon: ShieldAlert,
  },
  {
    name: "Wallet Intelligence",
    path: "/wallets",
    icon: Wallet,
  },
  {
    name: "Profile & Employee Slot",
    path: "/members",
    icon: Users,
  },
  {
    name: "Alerts Center",
    path: "/alerts",
    icon: Bell,
  },
  {
    name: "Forensic Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Compliance / SAR",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "System Architecture",
    path: "/system",
    icon: Server,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside id="sidebar-nav" className="sidebar">
      <div className="logo">
        <div className="logo-icon">₿</div>

        <div>
          <h2>BitFlow</h2>
          <span>Bitcoin Intelligence</span>
        </div>
      </div>

      <nav>
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              id={`nav-item-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="live-status">
          <span className="live-dot"></span>
          Bitcoin Network Live
        </div>
      </div>
    </aside>
  );
}
