import { t } from '@lingui/macro';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiPaths } from '../../../enums/ApiEndpoints';
import { ModelType } from '../../../enums/ModelType';
import { UserRoles } from '../../../enums/Roles';
import { stockLocationFields } from '../../../forms/StockForms';
import { openCreateApiForm, openEditApiForm } from '../../../functions/forms';
import { getDetailUrl } from '../../../functions/urls';
import { useCreateApiFormModal } from '../../../hooks/UseForm';
import { useTable } from '../../../hooks/UseTable';
import { apiUrl } from '../../../states/ApiState';
import { useUserState } from '../../../states/UserState';
import { AddItemButton } from '../../buttons/AddItemButton';
import { YesNoButton } from '../../items/YesNoButton';
import { TableColumn } from '../Column';
import { DescriptionColumn } from '../ColumnRenderers';
import { TableFilter } from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowEditAction } from '../RowActions';

/**
 * Stock location table
 */
export function StockLocationTable({ parentId }: { parentId?: any }) {
  const table = useTable('stocklocation');
  const user = useUserState();

  const navigate = useNavigate();

  const tableFilters: TableFilter[] = useMemo(() => {
    return [
      {
        name: 'cascade',
        label: t`Include Sublocations`,
        description: t`Include sublocations in results`
      },
      {
        name: 'structural',
        label: t`Structural`,
        description: t`Show structural locations`
      },
      {
        name: 'external',
        label: t`External`,
        description: t`Show external locations`
      },
      {
        name: 'has_location_type',
        label: t`Has location type`
      }
      // TODO: location_type
    ];
  }, []);

  const tableColumns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'name',
        title: t`Name`,
        switchable: false
      },
      DescriptionColumn({}),
      {
        accessor: 'pathstring',
        title: t`Path`,
        sortable: true
      },
      {
        accessor: 'items',
        title: t`Stock Items`,

        sortable: true
      },
      {
        accessor: 'structural',
        title: t`Structural`,

        sortable: true,
        render: (record: any) => <YesNoButton value={record.structural} />
      },
      {
        accessor: 'external',
        title: t`External`,

        sortable: true,
        render: (record: any) => <YesNoButton value={record.external} />
      },
      {
        accessor: 'location_type',
        title: t`Location Type`,

        sortable: false,
        render: (record: any) => record.location_type_detail?.name
      }
    ];
  }, []);

  const newLocation = useCreateApiFormModal({
    url: ApiPaths.stock_location_list,
    title: t`Create Stock Location`,
    fields: stockLocationFields({}),
    initialData: {
      parent: parentId
    },
    onFormSuccess(data: any) {
      if (data.pk) {
        navigate(getDetailUrl(ModelType.stocklocation, data.pk));
      } else {
        table.refreshTable();
      }
    }
  });

  const tableActions = useMemo(() => {
    let can_add = user.hasAddRole(UserRoles.stock_location);

    return [
      <AddItemButton
        tooltip={t`Add Stock Location`}
        onClick={() => newLocation.open()}
        disabled={!can_add}
      />
    ];
  }, [user]);

  const rowActions = useCallback(
    (record: any) => {
      let can_edit = user.hasChangeRole(UserRoles.stock_location);

      return [
        RowEditAction({
          hidden: !can_edit,
          onClick: () => {
            openEditApiForm({
              url: ApiPaths.stock_location_list,
              pk: record.pk,
              title: t`Edit Stock Location`,
              fields: stockLocationFields({}),
              successMessage: t`Stock location updated`,
              onFormSuccess: table.refreshTable
            });
          }
        })
      ];
    },
    [user]
  );

  return (
    <>
      {newLocation.modal}
      <InvenTreeTable
        url={apiUrl(ApiPaths.stock_location_list)}
        tableState={table}
        columns={tableColumns}
        props={{
          enableDownload: true,
          params: {
            parent: parentId ?? 'null'
          },
          tableFilters: tableFilters,
          tableActions: tableActions,
          rowActions: rowActions,
          onRowClick: (record) => {
            navigate(getDetailUrl(ModelType.stocklocation, record.pk));
          }
        }}
      />
    </>
  );
}
