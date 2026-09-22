export type ModuleCategory = 'system' | 'shell' | 'workspace' | 'editor' | 'graph' | 'settings';

export interface ModuleDefinition {
  id: string;
  name: string;
  category: ModuleCategory;
  loader: () => Promise<unknown>;
}

export interface LoadedModuleRecord {
  id: string;
  name: string;
  category: ModuleCategory;
  durationMs: number;
  sizeKb?: number;
}

export interface PreloadProgressState {
  currentIndex: number;
  totalModules: number;
  currentModuleName: string;
  currentCategory: ModuleCategory;
  overallPercent: number;
  currentModulePercent: number;
  completed: LoadedModuleRecord[];
  slowestModule: LoadedModuleRecord | null;
  heaviestModule: LoadedModuleRecord | null;
  isComplete: boolean;
}

// 30 Modul Utama ObMap dari 6 Kategori
export const PRELOAD_MODULES: ModuleDefinition[] = [
  // --- 1. SYSTEM (5 Modul) ---
  {
    id: 'sys-di',
    name: 'DI Container & Event Bus',
    category: 'system',
    loader: () => import('@/shared/di/container'),
  },
  {
    id: 'sys-vault-mgr',
    name: 'Vault Manager Engine',
    category: 'system',
    loader: () => import('@/core/system/vault/VaultManagerSingleton'),
  },
  {
    id: 'sys-fs',
    name: 'File System & Persistence Service',
    category: 'system',
    loader: () => import('@/core/system/persistence/FileSystemServiceSingleton'),
  },
  {
    id: 'sys-sync',
    name: 'Sync Engine & Conflict Coordinator',
    category: 'system',
    loader: () => import('@/core/system/sync/SyncEngine'),
  },
  {
    id: 'sys-meta',
    name: 'Metadata Cache & Markdown Parser',
    category: 'system',
    loader: () => import('@/core/system/metadata/MetadataCache'),
  },

  // --- 2. SHELL (5 Modul) ---
  {
    id: 'shell-ribbon',
    name: 'Activity Ribbon & Icon Navigation',
    category: 'shell',
    loader: () => import('@/core/shell/workspace/Ribbon'),
  },
  {
    id: 'shell-sidebar',
    name: 'Vault Explorer & Tree Panel',
    category: 'shell',
    loader: () => import('@/core/shell/workspace/SidebarPanel'),
  },
  {
    id: 'shell-statusbar',
    name: 'System Status & Breadcrumbs',
    category: 'shell',
    loader: () => import('@/core/shell/workspace/StatusBar'),
  },
  {
    id: 'shell-palette',
    name: 'Fuzzy Command Palette Engine',
    category: 'shell',
    loader: () => import('@/core/shell/command-palette/CommandPalette'),
  },
  {
    id: 'shell-auth',
    name: 'Supabase Auth & Session Provider',
    category: 'shell',
    loader: () => import('@/core/shell/auth/hooks/useAuth'),
  },

  // --- 3. WORKSPACE (5 Modul) ---
  {
    id: 'ws-tree',
    name: 'Workspace Split Tree & Layout',
    category: 'workspace',
    loader: () => import('@/core/shell/workspace/WorkspaceTree'),
  },
  {
    id: 'ws-group',
    name: 'Tab Group & Keep-Alive Manager',
    category: 'workspace',
    loader: () => import('@/core/shell/workspace/WorkspaceGroup'),
  },
  {
    id: 'ws-registry',
    name: 'Workspace View Registry',
    category: 'workspace',
    loader: () => import('@/core/shell/workspace/ViewRegistry'),
  },
  {
    id: 'ws-backlinks-view',
    name: 'Backlinks & Unlinked Mentions Leaf',
    category: 'workspace',
    loader: () => import('@/core/shell/workspace/views/BacklinksLeaf'),
  },
  {
    id: 'ws-empty',
    name: 'Quick Action Empty Leaf',
    category: 'workspace',
    loader: () => import('@/core/shell/workspace/views/EmptyLeaf'),
  },

  // --- 4. EDITOR (5 Modul) ---
  {
    id: 'ed-cm-core',
    name: 'CodeMirror 6 Core Engine & Setup',
    category: 'editor',
    loader: () => import('@/core/editor/cm/setup'),
  },
  {
    id: 'ed-markdown-view',
    name: 'Markdown Live Preview View',
    category: 'editor',
    loader: () => import('@/core/editor/MarkdownView'),
  },
  {
    id: 'ed-frontmatter',
    name: 'YAML Frontmatter Properties Panel',
    category: 'editor',
    loader: () => import('@/core/editor/frontmatter/PropertiesPanel'),
  },
  {
    id: 'ed-suggest',
    name: 'Wikilink & Tag Autocomplete Suggester',
    category: 'editor',
    loader: () => import('@/core/editor/suggest/suggestions'),
  },
  {
    id: 'ed-heading-fold',
    name: 'Hierarchical Heading Folding Engine',
    category: 'editor',
    loader: () => import('@/core/editor/headings/headingTree'),
  },

  // --- 5. GRAPH (5 Modul) ---
  {
    id: 'graph-canvas',
    name: 'WebGL & Canvas 2D Force Engine',
    category: 'graph',
    loader: () => import('@/core/graph/GraphCanvas'),
  },
  {
    id: 'graph-layouts',
    name: 'Layout Engines (Mindmap, Timeline, Fishbone)',
    category: 'graph',
    loader: () => import('@/core/graph/layout/useLayoutEngine'),
  },
  {
    id: 'graph-projection',
    name: 'Graph Topology & Projection Model',
    category: 'graph',
    loader: () => import('@/core/graph/model/buildGraphProjection'),
  },
  {
    id: 'graph-controls',
    name: 'Floating Workspace Controls & Depth Filters',
    category: 'graph',
    loader: () => import('@/core/graph/GraphWorkspaceControls'),
  },
  {
    id: 'graph-config',
    name: 'Graph Visual Styling & Engine Panel',
    category: 'graph',
    loader: () => import('@/core/graph/config-panel'),
  },

  // --- 6. UNIVERSAL SETTINGS (5 Modul) ---
  {
    id: 'set-hub',
    name: 'Universal Settings Hub Modal',
    category: 'settings',
    loader: () => import('@/core/shell/settings/SettingsHub'),
  },
  {
    id: 'set-vault',
    name: 'Per-Vault Configuration & Storage Panel',
    category: 'settings',
    loader: () => import('@/core/shell/settings/sections/VaultSettings'),
  },
  {
    id: 'set-graph-engine',
    name: 'Graph Engine & Physics Tuner Panel',
    category: 'settings',
    loader: () => import('@/core/shell/settings/sections/GraphEngineSettings'),
  },
  {
    id: 'set-schema',
    name: 'Schema Definition & Properties Settings',
    category: 'settings',
    loader: () => import('@/core/shell/settings/sections/SchemaSettings'),
  },
  {
    id: 'set-features',
    name: 'Plugin & Feature Toggles Manager',
    category: 'settings',
    loader: () => import('@/core/shell/settings/FeatureTogglesPanel'),
  },
];

export async function runModulePreloader(
  onProgress: (state: PreloadProgressState) => void
): Promise<LoadedModuleRecord[]> {
  const total = PRELOAD_MODULES.length;
  const completed: LoadedModuleRecord[] = [];
  let slowest: LoadedModuleRecord | null = null;
  let heaviest: LoadedModuleRecord | null = null;

  for (let i = 0; i < total; i++) {
    const mod = PRELOAD_MODULES[i];
    const initialOverall = Math.round((i / total) * 100);

    // Update state awal saat modul mulai dimuat
    onProgress({
      currentIndex: i + 1,
      totalModules: total,
      currentModuleName: mod.name,
      currentCategory: mod.category,
      overallPercent: initialOverall,
      currentModulePercent: 15,
      completed,
      slowestModule: slowest,
      heaviestModule: heaviest,
      isComplete: false,
    });

    const startPerf = performance.now();

    // Step mikro-animasi agar progress bar per-modul bergerak halus
    const timer = setInterval(() => {
      onProgress({
        currentIndex: i + 1,
        totalModules: total,
        currentModuleName: mod.name,
        currentCategory: mod.category,
        overallPercent: initialOverall,
        currentModulePercent: Math.min(85, 15 + Math.random() * 60),
        completed,
        slowestModule: slowest,
        heaviestModule: heaviest,
        isComplete: false,
      });
    }, 40);

    try {
      await mod.loader();
    } catch (err) {
      console.warn(`[Preloader] Gagal preloading modul: ${mod.name}`, err);
    } finally {
      clearInterval(timer);
    }

    const durationMs = Math.round((performance.now() - startPerf) * 10) / 10;

    // Estimasi ukuran chunk dari Resource Timing API jika tersedia
    let sizeKb: number | undefined;
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const matched = entries.filter((e) => e.name.includes('.js') || e.name.includes('.ts'));
    if (matched.length > 0) {
      const latest = matched[matched.length - 1];
      if (latest && latest.encodedBodySize > 0) {
        sizeKb = Math.round((latest.encodedBodySize / 1024) * 10) / 10;
      }
    }

    const record: LoadedModuleRecord = {
      id: mod.id,
      name: mod.name,
      category: mod.category,
      durationMs,
      sizeKb,
    };

    completed.push(record);

    if (!slowest || durationMs > slowest.durationMs) {
      slowest = record;
    }
    if (sizeKb && (!heaviest || (heaviest.sizeKb ?? 0) < sizeKb)) {
      heaviest = record;
    }

    const finalOverall = Math.round(((i + 1) / total) * 100);

    onProgress({
      currentIndex: i + 1,
      totalModules: total,
      currentModuleName: mod.name,
      currentCategory: mod.category,
      overallPercent: finalOverall,
      currentModulePercent: 100,
      completed: [...completed],
      slowestModule: slowest,
      heaviestModule: heaviest,
      isComplete: i === total - 1,
    });

    // Jeda mikro antar-modul agar render browser tetap fluid
    await new Promise((r) => setTimeout(r, 16));
  }

  return completed;
}