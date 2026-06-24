"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  scrolled?: boolean;
};

export function UserMenu({ scrolled = true }: UserMenuProps) {
  const tCommon = useTranslations("common");
  const tAccount = useTranslations("account");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(currentUser);
        setLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div
        className={cn(
          "h-8 w-8 rounded-full border",
          scrolled ? "border-brand-blue/20" : "border-white/20"
        )}
      />
    );
  }

  if (!user) {
    return (
      <Link href="/login" className="hidden sm:block">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            scrolled ? "text-brand-blue hover:bg-accent" : "text-white hover:bg-white/10"
          )}
        >
          <UserIcon className="h-5 w-5" />
        </span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors outline-none",
          scrolled ? "text-brand-blue hover:bg-accent" : "text-white hover:bg-white/10"
        )}
      >
        <UserIcon className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass min-w-44">
        <DropdownMenuItem onClick={() => router.push("/account")}>
          {tCommon("account")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/account/profile")}>
          {tAccount("profile")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          {tCommon("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
