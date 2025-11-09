import {
  Home,
  Users,
  Shield,
  Award,
  Settings,
  UserCircle,
  FileText,
  History,
} from "lucide-react";
import type { NavigationItem } from "@/types";

export const adminNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin-dashboard", icon: Home },
  { name: "Users", href: "/users", icon: UserCircle },
  { name: "Screening", href: "/screening", icon: Users },
  { name: "Blockchain Records", href: "/blockchain", icon: Shield },
  { name: "Awarding", href: "/awarding", icon: Award },
  { name: "Settings", href: "/admin-settings", icon: Settings },
];

export const userNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/user-dashboard", icon: Home },
  { name: "Application", href: "/application", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/user-settings", icon: Settings },
];
