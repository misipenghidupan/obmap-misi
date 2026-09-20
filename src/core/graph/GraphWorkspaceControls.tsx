import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Slider } from '@/shared/ui/slider';
import { Switch } from '@/shared/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/cn';
import {
  Clock3,
  Filter,
  Focus,
  Frame,
  GitBranch,
  Network,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  UnfoldVertical,
  X,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import type { LayoutMode, MindmapOrientation } from './model/graphTypes';
import { useWorkspaceStore } from '../shell/workspace/store/useWorkspaceStore';

const LAYOUTS: { value: LayoutMode; label: string; icon: typeof Network }[] = [
  { value: 'mindmap', label: 'Mindmap', icon: GitBranch },
  { value: 'timeline', label: 'Timeline', icon: Clock3 },
  { value: 'fishbone', label: 'Fishbone', icon: SlidersHorizontal },
  { value: 'free-force', label: 'Free force', icon: Network },
];

type Panel = 'options' | 'search-filters' | 'zoom';

export type SmartZoomAction = 'fit' | 'selection' | 'reset';

interface GraphWorkspaceControlsProps {
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  orientation: MindmapOrientation;
  onOrientationChange: (orientation: MindmapOrientation) => void;
  highlightPathway: boolean;
  onHighlightPathwayChange: (value: boolean) => void;
  collapsedCount: number;
  onExpandAll: () => void;
  focused: boolean;
  onClearFocus: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  minDepth: number;
  onMinDepthChange: (value: number) => void;
  maxDepth: number;
  onMaxDepthChange: (value: number) => void;
  contentFilter: string;
  onContentFilterChange: (value: string) => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
  onSmartZoom: (action: SmartZoomAction) => void;
}

export function GraphWorkspaceControls({
  layout,
  onLayoutChange,
  orientation,
  onOrientationChange,
  highlightPathway,
  onHighlightPathwayChange,
  collapsedCount,
  onExpandAll,
  focused,
  onClearFocus,
  search,
  onSearchChange,
  minDepth,
  onMinDepthChange,
  maxDepth,
  onMaxDepthChange,
  contentFilter,
  onContentFilterChange,
  tagFilter,
  onTagFilterChange,
  onSmartZoom,
}: GraphWorkspaceControlsProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const filterCount = 
    Number(minDepth > 0) + 
    Number(maxDepth < 10) + 
    Number(Boolean(search)) +
    Number(Boolean(contentFilter)) + 
    Number(Boolean(tagFilter));

  const togglePanel = (next: Panel) => setPanel((current) => current === next ? null : next);

  const openSettings = () => {
    useWorkspaceStore.getState().openView({ 
      type: 'settings', 
      settingsSection: 'graph', 
      title: 'Settings' 
    });
    setPanel(null);
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div className="pointer-events-none absolute right-2 top-2 z-40 flex flex-row-reverse items-start gap-2 sm:right-4 sm:top-4">
        <div className="flex w-11 flex-col gap-2">
          <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-md border border-border/80 bg-card/95 p-1 shadow-xl backdrop-blur-md">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={panel === 'options' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Graph options"
                  aria-pressed={panel === 'options'}
                  onClick={() => togglePanel('options')}
                >
                  <Network className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Graph options</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={panel === 'search-filters' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn('relative h-9 w-9', filterCount > 0 && 'text-primary')}
                  aria-label="Search and filters"
                  aria-pressed={panel === 'search-filters'}
                  onClick={() => togglePanel('search-filters')}
                >
                  <Search className="h-4 w-4" />
                  {filterCount > 0 && (
                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Search and filters</TooltipContent>
            </Tooltip>

            {(collapsedCount > 0 || focused) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-primary"
                    aria-label="Show everything"
                    onClick={() => {
                      onExpandAll();
                      onClearFocus();
                    }}
                  >
                    <UnfoldVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Show everything</TooltipContent>
              </Tooltip>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={panel === 'zoom' ? 'secondary' : 'outline'}
                size="icon"
                className="pointer-events-auto h-11 w-11 border-border/80 bg-card/95 shadow-xl backdrop-blur-md"
                aria-label="Smart zoom controls"
                aria-pressed={panel === 'zoom'}
                onClick={() => togglePanel('zoom')}
              >
                <Frame className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Smart zoom</TooltipContent>
          </Tooltip>
        </div>

        {panel && (
          <section className="pointer-events-auto w-[min(18rem,calc(100vw-5.5rem))] max-h-[calc(100%-1rem)] overflow-y-auto rounded-md border border-border/80 bg-card/95 shadow-2xl backdrop-blur-md animate-in fade-in-0 slide-in-from-right-2 duration-150">
            <header className="flex h-11 items-center justify-between border-b border-border px-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {panel === 'options' ? 'Graph options' : panel === 'search-filters' ? 'Search & Filters' : 'Smart zoom'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {panel === 'options' ? 'Adjust appearance and layout' : panel === 'search-filters' ? 'Find nodes and narrow the network' : 'Frame the graph or selection'}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPanel(null)} aria-label="Close graph tools">
                <X className="h-3.5 w-3.5" />
              </Button>
            </header>

            <div className="p-3">
              {panel === 'options' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-1.5">
                    {LAYOUTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.value}
                          type="button"
                          variant={layout === item.value ? 'secondary' : 'ghost'}
                          className="h-10 justify-start px-3 text-xs"
                          onClick={() => onLayoutChange(item.value)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>

                  {layout === 'mindmap' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['balanced', 'radial'] as MindmapOrientation[]).map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant={orientation === value ? 'secondary' : 'outline'}
                          className="h-9 text-xs capitalize"
                          onClick={() => onOrientationChange(value)}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 border-t pt-3">
                    <Label htmlFor="graph-pathway" className="flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                      Highlight connected path
                    </Label>
                    <Switch
                      id="graph-pathway"
                      checked={highlightPathway}
                      onCheckedChange={onHighlightPathwayChange}
                    />
                  </div>

                  {(collapsedCount > 0 || focused) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onExpandAll();
                        onClearFocus();
                      }}
                    >
                      Show everything
                      {collapsedCount > 0 ? ` (${collapsedCount} collapsed)` : ''}
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 border-t pt-3 rounded-none h-auto py-2"
                    onClick={openSettings}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span className="text-xs">Engine settings</span>
                  </Button>
                </div>
              )}

              {panel === 'search-filters' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={search}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder="Search node names…"
                      className="h-10 bg-secondary/60 pl-9"
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Depth range</Label>
                        <span className="text-xs tabular-nums text-primary">{minDepth} – {maxDepth}</span>
                      </div>
                      <div className="mt-3 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Min depth</span>
                            <span>{minDepth}</span>
                          </div>
                          <Slider value={[minDepth]} min={0} max={10} step={1} onValueChange={([value]) => onMinDepthChange(value)} />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Max depth</span>
                            <span>{maxDepth}</span>
                          </div>
                          <Slider value={[maxDepth]} min={0} max={10} step={1} onValueChange={([value]) => onMaxDepthChange(value)} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="graph-content-filter" className="text-xs">Content</Label>
                      <Input id="graph-content-filter" value={contentFilter} onChange={(event) => onContentFilterChange(event.target.value)} placeholder="Filter note content…" className="mt-1.5 h-9 bg-secondary/60" />
                    </div>
                    <div>
                      <Label htmlFor="graph-tag-filter" className="text-xs">Tags</Label>
                      <Input id="graph-tag-filter" value={tagFilter} onChange={(event) => onTagFilterChange(event.target.value)} placeholder="Filter tags…" className="mt-1.5 h-9 bg-secondary/60" />
                    </div>
                    {filterCount > 0 && (
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => {
                        onSearchChange('');
                        onMinDepthChange(0);
                        onMaxDepthChange(10);
                        onContentFilterChange('');
                        onTagFilterChange('');
                      }}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {panel === 'zoom' && (
                <div className="space-y-1">
                  <Button type="button" variant="ghost" className="h-auto w-full justify-start gap-3 py-2.5" onClick={() => { onSmartZoom('fit'); setPanel(null); }}>
                    <Frame className="h-4 w-4 shrink-0" />
                    <span className="text-left"><span className="block text-xs font-medium">Zoom-to-Fit</span><span className="block text-[10px] text-muted-foreground">Fit the entire graph</span></span>
                  </Button>
                  <Button type="button" variant="ghost" className="h-auto w-full justify-start gap-3 py-2.5" onClick={() => { onSmartZoom('selection'); setPanel(null); }}>
                    <Focus className="h-4 w-4 shrink-0" />
                    <span className="text-left"><span className="block text-xs font-medium">Zoom-to-Selection</span><span className="block text-[10px] text-muted-foreground">Focus selected nodes</span></span>
                  </Button>
                  <Button type="button" variant="ghost" className="h-auto w-full justify-start gap-3 py-2.5" onClick={() => { onSmartZoom('reset'); setPanel(null); }}>
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    <span className="text-left"><span className="block text-xs font-medium">Reset Zoom</span><span className="block text-[10px] text-muted-foreground">Return to 100%</span></span>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </TooltipProvider>
  );
}
