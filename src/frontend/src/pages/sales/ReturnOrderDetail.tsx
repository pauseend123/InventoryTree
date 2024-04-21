import { t } from '@lingui/macro';
import { Grid, LoadingOverlay, Skeleton, Stack } from '@mantine/core';
import {
  IconDots,
  IconInfoCircle,
  IconList,
  IconNotes,
  IconPaperclip
} from '@tabler/icons-react';
import { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { DetailsField, DetailsTable } from '../../components/details/Details';
import { DetailsImage } from '../../components/details/DetailsImage';
import { ItemDetailsGrid } from '../../components/details/ItemDetails';
import {
  ActionDropdown,
  DeleteItemAction,
  EditItemAction
} from '../../components/items/ActionDropdown';
import { PageDetail } from '../../components/nav/PageDetail';
import { PanelGroup, PanelType } from '../../components/nav/PanelGroup';
import { StatusRenderer } from '../../components/render/StatusRenderer';
import { NotesEditor } from '../../components/widgets/MarkdownEditor';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { UserRoles } from '../../enums/Roles';
import { useReturnOrderFields } from '../../forms/SalesOrderForms';
import { useEditApiFormModal } from '../../hooks/UseForm';
import { useInstance } from '../../hooks/UseInstance';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import { AttachmentTable } from '../../tables/general/AttachmentTable';

/**
 * Detail page for a single ReturnOrder
 */
export default function ReturnOrderDetail() {
  const { id } = useParams();

  const user = useUserState();

  const {
    instance: order,
    instanceQuery,
    refreshInstance
  } = useInstance({
    endpoint: ApiEndpoints.return_order_list,
    pk: id,
    params: {
      customer_detail: true
    }
  });

  const detailsPanel = useMemo(() => {
    if (instanceQuery.isFetching) {
      return <Skeleton />;
    }

    let tl: DetailsField[] = [
      {
        type: 'text',
        name: 'reference',
        label: t`Reference`,
        copy: true
      },
      {
        type: 'text',
        name: 'customer_reference',
        label: t`Customer Reference`,
        copy: true,
        hidden: !order.customer_reference
      },
      {
        type: 'link',
        name: 'customer',
        icon: 'customers',
        label: t`Customer`,
        model: ModelType.company
      },
      {
        type: 'text',
        name: 'description',
        label: t`Description`,
        copy: true
      },
      {
        type: 'status',
        name: 'status',
        label: t`Status`,
        model: ModelType.salesorder
      }
    ];

    let tr: DetailsField[] = [
      {
        type: 'text',
        name: 'line_items',
        label: t`Line Items`,
        icon: 'list'
      },
      {
        type: 'progressbar',
        name: 'completed',
        icon: 'progress',
        label: t`Completed Line Items`,
        total: order.line_items,
        progress: order.completed_lines
      },
      {
        type: 'progressbar',
        name: 'shipments',
        icon: 'shipment',
        label: t`Completed Shipments`,
        total: order.shipments,
        progress: order.completed_shipments
        // TODO: Fix this progress bar
      },
      {
        type: 'text',
        name: 'currency',
        label: t`Order Currency,`
      },
      {
        type: 'text',
        name: 'total_cost',
        label: t`Total Cost`
        // TODO: Implement this!
      }
    ];

    let bl: DetailsField[] = [
      {
        type: 'link',
        external: true,
        name: 'link',
        label: t`Link`,
        copy: true,
        hidden: !order.link
      },
      {
        type: 'link',
        model: ModelType.contact,
        link: false,
        name: 'contact',
        label: t`Contact`,
        icon: 'user',
        copy: true,
        hidden: !order.contact
      }
      // TODO: Project code
    ];

    let br: DetailsField[] = [
      {
        type: 'text',
        name: 'creation_date',
        label: t`Created On`,
        icon: 'calendar'
      },
      {
        type: 'text',
        name: 'target_date',
        label: t`Target Date`,
        icon: 'calendar',
        hidden: !order.target_date
      },
      {
        type: 'text',
        name: 'responsible',
        label: t`Responsible`,
        badge: 'owner',
        hidden: !order.responsible
      }
    ];

    return (
      <ItemDetailsGrid>
        <Grid>
          <Grid.Col span={4}>
            <DetailsImage
              appRole={UserRoles.purchase_order}
              apiPath={ApiEndpoints.company_list}
              src={order.customer_detail?.image}
              pk={order.customer}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            <DetailsTable fields={tl} item={order} />
          </Grid.Col>
        </Grid>
        <DetailsTable fields={tr} item={order} />
        <DetailsTable fields={bl} item={order} />
        <DetailsTable fields={br} item={order} />
      </ItemDetailsGrid>
    );
  }, [order, instanceQuery]);

  const orderPanels: PanelType[] = useMemo(() => {
    return [
      {
        name: 'detail',
        label: t`Order Details`,
        icon: <IconInfoCircle />,
        content: detailsPanel
      },
      {
        name: 'line-items',
        label: t`Line Items`,
        icon: <IconList />
      },
      {
        name: 'attachments',
        label: t`Attachments`,
        icon: <IconPaperclip />,
        content: (
          <AttachmentTable
            endpoint={ApiEndpoints.return_order_attachment_list}
            model="order"
            pk={Number(id)}
          />
        )
      },
      {
        name: 'notes',
        label: t`Notes`,
        icon: <IconNotes />,
        content: (
          <NotesEditor
            url={apiUrl(ApiEndpoints.return_order_list, id)}
            data={order.notes ?? ''}
            allowEdit={true}
          />
        )
      }
    ];
  }, [order, id]);

  const orderBadges: ReactNode[] = useMemo(() => {
    return instanceQuery.isLoading
      ? []
      : [
          <StatusRenderer
            status={order.status}
            type={ModelType.returnorder}
            options={{ size: 'lg' }}
          />
        ];
  }, [order, instanceQuery]);

  const returnOrderFields = useReturnOrderFields();

  const editReturnOrder = useEditApiFormModal({
    url: ApiEndpoints.return_order_list,
    pk: order.pk,
    title: t`Edit Return Order`,
    fields: returnOrderFields,
    onFormSuccess: () => {
      refreshInstance();
    }
  });

  const orderActions = useMemo(() => {
    return [
      <ActionDropdown
        key="order-actions"
        tooltip={t`Order Actions`}
        icon={<IconDots />}
        actions={[
          EditItemAction({
            hidden: !user.hasChangeRole(UserRoles.return_order),
            onClick: () => {
              editReturnOrder.open();
            }
          }),
          DeleteItemAction({
            hidden: !user.hasDeleteRole(UserRoles.return_order)
            // TODO: Delete?
          })
        ]}
      />
    ];
  }, [user]);

  return (
    <>
      {editReturnOrder.modal}
      <Stack spacing="xs">
        <LoadingOverlay visible={instanceQuery.isFetching} />
        <PageDetail
          title={t`Return Order` + `: ${order.reference}`}
          subtitle={order.description}
          imageUrl={order.customer_detail?.image}
          badges={orderBadges}
          actions={orderActions}
          breadcrumbs={[{ name: t`Sales`, url: '/sales/' }]}
        />
        <PanelGroup pageKey="returnorder" panels={orderPanels} />
      </Stack>
    </>
  );
}
