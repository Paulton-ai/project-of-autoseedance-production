import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Sparkles, Coins, LogOut, User, Crown } from "lucide-react";
import { signOut } from "@/lib/auth";

interface ToolNavbarProps { title: string; }

export function ToolNavbar({ title }: ToolNavbarProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchWallet = useCallback(async (uid: string) => {
    const { data } = await supabase.from("credit_wallets").select("balance").eq("user_id", uid).maybeSingle();
    setBalance(data?.balance ?? 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    fetchWallet(uid);
    supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle().then(({ data }) => setIsAdmin(!!data));
    const channel = supabase.channel(`wallet-changes-toolnavbar-${uid}`).on("postgres_changes", { event: "*", schema: "public", table: "credit_wallets", filter: `user_id=eq.${uid}` }, () => { fetchWallet(uid); }).subscribe();
    const onFocus = () => { fetchWallet(uid); };
    window.addEventListener("focus", onFocus);
    return () => { supabase.removeChannel(channel); window.removeEventListener("focus", onFocus); };
  }, [user, fetchWallet]);

  const initials = user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button type="button" onClick={() => navigate({ to: user ? "/dashboard" : "/" })} aria-label="Back to dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"><ArrowLeft className="size-5" /></button>
          <Link to="/" className="flex items-center gap-2 font-display font-bold shrink-0"><span className="size-8 rounded-lg btn-gradient grid place-items-center"><Sparkles className="size-4 text-white" /></span><span className="gradient-text hidden sm:inline">Auto Seedance</span></Link>
          <span className="text-muted-foreground hidden sm:inline">|</span><span className="font-medium truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!user ? <><Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link><Link to="/signup"><Button size="sm" className="btn-gradient text-white border-0">Start Free</Button></Link></> : <>
            {balance !== null && <Link to="/dashboard/credits" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border hover:bg-muted transition"><>{isAdmin ? <Crown className="size-4 text-amber-500" /> : <Coins className="size-4 text-primary" />}</><span className="font-semibold">{isAdmin ? "∞" : balance}</span><span className="text-xs text-muted-foreground hidden sm:inline">{isAdmin ? "Unlimited" : "credits"}</span></Link>}
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="relative size-9 rounded-full"><Avatar className="size-9"><AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} /><AvatarFallback className="btn-gradient text-white">{initials}</AvatarFallback></Avatar></Button></DropdownMenuTrigger><DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal"><div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">{user.user_metadata?.display_name || "User"}</p><p className="text-xs leading-none text-muted-foreground">{user.email}</p></div></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/dashboard" className="cursor-pointer"><User className="mr-2 size-4" /> Dashboard</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/credits" className="cursor-pointer"><Coins className="mr-2 size-4" /> Credits</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard/profile" className="cursor-pointer"><User className="mr-2 size-4" /> Profile</Link></DropdownMenuItem>
              <DropdownMenuSeparator /><DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive"><LogOut className="mr-2 size-4" /> Log out</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
          </>}
        </div>
      </div>
    </header>
  );
}