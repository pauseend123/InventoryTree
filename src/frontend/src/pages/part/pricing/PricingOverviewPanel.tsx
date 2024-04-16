import { t } from '@lingui/macro';
import { Alert, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import {
  IconBuildingWarehouse,
  IconChartDonut,
  IconExclamationCircle,
  IconList,
  IconReportAnalytics,
  IconShoppingCart,
  IconTriangleSquareCircle
} from '@tabler/icons-react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { ReactNode, useMemo } from 'react';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { CHART_COLORS } from '../../../components/charts/colors';
import { formatCurrency, renderDate } from '../../../defaults/formatters';

interface PricingOverviewEntry {
  icon: ReactNode;
  name: string;
  title: string;
  min_value: number | null | undefined;
  max_value: number | null | undefined;
  visible?: boolean;
  currency?: string | null | undefined;
}

export default function PricingOverviewPanel({
  part,
  pricing
}: {
  part: any;
  pricing: any;
}): ReactNode {
  const columns: DataTableColumn<any>[] = useMemo(() => {
    return [
      {
        accessor: 'title',
        title: t`Pricing Category`,
        render: (record: PricingOverviewEntry) => {
          return (
            <Group position="left" spacing="xs">
              {record.icon}
              <Text weight={700}>{record.title}</Text>
            </Group>
          );
        }
      },
      {
        accessor: 'min_value',
        title: t`Minimum`,
        render: (record: PricingOverviewEntry) => {
          if (record?.min_value === null || record?.min_value === undefined) {
            return '-';
          }
          return formatCurrency(record?.min_value, {
            currency: record.currency ?? pricing?.currency
          });
        }
      },
      {
        accessor: 'max_value',
        title: t`Maximum`,
        render: (record: PricingOverviewEntry) => {
          if (record?.max_value === null || record?.max_value === undefined) {
            return '-';
          }

          return formatCurrency(record?.max_value, {
            currency: record.currency ?? pricing?.currency
          });
        }
      }
    ];
  }, [part, pricing]);

  const overviewData: PricingOverviewEntry[] = useMemo(() => {
    return [
      {
        name: 'internal',
        title: t`Internal Pricing`,
        icon: <IconList />,
        min_value: pricing?.internal_cost_min,
        max_value: pricing?.internal_cost_max
      },
      {
        name: 'bom',
        title: t`BOM Pricing`,
        icon: <IconChartDonut />,
        min_value: pricing?.bom_cost_min,
        max_value: pricing?.bom_cost_max
      },
      {
        name: 'purchase',
        title: t`Purchase Pricing`,
        icon: <IconShoppingCart />,
        min_value: pricing?.purchase_cost_min,
        max_value: pricing?.purchase_cost_max
      },
      {
        name: 'supplier',
        title: t`Supplier Pricing`,
        icon: <IconBuildingWarehouse />,
        min_value: pricing?.supplier_price_min,
        max_value: pricing?.supplier_price_max
      },
      {
        name: 'variants',
        title: t`Variant Pricing`,
        icon: <IconTriangleSquareCircle />,
        min_value: pricing?.variant_cost_min,
        max_value: pricing?.variant_cost_max
      },
      {
        name: 'override',
        title: t`Override Pricing`,
        icon: <IconExclamationCircle />,
        min_value: pricing?.override_min,
        max_value: pricing?.override_max
      },
      {
        name: 'overall',
        title: t`Overall Pricing`,
        icon: <IconReportAnalytics />,
        min_value: pricing?.overall_min,
        max_value: pricing?.overall_max
      }
    ].filter((entry) => {
      return entry.min_value !== null || entry.max_value !== null;
    });
  }, [part, pricing]);

  // TODO: Add display of "last updated"
  // TODO: Add "update now" button

  return (
    <Stack spacing="xs">
      <SimpleGrid cols={2}>
        <Stack spacing="xs">
          {pricing?.updated && (
            <Paper p="xs">
              <Alert color="blue" title={t`Last Updated`}>
                <Text>{renderDate(pricing.updated)}</Text>
              </Alert>
            </Paper>
          )}
          <DataTable records={overviewData} columns={columns} />
        </Stack>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={overviewData}>
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="min_value"
              fill={CHART_COLORS[0]}
              label={t`Minimum Price`}
            />
            <Bar
              dataKey="max_value"
              fill={CHART_COLORS[1]}
              label={t`Maximum Price`}
            />
          </BarChart>
        </ResponsiveContainer>
      </SimpleGrid>
    </Stack>
  );
}
