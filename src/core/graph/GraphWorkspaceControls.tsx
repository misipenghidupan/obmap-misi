import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Slider } from '@/shared/ui/slider-noinput';
import { Switch } from '@/shared/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { cn } from '@/shared/lib/cn';
import {
  BarChart3,
  Bookmark,
  Check,
  Circle,
  Clock3,
  Focus,
  Frame,
  GitBranch,
  Globe,
  Link2,
  Network,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  UnfoldVertical,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import type { LayoutMode, MindmapOrientation } from './model/graphTypes';
import { useGraphStore } from '@/shared/stores';
import { useGraphInteractionStore } from './model/useGraphInteractionStore';
// Tambahkan import store, UI, dan toast berikut:
import { toast } from 'sonner';
import { Badge } from '@/shared/ui/badge';
import { useGraphTemplatesStore, type GraphTemplate } from '@/shared/stores/useGraphTemplatesStore';

type SettingGroup = 'search' | 'layout' | 'nodes' | 'links' | 'physics' | 'global';
type LabelMode = 'nodes' | 'labels' | 'boxes';

const LABEL_MODES: { value: LabelMode; label: string }[] = [
  { value: 'nodes', label: 'Nodes' },
  { value: 'labels', label: '+ Labels' },
  { value: 'boxes', label: '+ Boxes' },
];

const LAYOUTS: { value: LayoutMode; label: string; icon: typeof Network }[] = [
  { value: 'free-force', label: 'Free force', icon: Network },
  { value: 'mindmap', label: 'Mindmap', icon: GitBranch },
  { value: 'timeline', label: 'Timeline', icon: Clock3 },
  { value: 'fishbone', label: 'Fishbone', icon: SlidersHorizontal },
];

const NODE_SHAPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'hexagon', label: 'Hexagon' },
];

const DAG_MODES = [
  { value: 'null', label: 'None (Organic)' },
  { value: 'td', label: 'Top-Down' },
  { value: 'bu', label: 'Bottom-Up' },
  { value: 'lr', label: 'Left-Right' },
  { value: 'radialin', label: 'Radial In' },
  { value: 'radialout', label: 'Radial Out' },
];

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
  // Kontrol gear: toggle menu icon button ke bawah
  const [isGearOpen, setIsGearOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<SettingGroup | null>(null);

  // 1. Local state untuk input nama template baru
  const [templateName, setTemplateName] = useState('');

  // 2. Selectors Graph Store
  const setConfig = useGraphStore((s) => s.setConfig);

  // 3. Selectors Graph Templates Store
  const templates = useGraphTemplatesStore((s) => s.templates);
  const defaultTemplateId = useGraphTemplatesStore((s) => s.defaultTemplateId);
  const saveTemplate = useGraphTemplatesStore((s) => s.saveTemplate);
  const deleteTemplate = useGraphTemplatesStore((s) => s.deleteTemplate);
  const setDefaultTemplate = useGraphTemplatesStore((s) => s.setDefaultTemplate);

  const config = useGraphStore((s) => s.config);
  const stats = useGraphStore((s) => s.stats);
  const updateNodeConfig = useGraphStore((s) => s.updateNodeConfig);
  const updateLinkConfig = useGraphStore((s) => s.updateLinkConfig);
  const updateForceConfig = useGraphStore((s) => s.updateForceConfig);
  const resetConfig = useGraphStore((s) => s.resetConfig);

  const requestReheat = useGraphInteractionStore((s) => s.requestReheat);
  const requestStop = useGraphInteractionStore((s) => s.requestStop);

  const filterCount =
    Number(minDepth > 0) +
    Number(maxDepth < 10) +
    Number(Boolean(search)) +
    Number(Boolean(contentFilter)) +
    Number(Boolean(tagFilter));

  const togglePanel = (group: SettingGroup) => {
    setActivePanel((curr) => (curr === group ? null : group));
  };

  const labelMode: LabelMode = !config.nodes.showLabels
    ? 'nodes'
    : config.nodes.labelBox
      ? 'boxes'
      : 'labels';

  const setLabelMode = (mode: LabelMode) => {
    if (mode === 'nodes') updateNodeConfig({ showLabels: false, labelBox: false });
    else if (mode === 'labels') updateNodeConfig({ showLabels: true, labelBox: false });
    else updateNodeConfig({ showLabels: true, labelBox: true });
  };

    // Handler 1: Simpan setting saat ini sebagai template baru
  const handleSaveTemplate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = templateName.trim();
    if (!trimmed) {
      toast.error('Masukkan nama template terlebih dahulu');
      return;
    }

    try {
      const newId = saveTemplate(trimmed, config, layout, orientation);
      setTemplateName('');
      toast.success(`Template "${trimmed}" berhasil disimpan`);
    } catch (err) {
      toast.error('Gagal menyimpan template graph');
    }
  };

  // Handler 2: Terapkan template terpilih ke graph saat ini
  const handleApplyTemplate = (template: GraphTemplate) => {
    try {
      // 1. Terapkan konfigurasi node, link, hierarki, dan physics
      setConfig(template.config);

      // 2. Terapkan mode layout dan orientasi bila tersimpan di template
      if (template.layoutMode) {
        onLayoutChange(template.layoutMode);
      }
      if (template.orientation) {
        onOrientationChange(template.orientation);
      }

      toast.success(`Template "${template.name}" diterapkan`);
    } catch (err) {
      toast.error('Gagal menerapkan template');
    }
  };

  // Handler 3: Jadikan template default (untuk tab baru atau vault default)
  const handleToggleDefault = (template: GraphTemplate) => {
    const isCurrentDefault = defaultTemplateId === template.id;
    const nextDefault = isCurrentDefault ? null : template.id;
    setDefaultTemplate(nextDefault);

    if (nextDefault) {
      toast.success(`"${template.name}" dijadikan template default`);
    } else {
      toast.info('Template default dihapus');
    }
  };

  // Handler 4: Hapus template
  const handleDeleteTemplate = (template: GraphTemplate) => {
    deleteTemplate(template.id);
    toast.info(`Template "${template.name}" telah dihapus`);
  };


  return (
    <TooltipProvider delayDuration={200}>
      <div className="pointer-events-none absolute right-2 top-2 z-40 flex flex-row-reverse items-start gap-2.5 sm:right-4 sm:top-4">
        {/* Kolom Tombol Floating Toolbar */}
        <div className="flex w-11 flex-col items-center gap-2">
          {/* Main Gear Button */}
          <div className="pointer-events-auto flex flex-col items-center rounded-lg border border-border/80 bg-card/95 p-1 shadow-xl backdrop-blur-md">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={isGearOpen ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn('relative h-9 w-9 transition-transform duration-200', isGearOpen && 'rotate-45')}
                  aria-label="Toggle Graph Settings Menu"
                  onClick={() => {
                    setIsGearOpen((prev) => !prev);
                    if (isGearOpen) setActivePanel(null);
                  }}
                >
                  <Settings2 className="h-4 w-4" />
                  {filterCount > 0 && !isGearOpen && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {isGearOpen ? 'Collapse Settings' : 'Expand Graph Settings'}
              </TooltipContent>
            </Tooltip>



            {/* Sub-grup Icon Buttons yang muncul ke bawah saat Gear dibuka */}
            {isGearOpen && (
              <div className="mt-1 flex flex-col items-center gap-1 border-t border-border/60 pt-1 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                {/* 1. Search & Filters */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={activePanel === 'search' ? 'secondary' : 'ghost'}
                      size="icon"
                      className={cn('relative h-8 w-8', filterCount > 0 && 'text-primary')}
                      onClick={() => togglePanel('search')}
                      aria-label="Search and Depth Filters"
                    >
                      <Search className="h-4 w-4" />
                      {filterCount > 0 && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Search & Filters</TooltipContent>
                </Tooltip>

                {/* 2. Layout Engine */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={activePanel === 'layout' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePanel('layout')}
                      aria-label="Layout Engine"
                    >
                      <Network className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Layout & Hierarchy</TooltipContent>
                </Tooltip>

                {/* 3. Node Appearance */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={activePanel === 'nodes' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePanel('nodes')}
                      aria-label="Node Appearance"
                    >
                      <Circle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Node Styling & Glow</TooltipContent>
                </Tooltip>

                {/* 4. Link & Particles */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={activePanel === 'links' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePanel('links')}
                      aria-label="Link & Particles"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Link & Particles</TooltipContent>
                </Tooltip>

                {/* 5. Physics & Forces */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={activePanel === 'physics' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePanel('physics')}
                      aria-label="Physics & Forces"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Physics & Forces</TooltipContent>
                </Tooltip>

                {/* 6. global & Stats */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={activePanel === 'global' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-9 w-9"
          onClick={() => togglePanel('global')}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">Graph Global & Templates</TooltipContent>
    </Tooltip>

                {/* Expand All / Clear Focus Indicator */}
    {(collapsedCount > 0 || focused) && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-primary animate-in fade-in zoom-in-90 duration-150"
            aria-label="Show everything"
            onClick={() => {
              onExpandAll();
              onClearFocus();
            }}
          >
            <UnfoldVertical className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          Show everything ({collapsedCount} collapsed)
        </TooltipContent>
      </Tooltip>
    )}
              </div>
            )}
          </div>

          {/* Quick Zoom Actions */}
          <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-lg border border-border/80 bg-card/95 p-1 shadow-xl backdrop-blur-md">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Zoom to fit"
                  onClick={() => onSmartZoom('fit')}
                >
                  <Frame className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Zoom to fit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Zoom to selection"
                  onClick={() => onSmartZoom('selection')}
                >
                  <Focus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Zoom to selection</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Panel Pop-up Konten Pengaturan di Kiri Toolbar */}
        {activePanel && (
          <section className="pointer-events-auto flex max-h-[360px] min-h-[220px] w-[260px] flex-col rounded-lg border border-border/80 bg-card/95 shadow-2xl backdrop-blur-md animate-in fade-in-0 slide-in-from-right-2 duration-150 sm:w-[280px]">
            {/* Header Panel */}
            <header className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold capitalize text-foreground">
                  {activePanel === 'search' && 'Search & Depth'}
                  {activePanel === 'layout' && 'Layout Engine'}
                  {activePanel === 'nodes' && 'Node Appearance'}
                  {activePanel === 'links' && 'Links & Particles'}
                  {activePanel === 'physics' && 'Physics & Forces'}
                  {activePanel === 'global' && 'Graph global'}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setActivePanel(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </header>

            {/* Body Panel dengan Thin Scrollbar */}
            <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.3)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
              {/* 1. SEARCH & DEPTH PANEL */}
              {activePanel === 'search' && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Search by title</Label>
                    <Input
                      value={search}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Type title..."
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 rounded-md bg-secondary/30 p-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium">Depth Level</span>
                      <span className="text-muted-foreground">{minDepth} - {maxDepth}</span>
                    </div>
                    <Slider
                      value={[minDepth, maxDepth]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={([min, max]) => {
                        onMinDepthChange(min);
                        onMaxDepthChange(max);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Content text</Label>
                    <Input
                      value={contentFilter}
                      onChange={(e) => onContentFilterChange(e.target.value)}
                      placeholder="Match content..."
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Tag filter</Label>
                    <Input
                      value={tagFilter}
                      onChange={(e) => onTagFilterChange(e.target.value)}
                      placeholder="#tag..."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* 2. LAYOUT ENGINE PANEL */}
              {activePanel === 'layout' && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Layout Algorithm</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {LAYOUTS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.value}
                            type="button"
                            variant={layout === item.value ? 'secondary' : 'outline'}
                            className="h-9 justify-start px-2 text-xs"
                            onClick={() => onLayoutChange(item.value)}
                          >
                            <Icon className="mr-1.5 h-3.5 w-3.5" />
                            {item.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {layout === 'mindmap' && (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Orientation</Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['balanced', 'radial'] as MindmapOrientation[]).map((val) => (
                          <Button
                            key={val}
                            type="button"
                            variant={orientation === val ? 'secondary' : 'outline'}
                            className="h-8 text-xs capitalize"
                            onClick={() => onOrientationChange(val)}
                          >
                            {val}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Highlight connected path
                    </Label>
                    <Switch
                      checked={highlightPathway}
                      onCheckedChange={onHighlightPathwayChange}
                    />
                  </div>
                </div>
              )}

              {/* 3. NODE APPEARANCE PANEL */}
              {activePanel === 'nodes' && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Shape</Label>
                    <Select
                      value={config.nodes.shape}
                      onValueChange={(val: any) => updateNodeConfig({ shape: val })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NODE_SHAPES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-xs">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Labels display</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {LABEL_MODES.map((item) => (
                        <Button
                          key={item.value}
                          type="button"
                          variant={labelMode === item.value ? 'secondary' : 'outline'}
                          className="h-7 text-[11px]"
                          onClick={() => setLabelMode(item.value)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border/60 pt-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Glowing Nodes</Label>
                      <Switch
                        checked={config.nodes.glow}
                        onCheckedChange={(checked) => updateNodeConfig({ glow: checked })}
                      />
                    </div>

                    {config.nodes.glow && (
                      <div className="space-y-2 rounded-md bg-secondary/30 p-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Intensity</span>
                            <span>{config.nodes.glowIntensity.toFixed(2)}</span>
                          </div>
                          <Slider
                            value={[config.nodes.glowIntensity]}
                            min={0.1}
                            max={1}
                            step={0.05}
                            onValueChange={([v]) => updateNodeConfig({ glowIntensity: v })}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Pulse Speed</span>
                            <span>{config.nodes.glowSpeed === 0 ? 'Static' : `${config.nodes.glowSpeed.toFixed(1)}x`}</span>
                          </div>
                          <Slider
                            value={[config.nodes.glowSpeed]}
                            min={0}
                            max={3}
                            step={0.1}
                            onValueChange={([v]) => updateNodeConfig({ glowSpeed: v })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. LINKS & PARTICLES PANEL */}
              {activePanel === 'links' && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Link Curvature</span>
                      <span>{config.links.curvature.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[config.links.curvature]}
                      min={0}
                      max={0.8}
                      step={0.05}
                      onValueChange={([v]) => updateLinkConfig({ curvature: v })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Link Thickness</span>
                      <span>{config.links.width}px</span>
                    </div>
                    <Slider
                      value={[config.links.width]}
                      min={0.5}
                      max={5}
                      step={0.5}
                      onValueChange={([v]) => updateLinkConfig({ width: v })}
                    />
                  </div>

                  <div className="space-y-2 border-t border-border/60 pt-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Particles Animation</Label>
                      <Switch
                        checked={config.links.showParticles}
                        onCheckedChange={(checked) =>
                          updateLinkConfig({
                            showParticles: checked,
                            ...(checked && config.links.particles < 1 ? { particles: 2 } : {}),
                            ...(checked && config.links.particleSpeed <= 0 ? { particleSpeed: 0.01 } : {}),
                          })
                        }
                      />
                    </div>

                    {config.links.showParticles && (
                      <div className="space-y-2 rounded-md bg-secondary/30 p-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Count / link</span>
                            <span>{config.links.particles}</span>
                          </div>
                          <Slider
                            value={[config.links.particles]}
                            min={1}
                            max={6}
                            step={1}
                            onValueChange={([v]) => updateLinkConfig({ particles: v })}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Flow Speed</span>
                            <span>{config.links.particleSpeed.toFixed(3)}</span>
                          </div>
                          <Slider
                            value={[config.links.particleSpeed]}
                            min={0.002}
                            max={0.05}
                            step={0.002}
                            onValueChange={([v]) => updateLinkConfig({ particleSpeed: v })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. PHYSICS & FORCES PANEL */}
              {activePanel === 'physics' && (
                <div className="space-y-3.5">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={requestReheat}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reheat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={requestStop}
                    >
                      <Pause className="h-3.5 w-3.5" />
                      Freeze
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">DAG Direction</Label>
                    <Select
                      value={config.forces.dagMode}
                      onValueChange={(val: any) => updateForceConfig({ dagMode: val })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAG_MODES.map((d) => (
                          <SelectItem key={d.value} value={d.value} className="text-xs">
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Repulsion</span>
                      <span>{config.forces.chargeStrength}</span>
                    </div>
                    <Slider
                      value={[config.forces.chargeStrength]}
                      min={-1200}
                      max={-20}
                      step={20}
                      onValueChange={([v]) => updateForceConfig({ chargeStrength: v })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Link Distance</span>
                      <span>{config.forces.linkDistance}px</span>
                    </div>
                    <Slider
                      value={[config.forces.linkDistance]}
                      min={20}
                      max={400}
                      step={5}
                      onValueChange={([v]) => updateForceConfig({ linkDistance: v })}
                    />
                  </div>
                </div>
              )}

              {/* 6. GRAPH GLOBAL & TEMPLATES PANEL */}
              {activePanel === 'global' && (
                <div className="space-y-4">
                  {/* Bagian A: Simpan Template Baru */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <Bookmark className="h-3 w-3 text-primary" />
                      <span>Save as Template</span>
                    </div>
                    <form onSubmit={handleSaveTemplate} className="flex gap-1.5">
                      <Input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template name (e.g. Focus Dark)..."
                        className="h-8 text-xs bg-background/50"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 shrink-0 px-2.5 text-xs gap-1"
                        disabled={!templateName.trim()}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Save
                      </Button>
                    </form>
                  </div>

                  {/* Bagian B: Daftar Template Tersimpan */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Saved Templates</span>
                      <span className="font-mono text-[10px]">
                        {Object.keys(templates).length}
                      </span>
                    </div>

                    <div className="max-h-[140px] space-y-1 overflow-y-auto pr-1">
                      {Object.keys(templates).length === 0 ? (
                        <div className="rounded-md border border-dashed border-border/60 p-2.5 text-center text-[11px] text-muted-foreground">
                          Belum ada template tersimpan. Simpan preferensi graph Anda di atas.
                        </div>
                      ) : (
                        Object.values(templates).map((tmpl) => {
                          const isDefault = defaultTemplateId === tmpl.id;
                          return (
                            <div
                              key={tmpl.id}
                              className="group flex items-center justify-between gap-1.5 rounded-md border border-border/50 bg-secondary/20 px-2 py-1.5 transition-colors hover:bg-secondary/40"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-xs font-medium text-foreground">
                                    {tmpl.name}
                                  </span>
                                  {isDefault && (
                                    <Badge
                                      variant="secondary"
                                      className="h-4 px-1 text-[9px] font-mono leading-none text-primary"
                                    >
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {tmpl.layoutMode || 'free-force'} •{' '}
                                  {new Date(tmpl.updatedAt).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex items-center gap-0.5 shrink-0">
                                {/* Tombol Terapkan */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleApplyTemplate(tmpl)}
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Apply Template</TooltipContent>
                                </Tooltip>

                                {/* Tombol Jadikan Default */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        'h-6 w-6',
                                        isDefault
                                          ? 'text-amber-400 hover:text-amber-500'
                                          : 'text-muted-foreground hover:text-foreground'
                                      )}
                                      onClick={() => handleToggleDefault(tmpl)}
                                    >
                                      <Star
                                        className={cn(
                                          'h-3 w-3',
                                          isDefault && 'fill-current'
                                        )}
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {isDefault ? 'Remove Default' : 'Set as Default'}
                                  </TooltipContent>
                                </Tooltip>

                                {/* Tombol Hapus */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteTemplate(tmpl)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Delete Template</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Bagian C: Ringkasan Stats & Reset */}
                  <div className="space-y-2 border-t border-border/40 pt-2.5">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-md border border-border/60 bg-secondary/30 p-1.5">
                        <div className="text-sm font-bold text-foreground">{stats.nodeCount}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Nodes</div>
                      </div>
                      <div className="rounded-md border border-border/60 bg-secondary/30 p-1.5">
                        <div className="text-sm font-bold text-foreground">{stats.totalCount}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Links</div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        resetConfig();
                        toast.info('Graph config dikembalikan ke default bawaan');
                      }}
                    >
                      <RotateCcw className="mr-1.5 h-3 w-3" />
                      Reset to Factory Defaults
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </TooltipProvider>
  );
}