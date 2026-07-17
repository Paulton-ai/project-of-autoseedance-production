import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, Video, LayoutDashboard, LogOut, ChevronDown, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/lib/auth";
import { fetchPostsCount } from "@/lib/sanity";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Tables<"credit_wallets"> | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchWallet = useCallback(async (uid: string) => {
    const { data } = await supabase.from("credit_wallets").select("*").eq("user_id", uid).maybeSingle();
    setWallet(data as Tables<"credit_wallets"> | null);
  }, []);

  const { data: postsCount = 0 } = useQuery({
    queryKey: ["sanity", "posts", "count"],
    queryFn: fetchPostsCount,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let currentUid: string | null = null;

    const setupRealtime = (uid: string) => {
      if (channel) supabase.removeChannel(channel);
      channel = supabase
        .channel(`wallet-changes-navbar-${uid}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "credit_wallets", filter: `user_id=eq.${uid}` },
          () => { fetchWallet(uid); },
        )
        .subscribe();
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        currentUid = data.user.id;
        fetchWallet(data.user.id);
        setupRealtime(data.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        currentUid = session.user.id;
        fetchWallet(session.user.id);
        setupRealtime(session.user.id);
      } else {
        setWallet(null);
        if (channel) { supabase.removeChannel(channel); channel = null; }
      }
    });

    const onFocus = () => { if (currentUid) fetchWallet(currentUid); };
    window.addEventListener("focus", onFocus);

    return () => {
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchWallet]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await signOut();
    setDropdownOpen(false);
    navigate({ to: "/", replace: true });
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 mt-4">
        <div className="glass rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg shrink-0">
            <span className="size-8 rounded-lg btn-gradient grid place-items-center">
              <Sparkles className="size-4 text-white" />
            </span>
            <span className="gradient-text">Auto Seedance</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="/#features" className="hover:text-foreground transition">Features</a>
            <Link to="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link to="/tools/image" className="hover:text-foreground transition flex items-center gap-1.5">
              <ImageIcon className="size-3.5" /> Image Generation
            </Link>
            <Link to="/tools/video" className="hover:text-foreground transition flex items-center gap-1.5">
              <Video className="size-3.5" /> Video Generation
            </Link>
            {postsCount > 0 && (
              <Link to="/blog" className="hover:text-foreground transition">Blog</Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {wallet && (
                  <Link to="/dashboard/credits" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition text-sm">
                    <Coins className="size-3.5 text-primary" />
                    <span className="font-medium">{wallet.balance.toLocaleString()}</span>
                  </Link>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition text-sm"
                  >
                    <div className="size-7 rounded-full btn-gradient grid place-items-center text-white text-xs font-bold">
                      {initials}
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg overflow-hidden z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                      >
                        <LayoutDashboard className="size-4 text-muted-foreground" /> Dashboard
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                      >
                        <Coins className="size-4 text-muted-foreground" /> Profile
                      </Link>
                      <Link
                        to="/dashboard/credits"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                      >
                        <Coins className="size-4 text-muted-foreground" /> Credits
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition text-left text-destructive"
                      >
                        <LogOut className="size-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <Button size="sm" className="btn-gradient text-white border-0">Start Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
