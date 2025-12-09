import { Progress } from "@/components/ui/progress";
import { Cloud, Loader2 } from "lucide-react";

interface SyncProgressBarProps {
  current: number;
  total: number;
  message: string;
}

export const SyncProgressBar = ({ current, total, message }: SyncProgressBarProps) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        <Cloud className="w-4 h-4" />
        <span className="text-sm font-medium">Syncing with Cloud</span>
        <Loader2 className="w-4 h-4 animate-spin ml-auto" />
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{message}</span>
        <span>{current} / {total}</span>
      </div>
    </div>
  );
};
