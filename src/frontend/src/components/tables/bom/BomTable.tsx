import { t } from '@lingui/macro';
import { Text } from '@mantine/core';
import { ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { bomItemFields } from '../../../forms/BomForms';
import { openEditApiForm } from '../../../functions/forms';
import { useTableRefresh } from '../../../hooks/TableRefresh';
import { ApiPaths, apiUrl } from '../../../states/ApiState';
import { useUserState } from '../../../states/UserState';
import { ThumbnailHoverCard } from '../../images/Thumbnail';
import { YesNoButton } from '../../items/YesNoButton';
import { TableColumn } from '../Column';
import { BooleanColumn } from '../ColumnRenderers';
import { TableFilter } from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowAction, RowDeleteAction, RowEditAction } from '../RowActions';
import { TableHoverCard } from '../TableHoverCard';

// Calculate the total stock quantity available for a given BomItem
function availableStockQuantity(record: any): number {
  // Base availability
  let available: number = record.available_stock;

  // Add in available substitute stock
  available += record?.available_substitute_stock ?? 0;

  // Add in variant stock
  if (record.allow_variants) {
    available += record?.available_variant_stock ?? 0;
  }

  return available;
}

export function BomTable({
  partId,
  params = {}
}: {
  partId: number;
  params?: any;
}) {
  const navigate = useNavigate();

  const user = useUserState();

  const { tableKey, refreshTable } = useTableRefresh('bom');

  const tableColumns: TableColumn[] = useMemo(() => {
    return [
      // TODO: Improve column rendering
      {
        accessor: 'part',
        title: t`Part`,
        switchable: false,
        sortable: true,
        render: (row) => {
          let part = row.sub_part_detail;

          return (
            part && (
              <ThumbnailHoverCard
                src={part.thumbnail || part.image}
                text={part.full_name}
                alt={part.description}
                link=""
              />
            )
          );
        }
      },
      {
        accessor: 'description',
        title: t`Description`,
        render: (row) => row?.sub_part_detail?.description
      },
      {
        accessor: 'reference',
        title: t`Reference`
      },
      {
        accessor: 'quantity',
        title: t`Quantity`,
        switchable: false,
        sortable: true
        // TODO: Custom quantity renderer
        // TODO: see bom.js for existing implementation
      },
      {
        accessor: 'substitutes',
        title: t`Substitutes`,
        // TODO: Show hovercard with list of substitutes
        render: (row) => {
          let substitutes = row.substitutes ?? [];

          return substitutes.length > 0 ? (
            row.length
          ) : (
            <YesNoButton value={false} />
          );
        }
      },
      BooleanColumn({
        accessor: 'optional',
        title: t`Optional`
      }),
      BooleanColumn({
        accessor: 'consumable',
        title: t`Consumable`
      }),
      BooleanColumn({
        accessor: 'allow_variants',
        title: t`Allow Variants`
      }),
      BooleanColumn({
        accessor: 'inherited',
        title: t`Gets Inherited`
        // TODO: Custom renderer for this column
        // TODO: See bom.js for existing implementation
      }),
      {
        accessor: 'price_range',
        title: t`Price Range`,

        sortable: false,
        render: (row) => {
          let min_price = row.pricing_min || row.pricing_max;
          let max_price = row.pricing_max || row.pricing_min;

          // TODO: Custom price range rendering component
          // TODO: Footer component for price range
          return `${min_price} - ${max_price}`;
        }
      },
      {
        accessor: 'available_stock',
        title: t`Available`,

        render: (record) => {
          let extra: ReactNode[] = [];

          let available_stock: number = availableStockQuantity(record);
          let on_order: number = record?.on_order ?? 0;
          let building: number = record?.building ?? 0;

          let text =
            available_stock <= 0 ? (
              <Text color="red" italic>{t`No stock`}</Text>
            ) : (
              available_stock
            );

          if (record.available_substitute_stock > 0) {
            extra.push(
              <Text key="substitute">
                {t`Includes substitute stock`}:{' '}
                {record.available_substitute_stock}
              </Text>
            );
          }

          if (record.allow_variants && record.available_variant_stock > 0) {
            extra.push(
              <Text key="variant">
                {t`Includes variant stock`}: {record.available_variant_stock}
              </Text>
            );
          }

          if (on_order > 0) {
            extra.push(
              <Text key="on_order">
                {t`On order`}: {on_order}
              </Text>
            );
          }

          if (building > 0) {
            extra.push(
              <Text key="building">
                {t`Building`}: {building}
              </Text>
            );
          }

          return (
            <TableHoverCard
              value={text}
              extra={extra}
              title={t`Stock Information`}
            />
          );
        }
      },
      {
        accessor: 'can_build',
        title: t`Can Build`,
        sortable: false, // TODO: Custom sorting via API
        render: (record: any) => {
          if (record.consumable) {
            return <Text italic>{t`Consumable item`}</Text>;
          }

          let can_build = availableStockQuantity(record) / record.quantity;

          return Math.trunc(can_build);
        }
      },
      {
        accessor: 'note',
        title: t`Notes`,
        switchable: true
      }
    ];
  }, [partId, params]);

  const tableFilters: TableFilter[] = useMemo(() => {
    return [];
  }, [partId, params]);

  const rowActions = useCallback(
    (record: any) => {
      // TODO: Check user permissions here,
      // TODO: to determine which actions are allowed

      let actions: RowAction[] = [];

      actions.push({
        title: t`Validate`,
        hidden: record.validated
      });

      actions.push({
        title: t`Substitutes`,
        color: 'blue'
      });

      actions.push(
        RowEditAction({
          onClick: () => {
            openEditApiForm({
              url: ApiPaths.bom_list,
              pk: record.pk,
              title: t`Edit Bom Item`,
              fields: bomItemFields(),
              successMessage: t`Bom item updated`,
              onFormSuccess: refreshTable
            });
          }
        })
      );

      // TODO: Action on delete
      actions.push(RowDeleteAction({}));

      return actions;
    },
    [partId, user]
  );

  return (
    <InvenTreeTable
      url={apiUrl(ApiPaths.bom_list)}
      tableKey={tableKey}
      columns={tableColumns}
      props={{
        params: {
          ...params,
          part: partId,
          part_detail: true,
          sub_part_detail: true
        },
        customFilters: tableFilters,
        onRowClick: (row) => navigate(`/part/${row.sub_part}`),
        rowActions: rowActions
      }}
    />
  );
}
