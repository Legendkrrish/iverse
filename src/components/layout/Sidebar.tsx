"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "GST Inventory", href: "/inventory?type=GST", icon: Package },
  { name: "Non-GST Inventory", href: "/inventory?type=NON_GST", icon: Package },
  { name: "TAX Invoice (GST)", href: "/invoice/gst", icon: FileText },
  { name: "Invoice (Non-GST)", href: "/invoice/chalan", icon: FileText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col h-screen glass border-r z-20 sticky top-0 shrink-0">
      <div className="p-6 flex items-center space-x-3">
        <img src="/logo.png" alt="iVerse Logo" className="h-10 w-auto object-contain" />
        <span className="text-xl font-extrabold tracking-tight">iVerse</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} passHref>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-xl transition-all duration-200 text-sm",
                  isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "")} />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button variant="ghost" className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
