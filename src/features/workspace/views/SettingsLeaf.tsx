import { SettingsHub } from '@/features/settings/SettingsHub';
import { isSettingsSectionId } from '@/features/settings/settingsNavigation';
import type { LeafViewProps } from '../ViewRegistry';

export default function SettingsLeaf({ leaf }: LeafViewProps) {
  const section = isSettingsSectionId(leaf.view.settingsSection)
    ? leaf.view.settingsSection
    : 'account';

  return <SettingsHub active={section} />;
}
