import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Zap } from "lucide-react";

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required: number;
  balance: number;
}

const PLANS = [
  { name: "Starter", credits: 500, price: "$9" },
  { name: "Creator", credits: 2000, price: "$29" },
  { name: "Studio", credits: 6000, price: "$79" },
];

export function InsufficientCreditsDialog({ open, onOpenChange, required, balance }: InsufficientCreditsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-primary" /> Not enough credits
          </DialogTitle>
          <DialogDescription>
            This generation needs {required} credits and you have {balance}. Top up to keep creating.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          {PLANS.map((p) => (
            <Link
              key={p.name}
              to="/pricing"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted transition"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.credits.toLocaleString()} credits</div>
              </div>
              <div className="font-semibold">{p.price}</div>
            </Link>
          ))}
        </div>

        <Link to="/pricing" onClick={() => onOpenChange(false)}>
          <Button className="w-full btn-gradient text-white border-0 gap-2">
            <Zap className="size-4" /> See all plans
          </Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
