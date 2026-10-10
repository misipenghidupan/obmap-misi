/** Bottom bar: active file path, dynamic notices, sync and offline state. */

import { Cloud, CloudOff, Loader2, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { useOfflineStore } from "@/shared/stores";
import { useStatusNoticeStore } from "@/shared/stores/useStatusNoticeStore";
import { useVaultSession } from "./VaultSessionContext";
import { useWorkspaceStore } from "./store/useWorkspaceStore";

const statusIcon = {
  idle: Cloud,
  saving: Loader2,
  saved: Check,
  error: AlertCircle,
} as const;

export function StatusBar() {
  const { nodes, saveStatus } = useVaultSession();
  const activeLeaf = useWorkspaceStore((s) => s.getActiveLeaf());
  const isOnline = useOfflineStore((s) => s.isOnline);
  const notice = useStatusNoticeStore((s) => s.notice);

  const node = activeLeaf?.view.nodeId
    ? nodes.find((n) => n.id === activeLeaf.view.nodeId)
    : null;
  const words = node?.content
    ? node.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const StatusIcon = statusIcon[saveStatus] ?? Cloud;

  return (
    <div className="relative h-6 shrink-0 flex items-center justify-between px-3 border-t border-border bg-muted/30 text-[11px] text-muted-foreground select-none overflow-hidden">
      
      {/* ========================================================================= */}
      {/* KIRI: DYNAMIC NOTIFICATION TEXT DENGAN OVERFLOW SHADOW                    */}
      {/* ========================================================================= */}
      <div className="relative flex items-center min-w-0 max-w-[calc(100vw-220px)] sm:max-w-md overflow-hidden">
        {notice ? (
          <div className="relative flex items-center gap-1.5 text-foreground font-medium truncate pr-6 animate-in fade-in-50 slide-in-from-bottom-1 duration-200">
            <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{notice}</span>

            {/* OVERFLOW SHADOW: Gradien pudar halus di tepi kanan bila teks sangat panjang */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/95 to-transparent" />
          </div>
        ) : (
          node && <span className="text-muted-foreground truncate">{words} words</span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* KANAN: INDIKATOR SAVED & ONLINE                                           */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-4 shrink-0 pl-2">
        <span className="flex items-center gap-1">
          <StatusIcon
            className={
              saveStatus === "saving" ? "w-3 h-3 animate-spin" : "w-3 h-3"
            }
          />
          {saveStatus}
        </span>

        <span className="flex items-center gap-1">
          {isOnline ? (
            <Cloud className="w-3 h-3" />
          ) : (
            <CloudOff className="w-3 h-3" />
          )}
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}