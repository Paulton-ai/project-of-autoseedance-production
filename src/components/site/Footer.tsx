import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-5 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg"><span className="size-8 rounded-lg btn-gradient grid place-items-center"><Sparkles className="size-4 text-white" /></span><span className="gradient-text">Auto Seedance</span></div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">Professional AI image, video, and reel generation platform powered by advanced models.</p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/ai-image-generator" className="hover:text-foreground">AI Image Generator</Link></li>
            <li><Link to="/ai-video-generator" className="hover:text-foreground">AI Video Generator</Link></li>
            <li><Link to="/ai-reel-generator" className="hover:text-foreground">AI Reel Generator</Link></li>
            <li><Link to="/tools/reel-studio" className="hover:text-foreground">Open Reel Studio</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">Learn</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link to="/how-we-test-ai-video-tools" className="hover:text-foreground">How We Test</Link></li>
            <li><a href="/#tools" className="hover:text-foreground">Features</a></li>
            <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Sign up</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">Company & Legal</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            <li><Link to="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground">AI Model Infrastructure</h4>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">Auto Seedance uses leading AI generation models for professional-quality output.</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><li><a href="https://www.byteplus.com/en/solutions/seedance" target="_blank" rel="nofollow noopener noreferrer external" className="text-muted-foreground hover:text-foreground">Seedance 2.0</a></li></ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Auto Seedance. AI generation for creators.</div>
    </footer>
  );
}
