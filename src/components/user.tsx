/** biome-ignore-all lint/performance/noImgElement: <images are required> */
"use client";

import {
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/lib/auth-client";

export function User() {
  const router = useRouter();
  const session = authClient.useSession();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (_error) {
      toast.error("Failed to sign out");
    }
  };

  if (!session?.data?.user) {
    return (
      <Button asChild variant="outline">
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  const user = session.data.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          size="icon"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            {user.image ? (
              <img
                src={user.image}
                alt={user.email || "User"}
                className="h-6 w-6 rounded-full object-cover"
                width={24}
                height={24}
              />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            {user.image ? (
              <img
                src={user.image}
                alt={user.email || "User"}
                className="h-6 w-6 rounded-full object-cover"
                width={24}
                height={24}
              />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">
              {user.name || "User"}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <SunIcon className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <MoonIcon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <MonitorIcon className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
