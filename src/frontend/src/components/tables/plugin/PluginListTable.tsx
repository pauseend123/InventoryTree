import { Trans, t } from '@lingui/macro';
import {
  Alert,
  Box,
  Card,
  Flex,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
  Tooltip
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconCircleCheck,
  IconCircleX,
  IconHelpCircle,
  IconRefresh
} from '@tabler/icons-react';
import { IconDots } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../../App';
import { ApiPaths } from '../../../enums/ApiEndpoints';
import { openEditApiForm } from '../../../functions/forms';
import { useTableRefresh } from '../../../hooks/TableRefresh';
import { useInstance } from '../../../hooks/UseInstance';
import { apiUrl } from '../../../states/ApiState';
import { ActionDropdown, EditItemAction } from '../../items/ActionDropdown';
import { StylishText } from '../../items/StylishText';
import { YesNoButton } from '../../items/YesNoButton';
import { DetailDrawer } from '../../nav/DetailDrawer';
import { PluginSettingList } from '../../settings/SettingList';
import { TableColumn } from '../Column';
import { InvenTreeTable, InvenTreeTableProps } from '../InvenTreeTable';
import { RowAction } from '../RowActions';

export interface PluginI {
  pk: number;
  key: string;
  name: string;
  active: boolean;
  is_builtin: boolean;
  is_sample: boolean;
  is_installed: boolean;
  meta: {
    author: string | null;
    description: string | null;
    human_name: string | null;
    license: string | null;
    package_path: string | null;
    pub_date: string | null;
    settings_url: string | null;
    slug: string | null;
    version: string | null;
    website: string | null;
  };
  mixins: Record<
    string,
    {
      key: string;
      human_name: string;
    }
  >;
}

export function PluginDrawer({
  id,
  refreshTable
}: {
  id: string;
  refreshTable: () => void;
}) {
  const {
    instance: plugin,
    refreshInstance,
    instanceQuery: { isFetching, error }
  } = useInstance<PluginI>({
    endpoint: ApiPaths.plugin_list,
    pk: id,
    throwError: true
  });

  const refetch = useCallback(() => {
    refreshTable();
    refreshInstance();
  }, [refreshTable, refreshInstance]);

  if (isFetching) {
    return <LoadingOverlay visible={true} />;
  }

  if (error) {
    return (
      <Text>
        {(error as any)?.response?.status === 404 ? (
          <Trans>Plugin with id {id} not found</Trans>
        ) : (
          <Trans>An error occurred while fetching plugin details</Trans>
        )}
      </Text>
    );
  }

  function InfoItem({
    name,
    children,
    type,
    value
  }: {
    name: string;
    children?: React.ReactNode;
    type?: 'text' | 'boolean';
    value?: any;
  }) {
    return (
      <Group position="apart">
        <Text fz="sm" fw={700}>
          {name}:
        </Text>
        <Flex>
          {children}
          {value !== undefined && type === 'text' ? (
            <Text>{value || <Trans>None</Trans>}</Text>
          ) : type === 'boolean' ? (
            <YesNoButton value={value || false} />
          ) : (
            ''
          )}
        </Flex>
      </Group>
    );
  }

  return (
    <Stack spacing={'xs'}>
      <Group position="apart">
        <Box></Box>

        <Group spacing={'xs'}>
          {plugin && PluginIcon(plugin)}
          <Title order={4}>{plugin?.meta.human_name || plugin?.name}</Title>
        </Group>

        <ActionDropdown
          tooltip={t`Plugin Actions`}
          icon={<IconDots />}
          actions={[
            EditItemAction({
              tooltip: t`Edit plugin`,
              onClick: () => {
                openEditApiForm({
                  title: t`Edit plugin`,
                  url: ApiPaths.plugin_list,
                  pk: id,
                  fields: {
                    active: {}
                  },
                  onClose: refetch
                });
              }
            }),
            {
              name: t`Reload`,
              tooltip: t`Reload`,
              icon: <IconRefresh />,
              onClick: refreshInstance
            }
          ]}
        />
      </Group>

      <LoadingOverlay visible={isFetching} overlayOpacity={0} />

      <Card withBorder>
        <Stack spacing="md">
          <Title order={4}>
            <Trans>Plugin information</Trans>
          </Title>
          <Stack pos="relative" spacing="xs">
            <InfoItem type="text" name={t`Name`} value={plugin?.name} />
            <InfoItem
              type="text"
              name={t`Description`}
              value={plugin?.meta.description}
            />
            <InfoItem
              type="text"
              name={t`Author`}
              value={plugin?.meta.author}
            />
            <InfoItem
              type="text"
              name={t`Date`}
              value={plugin?.meta.pub_date}
            />
            <InfoItem
              type="text"
              name={t`Version`}
              value={plugin?.meta.version}
            />
            <InfoItem type="boolean" name={t`Active`} value={plugin?.active} />
          </Stack>
        </Stack>
      </Card>

      <Card withBorder>
        <Stack spacing="md">
          <Title order={4}>
            <Trans>Package information</Trans>
          </Title>
          <Stack pos="relative" spacing="xs">
            <InfoItem
              type="text"
              name={t`Installation path`}
              value={plugin?.meta.package_path}
            />
            <InfoItem
              type="boolean"
              name={t`Builtin`}
              value={plugin?.is_builtin}
            />
          </Stack>
        </Stack>
      </Card>

      {plugin && plugin.active && (
        <Card withBorder>
          <Stack spacing="md">
            <Title order={4}>
              <Trans>Plugin settings</Trans>
            </Title>
            <PluginSettingList pluginPk={id} />
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

/**
 * Construct an indicator icon for a single plugin
 */
function PluginIcon(plugin: PluginI) {
  if (plugin.is_installed) {
    if (plugin.active) {
      return (
        <Tooltip label={t`Plugin is active`}>
          <IconCircleCheck color="green" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip label={t`Plugin is inactive`}>
          <IconCircleX color="red" />
        </Tooltip>
      );
    }
  } else {
    return (
      <Tooltip label={t`Plugin is not installed`}>
        <IconHelpCircle />
      </Tooltip>
    );
  }
}

/**
 * Table displaying list of available plugins
 */
export function PluginListTable({ props }: { props: InvenTreeTableProps }) {
  const { tableKey, refreshTable } = useTableRefresh('plugin');
  const navigate = useNavigate();

  const pluginTableColumns: TableColumn[] = useMemo(
    () => [
      {
        accessor: 'name',
        title: t`Plugin`,
        sortable: true,
        render: function (record: any) {
          // TODO: Add link to plugin detail page
          // TODO: Add custom badges
          return (
            <Group position="left">
              <PluginIcon {...record} />
              <Text>{record.name}</Text>
            </Group>
          );
        }
      },
      {
        accessor: 'meta.description',
        title: t`Description`,
        sortable: false,

        render: function (record: any) {
          if (record.active) {
            return record.meta.description;
          } else {
            return <Text italic>{t`Description not available`}</Text>;
          }
        }
      },
      {
        accessor: 'meta.version',
        title: t`Version`,
        sortable: false

        // TODO: Display date information if available
      },
      {
        accessor: 'meta.author',
        title: 'Author',
        sortable: false
      }
    ],
    []
  );

  const activatePlugin = useCallback(
    (plugin_id: number, plugin_name: string, active: boolean) => {
      modals.openConfirmModal({
        title: (
          <StylishText>
            {active ? t`Activate Plugin` : t`Deactivate Plugin`}
          </StylishText>
        ),
        children: (
          <Alert
            color="green"
            icon={<IconCircleCheck />}
            title={
              active
                ? t`Confirm plugin activation`
                : t`Confirm plugin deactivation`
            }
          >
            <Stack spacing="xs">
              <Text>
                {active
                  ? t`The following plugin will be activated`
                  : t`The following plugin will be deactivated`}
                :
              </Text>
              <Text size="lg" italic>
                {plugin_name}
              </Text>
            </Stack>
          </Alert>
        ),
        labels: {
          cancel: t`Cancel`,
          confirm: t`Confirm`
        },
        onConfirm: () => {
          let url = apiUrl(ApiPaths.plugin_list, plugin_id) + 'activate/';

          const id = 'plugin-activate';

          // Show a progress notification
          notifications.show({
            id: id,
            message: active ? t`Activating plugin` : t`Deactivating plugin`,
            loading: true
          });

          api
            .patch(url, { active: active })
            .then(() => {
              refreshTable();
              notifications.hide(id);
              notifications.show({
                title: t`Plugin updated`,
                message: active
                  ? t`The plugin was activated`
                  : t`The plugin was deactivated`,
                color: 'green'
              });
            })
            .catch((_err) => {
              notifications.hide(id);
              notifications.show({
                title: t`Error`,
                message: t`Error updating plugin`,
                color: 'red'
              });
            });
        }
      });
    },
    []
  );

  // Determine available actions for a given plugin
  function rowActions(record: any): RowAction[] {
    let actions: RowAction[] = [];

    if (!record.is_builtin && record.is_installed) {
      if (record.active) {
        actions.push({
          title: t`Deactivate`,
          color: 'red',
          icon: <IconCircleX />,
          onClick: () => {
            activatePlugin(record.pk, record.name, false);
          }
        });
      } else {
        actions.push({
          title: t`Activate`,
          color: 'green',
          icon: <IconCircleCheck />,
          onClick: () => {
            activatePlugin(record.pk, record.name, true);
          }
        });
      }
    }

    return actions;
  }

  return (
    <>
      <DetailDrawer
        title={t`Plugin detail`}
        size={'lg'}
        renderContent={(id) => {
          if (!id) return false;
          return <PluginDrawer id={id} refreshTable={refreshTable} />;
        }}
      />
      <InvenTreeTable
        url={apiUrl(ApiPaths.plugin_list)}
        tableKey={tableKey}
        columns={pluginTableColumns}
        props={{
          ...props,
          enableDownload: false,
          params: {
            ...props.params
          },
          rowActions: rowActions,
          onRowClick: (plugin) => navigate(`${plugin.pk}/`),
          customFilters: [
            {
              name: 'active',
              label: t`Active`,
              type: 'boolean'
            },
            {
              name: 'builtin',
              label: t`Builtin`,
              type: 'boolean'
            },
            {
              name: 'sample',
              label: t`Sample`,
              type: 'boolean'
            },
            {
              name: 'installed',
              label: t`Installed`,
              type: 'boolean'
            }
          ]
        }}
      />
    </>
  );
}
