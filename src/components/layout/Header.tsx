"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, X, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navItems } from "./Sidebar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="h-16 px-4 md:px-6 glass flex items-center justify-between sticky top-0 z-30 border-b border-border/50">
        {/* Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl h-10 w-10 p-0"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="iVerse Logo" className="h-8 w-auto object-contain" />
            <span className="font-extrabold text-lg tracking-tight">iVerse</span>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="flex-1 hidden md:flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Invoice, Customer, Mobile..." 
              className="pl-10 bg-black/5 dark:bg-white/5 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary h-10 w-full text-sm"
            />
          </div>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button type="button" className="rounded-full relative bg-transparent hover:bg-black/5 dark:hover:bg-white/5 p-2">
            <Bell className="h-5 w-5 text-foreground/80" />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-destructive rounded-full border border-card"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center outline-none border-none cursor-pointer">
              <Avatar className="h-9 w-9 pointer-events-none">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-panel rounded-xl mt-1" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@iverse.store
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Billing Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-4/5 max-w-xs bg-background glass h-full border-r border-border/50 flex flex-col z-50 p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="iVerse Logo" className="h-8 w-auto object-contain" />
                <span className="text-lg font-extrabold tracking-tight">iVerse Store</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start rounded-xl text-sm py-2.5 my-0.5",
                        isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                      )}
                    >
                      <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "")} />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border/50">
              <Button variant="ghost" className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10">
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
