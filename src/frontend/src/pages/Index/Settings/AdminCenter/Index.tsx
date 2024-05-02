import { Trans, t } from '@lingui/macro';
import { Divider, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  IconCoins,
  IconCpu,
  IconDevicesPc,
  IconExclamationCircle,
  IconList,
  IconListDetails,
  IconPlugConnected,
  IconReport,
  IconScale,
  IconSitemap,
  IconTags,
  IconTemplate,
  IconUsersGroup
} from '@tabler/icons-react';
import { lazy, useMemo } from 'react';

import { PlaceholderPill } from '../../../../components/items/Placeholder';
import { PanelGroup, PanelType } from '../../../../components/nav/PanelGroup';
import { SettingsHeader } from '../../../../components/nav/SettingsHeader';
import { GlobalSettingList } from '../../../../components/settings/SettingList';
import { ApiEndpoints } from '../../../../enums/ApiEndpoints';
import { Loadable } from '../../../../functions/loading';
import { TemplateTable } from '../../../../tables/settings/TemplateTable';

const UserManagementPanel = Loadable(
  lazy(() => import('./UserManagementPanel'))
);

const TaskManagementPanel = Loadable(
  lazy(() => import('./TaskManagementPanel'))
);

const PluginManagementPanel = Loadable(
  lazy(() => import('./PluginManagementPanel'))
);

const MachineManagementPanel = Loadable(
  lazy(() => import('./MachineManagementPanel'))
);

const ErrorReportTable = Loadable(
  lazy(() => import('../../../../tables/settings/ErrorTable'))
);

const ProjectCodeTable = Loadable(
  lazy(() => import('../../../../tables/settings/ProjectCodeTable'))
);

const CustomUnitsTable = Loadable(
  lazy(() => import('../../../../tables/settings/CustomUnitsTable'))
);

const PartParameterTemplateTable = Loadable(
  lazy(() => import('../../../../tables/part/PartParameterTemplateTable'))
);

const PartCategoryTemplateTable = Loadable(
  lazy(() => import('../../../../tables/part/PartCategoryTemplateTable'))
);

const CurrencyTable = Loadable(
  lazy(() => import('../../../../tables/settings/CurrencyTable'))
);

export default function AdminCenter() {
  const adminCenterPanels: PanelType[] = useMemo(() => {
    return [
      {
        name: 'user',
        label: t`Users`,
        icon: <IconUsersGroup />,
        content: <UserManagementPanel />
      },
      {
        name: 'background',
        label: t`Background Tasks`,
        icon: <IconCpu />,
        content: <TaskManagementPanel />
      },
      {
        name: 'errors',
        label: t`Error Reports`,
        icon: <IconExclamationCircle />,
        content: <ErrorReportTable />
      },
      {
        name: 'currencies',
        label: t`Currencies`,
        icon: <IconCoins />,
        content: <CurrencyTable />
      },
      {
        name: 'projectcodes',
        label: t`Project Codes`,
        icon: <IconListDetails />,
        content: (
          <Stack spacing="xs">
            <GlobalSettingList keys={['PROJECT_CODES_ENABLED']} />
            <Divider />
            <ProjectCodeTable />
          </Stack>
        )
      },
      {
        name: 'customunits',
        label: t`Custom Units`,
        icon: <IconScale />,
        content: <CustomUnitsTable />
      },
      {
        name: 'part-parameters',
        label: t`Part Parameters`,
        icon: <IconList />,
        content: <PartParameterTemplateTable />
      },
      {
        name: 'category-parameters',
        label: t`Category Parameters`,
        icon: <IconSitemap />,
        content: <PartCategoryTemplateTable />
      },
      {
        name: 'labels',
        label: t`Label Templates`,
        icon: <IconTags />,
        content: (
          <TemplateTable
            templateProps={{
              templateEndpoint: ApiEndpoints.label_list,
              printingEndpoint: ApiEndpoints.label_print,
              templateType: 'label',
              additionalFormFields: {
                width: {},
                height: {}
              }
            }}
          />
        )
      },
      {
        name: 'reports',
        label: t`Report Templates`,
        icon: <IconReport />,
        content: (
          <TemplateTable
            templateProps={{
              templateEndpoint: ApiEndpoints.report_list,
              printingEndpoint: ApiEndpoints.report_print,
              templateType: 'report',
              additionalFormFields: {
                page_size: {},
                landscape: {}
              }
            }}
          />
        )
      },
      {
        name: 'plugin',
        label: t`Plugins`,
        icon: <IconPlugConnected />,
        content: <PluginManagementPanel />
      },
      {
        name: 'machine',
        label: t`Machines`,
        icon: <IconDevicesPc />,
        content: <MachineManagementPanel />
      }
    ];
  }, []);

  const QuickAction = () => (
    <Stack spacing={'xs'} ml={'sm'}>
      <Title order={5}>
        <Trans>Quick Actions</Trans>
      </Title>
      <SimpleGrid cols={3}>
        <Paper shadow="xs" p="sm" withBorder>
          <Text>
            <Trans>Add a new user</Trans>
          </Text>
        </Paper>

        <Paper shadow="xs" p="sm" withBorder>
          <PlaceholderPill />
        </Paper>

        <Paper shadow="xs" p="sm" withBorder>
          <PlaceholderPill />
        </Paper>
      </SimpleGrid>
    </Stack>
  );

  return (
    <Stack spacing="xs">
      <SettingsHeader
        title={t`Admin Center`}
        subtitle={t`Advanced Options`}
        switch_link="/settings/system"
        switch_text="System Settings"
      />
      <QuickAction />
      <PanelGroup
        pageKey="admin-center"
        panels={adminCenterPanels}
        collapsible={true}
      />
    </Stack>
  );
}
