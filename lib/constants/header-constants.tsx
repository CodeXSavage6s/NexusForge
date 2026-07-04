import { Menu, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";

export const demoUser: NavbarUser = {
  name: "Jordan Blake",
  email: "jordan@nexusforge.dev",
  avatarSrc: "",
};

export const demoMenuItems: NavbarMenuItem[] = [
  { label: "Profile", href: "/profile", icon: <User className="h-4 w-4" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
  //{ label: "Log out", icon: <LogOut className="h-4 w-4" /> },
];

export const demoNavLinks: NavLink[] = [
  { label: "Overview", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Docs", href: "/docs" },
];