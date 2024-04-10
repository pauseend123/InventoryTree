import { t } from '@lingui/macro';
import { SimpleGrid, Stack } from '@mantine/core';
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

import { formatDecimal, formatPriceRange } from '../../../defaults/formatters';
import { ApiEndpoints } from '../../../enums/ApiEndpoints';
import { useTable } from '../../../hooks/UseTable';
import { apiUrl } from '../../../states/ApiState';
import { TableColumn } from '../../../tables/Column';
import { DateColumn, PartColumn } from '../../../tables/ColumnRenderers';
import { InvenTreeTable } from '../../../tables/InvenTreeTable';

const BOM_COLORS: string[] = [
  '#ffa8a8',
  '#8ce99a',
  '#74c0fc',
  '#ffe066',
  '#63e6be',
  '#ffc078',
  '#d8f5a2',
  '#66d9e8',
  '#e599f7',
  '#dee2e6'
];

export default function BomPricingPanel({
  part,
  pricing
}: {
  part: any;
  pricing: any;
}): ReactNode {
  const table = useTable('pricing-bom');

  const columns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'name',
        title: t`Component`,
        sortable: true,
        switchable: false,
        render: (record: any) => PartColumn(record.sub_part_detail)
      },
      {
        accessor: 'quantity',
        title: t`Quantity`,
        sortable: true,
        switchable: false,
        render: (record: any) => formatDecimal(record.quantity)
      },
      {
        accessor: 'unit_price',
        ordering: 'pricing_max',
        sortable: true,
        switchable: false,
        title: t`Unit Price`,
        render: (record: any) => {
          return formatPriceRange(record.pricing_min, record.pricing_max, {
            currency: pricing?.currency
          });
        }
      },
      {
        accessor: 'total_price',
        title: t`Total Price`,
        ordering: 'pricing_max',
        sortable: true,
        switchable: false,
        render: (record: any) => {
          return formatPriceRange(record.pricing_min, record.pricing_max, {
            currency: pricing?.currency,
            multiplier: record.quantity
          });
        }
      },
      DateColumn({
        accessor: 'pricing_updated',
        title: t`Updated`,
        sortable: true,
        switchable: true
      })
    ];
  }, [part, pricing]);

  const bomPricingData: any[] = useMemo(() => {
    const pricing = table.records.map((entry: any) => {
      return {
        entry: entry,
        quantity: entry.quantity,
        name: entry.sub_part_detail?.name,
        pmin:
          entry.quantity *
          parseFloat(entry.pricing_min ?? entry.pricing_max ?? 0),
        pmax:
          entry.quantity *
          parseFloat(entry.pricing_max ?? entry.pricing_min ?? 0)
      };
    });

    return pricing;
  }, [table.records]);

  // TODO: Enable record selection (toggle which items appear in BOM pricing wheel)
  // TODO: Display BOM entry colors in table, using custom rowStyle prop

  return (
    <Stack spacing="xs">
      <SimpleGrid cols={2}>
        <InvenTreeTable
          tableState={table}
          url={apiUrl(ApiEndpoints.bom_list)}
          columns={columns}
          props={{
            params: {
              part: part?.pk,
              sub_part_detail: true,
              has_pricing: true
            },
            enableSelection: false
          }}
        />
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={bomPricingData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pmin" fill="#8884d8" label={t`Minimum Price`} />
            <Bar dataKey="pmax" fill="#82ca9d" label={t`Maximum Price`} />
          </BarChart>
        </ResponsiveContainer>
      </SimpleGrid>
    </Stack>
  );
}
