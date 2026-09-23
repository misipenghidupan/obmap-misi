import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import {
  type GraphConfigState,
  type NodeConfig,
  type LinkConfig,
  type ForceConfig,
  type TopologyConfig,
  type HierarchyColorConfig,
  useGraphStore,
} from '@/shared/stores/useGraphStore';
import { useGraphTemplatesStore } from '@/shared/stores/useGraphTemplatesStore';

export interface LeafGraphConfigState {
  config: GraphConfigState;
  activeTemplateId: string | null;
  setNodeConfig: (updater: Partial<NodeConfig> | ((prev: NodeConfig) => Partial<NodeConfig>)) => void;
  setLinkConfig: (updater: Partial<LinkConfig> | ((prev: LinkConfig) => Partial<LinkConfig>)) => void;
  setForceConfig: (updater: Partial<ForceConfig> | ((prev: ForceConfig) => Partial<ForceConfig>)) => void;
  setTopologyConfig: (updater: Partial<TopologyConfig> | ((prev: TopologyConfig) => Partial<TopologyConfig>)) => void;
  setHierarchyConfig: (config: HierarchyColorConfig) => void;
  setFullConfig: (config: GraphConfigState, templateId?: string | null) => void;
  resetToDefault: () => void;
}

export function createLeafGraphConfigStore(initialConfig?: GraphConfigState): StoreApi<LeafGraphConfigState> {
  // Ambil template default jika tersedia, fallback ke defaultGraphConfig dari useGraphTemplatesStore / useGraphStore
  const templatesState = useGraphTemplatesStore.getState();
  const baseConfig: GraphConfigState = initialConfig 
    ? JSON.parse(JSON.stringify(initialConfig))
    : JSON.parse(JSON.stringify(templatesState.getDefaultConfig?.() ?? useGraphStore.getState()));

  return createStore<LeafGraphConfigState>((set) => ({
    config: baseConfig,
    activeTemplateId: templatesState.defaultTemplateId ?? null,

    setNodeConfig: (updater) =>
      set((state) => ({
        config: {
          ...state.config,
          nodes: {
            ...state.config.nodes,
            ...(typeof updater === 'function' ? updater(state.config.nodes) : updater),
          },
        },
      })),

    setLinkConfig: (updater) =>
      set((state) => ({
        config: {
          ...state.config,
          links: {
            ...state.config.links,
            ...(typeof updater === 'function' ? updater(state.config.links) : updater),
          },
        },
      })),

    setForceConfig: (updater) =>
      set((state) => ({
        config: {
          ...state.config,
          forces: {
            ...state.config.forces,
            ...(typeof updater === 'function' ? updater(state.config.forces) : updater),
          },
        },
      })),

    setTopologyConfig: (updater) =>
      set((state) => ({
        config: {
          ...state.config,
          topology: {
            ...state.config.topology,
            ...(typeof updater === 'function' ? updater(state.config.topology) : updater),
          },
        },
      })),

    setHierarchyConfig: (hierarchy) =>
      set((state) => ({
        config: {
          ...state.config,
          hierarchy,
        },
      })),

    setFullConfig: (newConfig, templateId = null) =>
      set({
        config: JSON.parse(JSON.stringify(newConfig)),
        activeTemplateId: templateId,
      }),

    resetToDefault: () => {
      const freshTemplatesState = useGraphTemplatesStore.getState();
      const freshDefault = freshTemplatesState.getDefaultConfig?.() ?? useGraphStore.getState();
      set({
        config: JSON.parse(JSON.stringify(freshDefault)),
        activeTemplateId: freshTemplatesState.defaultTemplateId ?? null,
      });
    },
  }));
}

const LeafGraphConfigContext = createContext<StoreApi<LeafGraphConfigState> | null>(null);

export function LeafGraphConfigProvider({
  store,
  children,
}: {
  store: StoreApi<LeafGraphConfigState>;
  children: ReactNode;
}) {
  return createElement(LeafGraphConfigContext.Provider, { value: store }, children);
}

export function useLeafGraphConfigApi(): StoreApi<LeafGraphConfigState> | null {
  return useContext(LeafGraphConfigContext);
}

export function useLeafGraphConfig(): GraphConfigState;
export function useLeafGraphConfig<T>(selector: (state: LeafGraphConfigState) => T): T;
export function useLeafGraphConfig<T>(selector?: (state: LeafGraphConfigState) => T) {
  const store = useContext(LeafGraphConfigContext);
  if (!store) {
    // Fallback ke global store bila dipanggil di luar leaf graph tab
    const globalState = useGraphStore();
    return selector ? selector({
      config: globalState,
      activeTemplateId: null,
      setNodeConfig: globalState.setNodeConfig,
      setLinkConfig: globalState.setLinkConfig,
      setForceConfig: globalState.setForceConfig,
      setTopologyConfig: globalState.setTopologyConfig,
      setHierarchyConfig: globalState.setHierarchyConfig,
      setFullConfig: () => {},
      resetToDefault: globalState.resetConfig,
    }) : globalState;
  }
  return useStore(store, (selector ?? ((s) => s.config)) as (s: LeafGraphConfigState) => T);
}