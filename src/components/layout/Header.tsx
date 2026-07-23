"use client";

import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="h-16 px-6 glass flex items-center justify-between sticky top-0 z-10 border-b border-border/50">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Invoice, Customer, Mobile..." 
            className="pl-10 bg-black/5 dark:bg-white/5 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary h-10 w-full"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
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
  );
}
