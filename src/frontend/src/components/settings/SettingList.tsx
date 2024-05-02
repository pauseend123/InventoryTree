import { Trans } from '@lingui/macro';
import { Stack, Text } from '@mantine/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';

import {
  SettingsStateProps,
  createMachineSettingsState,
  createPluginSettingsState,
  useGlobalSettingsState,
  useUserSettingsState
} from '../../states/SettingsState';
import { SettingItem } from './SettingItem';

/**
 * Display a list of setting items, based on a list of provided keys
 */
export function SettingList({
  settingsState,
  keys,
  onChange
}: {
  settingsState: SettingsStateProps;
  keys?: string[];
  onChange?: () => void;
}) {
  useEffect(() => {
    settingsState.fetchSettings();
  }, []);

  const allKeys = useMemo(
    () => settingsState?.settings?.map((s) => s.key),
    [settingsState?.settings]
  );

  return (
    <>
      <Stack gap="xs">
        {(keys || allKeys).map((key, i) => {
          const setting = settingsState?.settings?.find(
            (s: any) => s.key === key
          );

          return (
            <React.Fragment key={key}>
              {setting ? (
                <SettingItem
                  settingsState={settingsState}
                  setting={setting}
                  shaded={i % 2 === 0}
                  onChange={onChange}
                />
              ) : (
                <Text size="sm" style={{ fontStyle: 'italic' }} color="red">
                  Setting {key} not found
                </Text>
              )}
            </React.Fragment>
          );
        })}
        {(keys || allKeys).length === 0 && (
          <Text style={{ fontStyle: 'italic' }}>
            <Trans>No settings specified</Trans>
          </Text>
        )}
      </Stack>
    </>
  );
}

export function UserSettingList({ keys }: { keys: string[] }) {
  const userSettings = useUserSettingsState();

  return <SettingList settingsState={userSettings} keys={keys} />;
}

export function GlobalSettingList({ keys }: { keys: string[] }) {
  const globalSettings = useGlobalSettingsState();

  return <SettingList settingsState={globalSettings} keys={keys} />;
}

export function PluginSettingList({ pluginPk }: { pluginPk: string }) {
  const pluginSettingsStore = useRef(
    createPluginSettingsState({ plugin: pluginPk })
  ).current;
  const pluginSettings = useStore(pluginSettingsStore);

  return <SettingList settingsState={pluginSettings} />;
}

export function MachineSettingList({
  machinePk,
  configType,
  onChange
}: {
  machinePk: string;
  configType: 'M' | 'D';
  onChange?: () => void;
}) {
  const machineSettingsStore = useRef(
    createMachineSettingsState({
      machine: machinePk,
      configType: configType
    })
  ).current;
  const machineSettings = useStore(machineSettingsStore);

  return <SettingList settingsState={machineSettings} onChange={onChange} />;
}
