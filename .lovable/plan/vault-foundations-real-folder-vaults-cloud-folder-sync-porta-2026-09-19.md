# Vault foundations: real folder vaults, cloud+folder sync, portable `.obmap` config

## What is broken today (verified in the code)

1. **"Create New" / "Open Existing" local vault does nothing.** Creating a folder vault asks for a folder three times in a row (once in the settings screen, twice inside the vault manager), and any failure is silently swallowed, so the dialog just closes with no vault.
2. **A vault can only be one thing.** Storage is a single choice — browser, cloud, or folder — so no vault can live in a folder *and* sync to the cloud.
3. **Browser-memory vaults still exist** as a first-class option in the creation dialog.
4. **New notes and folders are never written to disk.** Notes are kept in the graph and in the browser database only; nothing writes `.md` files into the chosen folder, and the save routine exits early for folder vaults.
5. **Vault settings are not isolated per vault.** Config lives in the browser database (or a single `.vault-config.json` file), and switching vaults does not reset open windows/panels.
6. **The "Vaults" button in a new tab leaves the workspace** and navigates to the `/vaults` page instead of opening vault management inside settings. "Open graph" opens a tab that renders nothing.

## What will change

### 1. One vault dialog, two real choices

Replace the browser/in-memory option. Creating a vault offers:

- **New folder** — pick a parent folder, we create the vault folder inside it (single folder prompt).
- **Open existing folder** — pick a folder that already holds notes.
- **Cloud vault** — lives in your account; can be attached to a folder later.

Errors are surfaced in the dialog instead of being swallowed, and the folder prompt happens exactly once.

### 2. Folder and cloud are independent switches

Each vault gets two settings instead of one choice:

- where the files live (folder on this computer, or cloud-only)
- whether cloud sync is on

So a folder vault can sync to the cloud, and a cloud vault can be attached to a folder and written out to it. The per-vault control lives on each vault card in vault management.

Existing vaults migrate as: folder vaults keep their folder, cloud-marked vaults keep cloud sync on, browser-only vaults become cloud-backed vaults (their content is preserved, nothing is deleted).

### 3. Notes and folders actually save

For any vault attached to a folder, creating/renaming/editing/deleting a note or folder writes the matching `.md` file or directory immediately (debounced for typing), with a visible save state and an error toast when the browser denies folder permission. Permission is re-requested on reopen so a vault survives a page reload.

### 4. `/.obmap` — portable, isolated per-vault config

Every folder vault gets an `.obmap` folder at its root, created automatically when the vault is created *and* when an existing vault without one is opened. It holds plain JSON:

```text
/.obmap
  vault.json        # vault id, name, created date, cloud sync flag
  settings.json     # app/universal settings for this vault
  graph.json        # graph display config (colors, forces, layout)
  workspace.json    # saved window/tab layout
```

These files are read on vault open and written whenever settings change, so editing the JSON by hand or through settings both work. Nothing from one vault leaks into another. Cloud-only vaults keep the same structure stored in the cloud record.

### 5. Switching vaults resets the session

On switch: close all open tabs/panels, clear graph and note state, then load the new vault's `.obmap` config, layout and notes. No leftover state from the previous vault.

### 6. Workspace cleanup

- The new-tab actions become: **New note**, **Open graph**, **Vault management** — the last one opens the vault section of the settings sidebar inside the workspace.
- Delete the `/profile` and `/vaults` pages and their routes; account and vault features stay in the settings sidebar (verified there already, gaps filled if any are missing).
- Fix the graph tab so it renders: diagnose whether it is empty data or a sizing problem, then fix the actual cause and confirm the graph draws with a real vault open.

## Technical notes

- `src/core/vault/types.ts`: replace `StorageStrategy` with `location: 'folder' | 'cloud'` + `cloudSync: boolean`; migrate legacy values on load in `VaultManager.restoreVault`.
- `VaultManager.openLocalFolderVault` / `VaultSettings.handleCreateLocalVault`: single `showDirectoryPicker` call; pass the handle into `FileSystemService` instead of re-prompting.
- New `ObmapConfigService` in `src/core/vault/`: create/read/write `.obmap/*.json` via `FileSystemDirectoryHandle`; replaces `readVaultConfig`/`writeVaultConfig` and the `graphConfig`/`backupConfig` IndexedDB fields.
- `FileSystemService`: add `writeNote`, `deleteEntry`, `renameEntry`, `ensureDirectory`, `verifyPermission`; persist handles in IndexedDB for reopen.
- `VaultSessionContext`: route `onAddNode`, `onNodeUpdate`, `onNodeDelete`, `onNodeMove` through the filesystem writer when the vault has a folder; add a vault-switch reset that clears node/graph/workspace stores before loading the new vault.
- `VaultSyncService.syncToCloud`: drop the `vault.type !== 'in-memory'` skip so folder vaults sync too.
- Remove `src/pages/Profile.tsx`, `src/pages/VaultDashboard.tsx` and their routes in `App.tsx`; update `EmptyLeaf` to `openView({ type: 'settings', settingsSection: 'vaults' })`.
