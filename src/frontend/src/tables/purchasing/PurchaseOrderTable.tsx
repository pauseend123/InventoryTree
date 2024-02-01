import { t } from '@lingui/macro';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddItemButton } from '../../components/buttons/AddItemButton';
import { Thumbnail } from '../../components/images/Thumbnail';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { UserRoles } from '../../enums/Roles';
import { notYetImplemented } from '../../functions/notifications';
import { getDetailUrl } from '../../functions/urls';
import { useTable } from '../../hooks/UseTable';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import {
  CreationDateColumn,
  DescriptionColumn,
  LineItemsProgressColumn,
  ProjectCodeColumn,
  ResponsibleColumn,
  StatusColumn,
  TargetDateColumn,
  TotalPriceColumn
} from '../ColumnRenderers';
import {
  AssignedToMeFilter,
  OutstandingFilter,
  OverdueFilter,
  StatusFilterOptions,
  TableFilter
} from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';

/**
 * Display a table of purchase orders
 */
export function PurchaseOrderTable({ params }: { params?: any }) {
  const navigate = useNavigate();

  const table = useTable('purchase-order');
  const user = useUserState();

  const tableFilters: TableFilter[] = useMemo(() => {
    return [
      {
        name: 'status',
        label: t`Status`,
        description: t`Filter by order status`,
        choiceFunction: StatusFilterOptions(ModelType.purchaseorder)
      },
      OutstandingFilter(),
      OverdueFilter(),
      AssignedToMeFilter()
      // TODO: has_project_code
      // TODO: project_code
    ];
  }, []);

  // TODO: Row actions

  // TODO: Table actions (e.g. create new purchase order)

  const tableColumns = useMemo(() => {
    return [
      {
        accessor: 'reference',
        sortable: true,
        switchable: false
        // TODO: Display extra information if order is overdue
      },
      DescriptionColumn({}),
      {
        accessor: 'supplier__name',
        title: t`Supplier`,
        sortable: true,
        render: function (record: any) {
          let supplier = record.supplier_detail ?? {};

          return (
            <Thumbnail
              src={supplier?.image}
              alt={supplier.name}
              text={supplier.name}
            />
          );
        }
      },
      {
        accessor: 'supplier_reference'
      },
      LineItemsProgressColumn(),
      StatusColumn(ModelType.purchaseorder),
      ProjectCodeColumn(),
      CreationDateColumn(),
      TargetDateColumn(),
      TotalPriceColumn(),
      ResponsibleColumn()
    ];
  }, []);

  const addPurchaseOrder = useCallback(() => {
    notYetImplemented();
  }, []);

  const tableActions = useMemo(() => {
    return [
      <AddItemButton
        tooltip={t`Add Purchase Order`}
        onClick={addPurchaseOrder}
        hidden={!user.hasAddRole(UserRoles.purchase_order)}
      />
    ];
  }, [user]);

  return (
    <InvenTreeTable
      url={apiUrl(ApiEndpoints.purchase_order_list)}
      tableState={table}
      columns={tableColumns}
      props={{
        params: {
          ...params,
          supplier_detail: true
        },
        tableFilters: tableFilters,
        tableActions: tableActions,
        onRowClick: (row: any) => {
          if (row.pk) {
            navigate(getDetailUrl(ModelType.purchaseorder, row.pk));
          }
        }
      }}
    />
  );
}