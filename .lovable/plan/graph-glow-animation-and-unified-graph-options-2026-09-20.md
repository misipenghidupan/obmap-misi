# Graph glow animation and unified graph options

## Goal
Make the floating graph tools more compact and capable while keeping every visual choice in the existing per-vault graph configuration.

## Changes

### 1. Animated glowing nodes
- Add a persisted glow toggle plus restrained glow intensity and animation speed controls to node settings.
- Render a soft pulsing halo around visible nodes, using each node’s resolved color.
- Keep selected and hovered states clear, avoid changing hit areas or layout measurements, and disable pulsing when reduced motion is requested.
- Keep canvas redraws active only while glow or particles are animated.

### 2. Unified search and filters
- Replace the separate Search and Filter floating buttons with one combined panel.
- Keep name, content, and tag filtering together in that panel.
- Replace maximum-only depth filtering with a two-handle minimum/maximum level range, clamping the values so the range always remains valid.
- Show an active indicator when any search or filter is applied and reset the full group with one action.

### 3. Rename and expand Graph Options
- Rename the current “Graph layout” button and panel to “Graph options.”
- Keep layout and mindmap orientation controls.
- Add practical force controls for the free-force view, connected to the existing force configuration rather than duplicating settings.
- Add switches for glowing mode and particle animation, with particle defaults that become visible immediately when enabled.
- Add a three-state label mode selector: nodes only, nodes and labels, or node labels with boxes.

### 4. Visual Graph Engine shortcut
- Add a clear shortcut in Graph Options that opens the existing Visual Graph Engine settings in the workspace.
- Reuse the current settings-view workflow so the user stays inside the app workspace.

## Technical details
- Extend the shared graph store defaults and merge logic so older saved vault configurations receive safe defaults.
- Route quick controls through the same node, link, and force settings used by Visual Graph Engine.
- Pass minimum depth through GraphLeaf into GraphCanvas and include it in graph visibility filtering.
- Update node drawing and redraw activation without introducing a second animation loop or renderer.
- Reuse existing Button, Switch, Slider, tooltip, and semantic theme patterns.

## Validation
- Run the production build and focused graph tests.
- Verify glow, particles, force changes, all three label modes, combined filtering, and level ranges in the running graph.
- Verify the Visual Graph Engine shortcut opens the correct settings view.
- Check the floating controls at desktop and mobile widths for clipping or overlap.