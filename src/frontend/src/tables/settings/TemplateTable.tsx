import { Trans, t } from '@lingui/macro';
import { Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { IconFileCode } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../App';
import { AddItemButton } from '../../components/buttons/AddItemButton';
import {
  CodeEditor,
  PdfPreview,
  TemplateEditor
} from '../../components/editors/TemplateEditor';
import { ApiFormFieldSet } from '../../components/forms/fields/ApiFormField';
import { DetailDrawer } from '../../components/nav/DetailDrawer';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { resolveItem } from '../../functions/conversion';
import { useFilters } from '../../hooks/UseFilter';
import {
  useCreateApiFormModal,
  useDeleteApiFormModal,
  useEditApiFormModal
} from '../../hooks/UseForm';
import { useInstance } from '../../hooks/UseInstance';
import { useTable } from '../../hooks/UseTable';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import { TableColumn } from '../Column';
import { BooleanColumn } from '../ColumnRenderers';
import { TableFilter, TableFilterChoice } from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';
import {
  RowAction,
  RowDeleteAction,
  RowDuplicateAction,
  RowEditAction
} from '../RowActions';

export type TemplateI = {
  pk: number;
  name: string;
  description: string;
  model_type: ModelType;
  filters: string;
  filename_pattern: string;
  enabled: boolean;
  template: string;
};

export interface TemplateProps {
  templateEndpoint: ApiEndpoints;
  printingEndpoint: ApiEndpoints;
  templateType: 'label' | 'report';
  additionalFormFields?: ApiFormFieldSet;
}

export function TemplateDrawer({
  id,
  templateProps
}: {
  id: string | number;
  templateProps: TemplateProps;
}) {
  const { templateEndpoint, printingEndpoint, templateType } = templateProps;

  const {
    instance: template,
    instanceQuery: { isFetching, error }
  } = useInstance<TemplateI>({
    endpoint: templateEndpoint,
    hasPrimaryKey: true,
    pk: id,
    throwError: true
  });

  if (isFetching) {
    return <LoadingOverlay visible={true} />;
  }

  if (error || !template) {
    return (
      <Text>
        {(error as any)?.response?.status === 404 ? (
          <Trans>Template not found</Trans>
        ) : (
          <Trans>An error occurred while fetching template details</Trans>
        )}
      </Text>
    );
  }

  return (
    <Stack spacing="xs" style={{ display: 'flex', flex: '1' }}>
      <Group position="left">
        <Title order={4}>{template?.name}</Title>
      </Group>

      <TemplateEditor
        templateUrl={apiUrl(templateEndpoint, id)}
        printingUrl={apiUrl(printingEndpoint)}
        templateType={templateType}
        template={template}
        editors={[CodeEditor]}
        previewAreas={[PdfPreview]}
      />
    </Stack>
  );
}

export function TemplateTable({
  templateProps
}: {
  templateProps: TemplateProps;
}) {
  const { templateEndpoint, templateType, additionalFormFields } =
    templateProps;

  const table = useTable(`${templateType}-template`);
  const navigate = useNavigate();
  const user = useUserState();

  const openDetailDrawer = useCallback((pk: number) => navigate(`${pk}/`), []);

  const columns: TableColumn<TemplateI>[] = useMemo(() => {
    return [
      {
        accessor: 'name',
        sortable: true,
        switchable: false
      },
      {
        accessor: 'description',
        sortable: false,
        switchable: true
      },
      {
        accessor: 'template',
        sortable: false,
        switchable: true,
        render: (record: any) => {
          return record.template?.split('/')?.pop() ?? '-';
        }
      },
      {
        accessor: 'model_type',
        sortable: true,
        switchable: false
      },
      {
        accessor: 'revision',
        sortable: false,
        switchable: true
      },
      {
        accessor: 'filters',
        sortable: false,
        switchable: true
      },
      ...Object.entries(additionalFormFields || {})?.map(([key, field]) => ({
        accessor: key,
        sortable: false,
        switchable: true
      })),
      BooleanColumn({ accessor: 'enabled', title: t`Enabled` })
    ];
  }, [additionalFormFields]);

  const [selectedTemplate, setSelectedTemplate] = useState<number>(-1);

  const rowActions = useCallback(
    (record: TemplateI): RowAction[] => {
      return [
        {
          title: t`Modify`,
          tooltip: t`Modify template file`,
          icon: <IconFileCode />,
          onClick: () => openDetailDrawer(record.pk)
        },
        RowEditAction({
          onClick: () => {
            setSelectedTemplate(record.pk);
            editTemplate.open();
          }
        }),
        RowDuplicateAction({
          // TODO: Duplicate selected template
        }),
        RowDeleteAction({
          onClick: () => {
            setSelectedTemplate(record.pk);
            deleteTemplate.open();
          }
        })
      ];
    },
    [user]
  );

  const templateFields: ApiFormFieldSet = {
    name: {},
    description: {},
    model_type: {},
    filters: {},
    filename_pattern: {},
    enabled: {}
  };

  const editTemplateFields: ApiFormFieldSet = useMemo(() => {
    return {
      ...templateFields,
      ...additionalFormFields
    };
  }, [additionalFormFields]);

  const newTemplateFields: ApiFormFieldSet = useMemo(() => {
    return {
      template: {},
      ...templateFields,
      ...additionalFormFields
    };
  }, [additionalFormFields]);

  const editTemplate = useEditApiFormModal({
    url: templateEndpoint,
    pk: selectedTemplate,
    title: t`Edit Template`,
    fields: editTemplateFields,
    onFormSuccess: (record: any) => table.updateRecord(record)
  });

  const deleteTemplate = useDeleteApiFormModal({
    url: templateEndpoint,
    pk: selectedTemplate,
    title: t`Delete template`,
    onFormSuccess: table.refreshTable
  });

  const newTemplate = useCreateApiFormModal({
    url: templateEndpoint,
    title: t`Add Template`,
    fields: newTemplateFields,
    onFormSuccess: (data) => {
      table.refreshTable();
      openDetailDrawer(data.pk);
    }
  });

  const tableActions: ReactNode[] = useMemo(() => {
    return [
      <AddItemButton
        key={`add-${templateType}`}
        onClick={() => newTemplate.open()}
        tooltip={t`Add template`}
      />
    ];
  }, []);

  const modelTypeFilters = useFilters({
    url: apiUrl(templateEndpoint),
    method: 'OPTIONS',
    accessor: 'data.actions.POST.model_type.choices',
    transform: (item: any) => {
      return {
        value: item.value,
        label: item.display_name
      };
    }
  });

  const tableFilters: TableFilter[] = useMemo(() => {
    return [
      {
        name: 'enabled',
        label: t`Enabled`,
        description: t`Filter by enabled status`,
        type: 'checkbox'
      },
      {
        name: 'model_type',
        label: t`Model Type`,
        description: t`Filter by target model type`,
        choices: modelTypeFilters.choices
      }
    ];
  }, [modelTypeFilters.choices]);

  return (
    <>
      {newTemplate.modal}
      {editTemplate.modal}
      {deleteTemplate.modal}
      <DetailDrawer
        title={t`Edit Template`}
        size={'90%'}
        closeOnEscape={false}
        renderContent={(id) => {
          return <TemplateDrawer id={id ?? ''} templateProps={templateProps} />;
        }}
      />
      <InvenTreeTable
        url={apiUrl(templateEndpoint)}
        tableState={table}
        columns={columns}
        props={{
          rowActions: rowActions,
          tableFilters: tableFilters,
          tableActions: tableActions,
          onRowClick: (record) => openDetailDrawer(record.pk)
        }}
      />
    </>
  );
}
