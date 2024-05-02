import { t } from '@lingui/macro';
import { useMemo } from 'react';

import { AddItemButton } from '../../components/buttons/AddItemButton';
import { PartHoverCard } from '../../components/images/Thumbnail';
import { ProgressBar } from '../../components/items/ProgressBar';
import { RenderUser } from '../../components/render/User';
import { renderDate } from '../../defaults/formatters';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { UserRoles } from '../../enums/Roles';
import { useBuildOrderFields } from '../../forms/BuildForms';
import {
  useOwnerFilters,
  useProjectCodeFilters,
  useUserFilters
} from '../../hooks/UseFilter';
import { useCreateApiFormModal } from '../../hooks/UseForm';
import { useTable } from '../../hooks/UseTable';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import { TableColumn } from '../Column';
import {
  CreationDateColumn,
  DateColumn,
  ProjectCodeColumn,
  ReferenceColumn,
  ResponsibleColumn,
  StatusColumn,
  TargetDateColumn
} from '../ColumnRenderers';
import { StatusFilterOptions, TableFilter } from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';

/**
 * Construct a list of columns for the build order table
 */
function buildOrderTableColumns(): TableColumn[] {
  return [
    ReferenceColumn(),
    {
      accessor: 'part',
      sortable: true,
      switchable: false,
      render: (record: any) => <PartHoverCard part={record.part_detail} />
    },
    {
      accessor: 'title',
      sortable: false
    },
    {
      accessor: 'completed',
      sortable: true,
      switchable: false,
      render: (record: any) => (
        <ProgressBar
          progressLabel={true}
          value={record.completed}
          maximum={record.quantity}
        />
      )
    },
    StatusColumn(ModelType.build),
    ProjectCodeColumn(),
    {
      accessor: 'priority',
      sortable: true
    },
    CreationDateColumn(),
    TargetDateColumn(),
    DateColumn({
      accessor: 'completion_date',
      sortable: true
    }),
    {
      accessor: 'issued_by',
      sortable: true,
      render: (record: any) => (
        <RenderUser instance={record?.issued_by_detail} />
      )
    },
    ResponsibleColumn()
  ];
}

/*
 * Construct a table of build orders, according to the provided parameters
 */
export function BuildOrderTable({
  partId,
  parentBuildId,
  salesOrderId
}: {
  partId?: number;
  parentBuildId?: number;
  salesOrderId?: number;
}) {
  const tableColumns = useMemo(() => buildOrderTableColumns(), []);

  const projectCodeFilters = useProjectCodeFilters();
  const userFilters = useUserFilters();
  const responsibleFilters = useOwnerFilters();

  const tableFilters: TableFilter[] = useMemo(() => {
    return [
      {
        name: 'active',
        type: 'boolean',
        label: t`Active`,
        description: t`Show active orders`
      },
      {
        name: 'status',
        description: t`Filter by order status`,
        choiceFunction: StatusFilterOptions(ModelType.build)
      },
      {
        name: 'overdue',
        type: 'boolean',
        description: t`Show overdue status`
      },
      {
        name: 'assigned_to_me',
        type: 'boolean',
        label: t`Assigned to me`,
        description: t`Show orders assigned to me`
      },
      {
        name: 'project_code',
        label: t`Project Code`,
        description: t`Filter by project code`,
        choices: projectCodeFilters.choices
      },
      {
        name: 'has_project_code',
        label: t`Has Project Code`,
        description: t`Filter by whether the purchase order has a project code`
      },
      {
        name: 'issued_by',
        label: t`Issued By`,
        description: t`Filter by user who issued this order`,
        choices: userFilters.choices
      },
      {
        name: 'assigned_to',
        label: t`Responsible`,
        description: t`Filter by responsible owner`,
        choices: responsibleFilters.choices
      }
    ];
  }, [
    projectCodeFilters.choices,
    userFilters.choices,
    responsibleFilters.choices
  ]);

  const user = useUserState();

  const table = useTable('buildorder');

  const buildOrderFields = useBuildOrderFields({ create: true });

  const newBuild = useCreateApiFormModal({
    url: ApiEndpoints.build_order_list,
    title: t`Add Build Order`,
    fields: buildOrderFields,
    initialData: {
      part: partId,
      sales_order: salesOrderId,
      parent: parentBuildId
    },
    follow: true,
    modelType: ModelType.build
  });

  const tableActions = useMemo(() => {
    return [
      <AddItemButton
        hidden={!user.hasAddRole(UserRoles.build)}
        tooltip={t`Add Build Order`}
        onClick={() => newBuild.open()}
        key="add-build-order"
      />
    ];
  }, [user]);

  return (
    <>
      {newBuild.modal}
      <InvenTreeTable
        url={apiUrl(ApiEndpoints.build_order_list)}
        tableState={table}
        columns={tableColumns}
        props={{
          params: {
            part: partId,
            sales_order: salesOrderId,
            parent: parentBuildId,
            part_detail: true
          },
          tableActions: tableActions,
          tableFilters: tableFilters,
          modelType: ModelType.build,
          enableSelection: true,
          enableReports: true,
          enableDownload: true
        }}
      />
    </>
  );
}
