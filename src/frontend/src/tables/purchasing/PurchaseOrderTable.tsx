import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddItemButton } from '../../components/buttons/AddItemButton';
import { Thumbnail } from '../../components/images/Thumbnail';
import { formatCurrency } from '../../defaults/formatters';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { UserRoles } from '../../enums/Roles';
import { usePurchaseOrderFields } from '../../forms/PurchaseOrderForms';
import { getDetailUrl } from '../../functions/urls';
import { useCreateApiFormModal } from '../../hooks/UseForm';
import { useTable } from '../../hooks/UseTable';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import {
  CreationDateColumn,
  DescriptionColumn,
  LineItemsProgressColumn,
  ProjectCodeColumn,
  ReferenceColumn,
  ResponsibleColumn,
  StatusColumn,
  TargetDateColumn
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
export function PurchaseOrderTable({
  supplierId,
  supplierPartId
}: {
  supplierId?: number;
  supplierPartId?: number;
}) {
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

  const tableColumns = useMemo(() => {
    return [
      ReferenceColumn(),
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
      {
        accessor: 'total_price',
        title: t`Total Price`,
        sortable: true,
        render: (record: any) => {
          return formatCurrency(record.total_price, {
            currency: record.order_currency ?? record.supplier_detail?.currency
          });
        }
      },
      ResponsibleColumn()
    ];
  }, []);

  const purchaseOrderFields = usePurchaseOrderFields();

  const newPurchaseOrder = useCreateApiFormModal({
    url: ApiEndpoints.purchase_order_list,
    title: t`Add Purchase Order`,
    fields: purchaseOrderFields,
    initialData: {
      supplier: supplierId
    },
    onFormSuccess: (response) => {
      if (response.pk) {
        navigate(getDetailUrl(ModelType.purchaseorder, response.pk));
      } else {
        table.refreshTable();
      }
    }
  });

  const tableActions = useMemo(() => {
    return [
      <AddItemButton
        tooltip={t`Add Purchase Order`}
        onClick={() => newPurchaseOrder.open()}
        hidden={!user.hasAddRole(UserRoles.purchase_order)}
      />
    ];
  }, [user]);

  return (
    <>
      {newPurchaseOrder.modal}
      <InvenTreeTable
        url={apiUrl(ApiEndpoints.purchase_order_list)}
        tableState={table}
        columns={tableColumns}
        props={{
          params: {
            supplier_detail: true,
            supplier: supplierId,
            supplier_part: supplierPartId
          },
          tableFilters: tableFilters,
          tableActions: tableActions,
          modelType: ModelType.purchaseorder
        }}
      />
    </>
  );
}
