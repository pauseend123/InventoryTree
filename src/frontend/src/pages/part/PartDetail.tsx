import { t } from '@lingui/macro';
import { Group, LoadingOverlay, Skeleton, Stack, Text } from '@mantine/core';
import {
  IconBookmarks,
  IconBuilding,
  IconBuildingFactory2,
  IconCalendarStats,
  IconClipboardList,
  IconCurrencyDollar,
  IconDots,
  IconInfoCircle,
  IconLayersLinked,
  IconList,
  IconListTree,
  IconNotes,
  IconPackages,
  IconPaperclip,
  IconShoppingCart,
  IconStack2,
  IconTestPipe,
  IconTools,
  IconTransfer,
  IconTruckDelivery,
  IconVersions
} from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { api } from '../../App';
import {
  ActionDropdown,
  BarcodeActionDropdown,
  DeleteItemAction,
  DuplicateItemAction,
  EditItemAction,
  LinkBarcodeAction,
  UnlinkBarcodeAction,
  ViewBarcodeAction
} from '../../components/items/ActionDropdown';
import {
  DetailsImageType,
  ItemDetailFields,
  ItemDetails
} from '../../components/nav/ItemDetails';
import { PageDetail } from '../../components/nav/PageDetail';
import { PanelGroup, PanelType } from '../../components/nav/PanelGroup';
import { PartCategoryTree } from '../../components/nav/PartCategoryTree';
import { DetailsField } from '../../components/tables/Details';
import { BomTable } from '../../components/tables/bom/BomTable';
import { UsedInTable } from '../../components/tables/bom/UsedInTable';
import { BuildOrderTable } from '../../components/tables/build/BuildOrderTable';
import { AttachmentTable } from '../../components/tables/general/AttachmentTable';
import { PartParameterTable } from '../../components/tables/part/PartParameterTable';
import PartTestTemplateTable from '../../components/tables/part/PartTestTemplateTable';
import { PartVariantTable } from '../../components/tables/part/PartVariantTable';
import { RelatedPartTable } from '../../components/tables/part/RelatedPartTable';
import { ManufacturerPartTable } from '../../components/tables/purchasing/ManufacturerPartTable';
import { SupplierPartTable } from '../../components/tables/purchasing/SupplierPartTable';
import { SalesOrderTable } from '../../components/tables/sales/SalesOrderTable';
import { StockItemTable } from '../../components/tables/stock/StockItemTable';
import { NotesEditor } from '../../components/widgets/MarkdownEditor';
import { formatPriceRange } from '../../defaults/formatters';
import { ApiPaths } from '../../enums/ApiEndpoints';
import { editPart } from '../../forms/PartForms';
import { useInstance } from '../../hooks/UseInstance';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';

/**
 * Detail view for a single Part instance
 */
export default function PartDetail() {
  const { id } = useParams();

  const user = useUserState();

  const [treeOpen, setTreeOpen] = useState(false);

  const {
    instance: part,
    refreshInstance,
    instanceQuery
  } = useInstance({
    endpoint: ApiPaths.part_list,
    pk: id,
    params: {
      path_detail: true
    },
    refetchOnMount: true
  });

  const detailFields = (part: any): ItemDetailFields => {
    let left: DetailsField[] = [];
    let right: DetailsField[] = [];
    let bottom_right: DetailsField[] = [];
    let bottom_left: DetailsField[] = [];

    let image: DetailsImageType = {
      name: 'image',
      imageActions: {
        selectExisting: true,
        uploadFile: true,
        deleteFile: true
      }
    };

    left.push({
      type: 'text',
      name: 'description',
      label: t`Description`
    });

    if (part.variant_of) {
      left.push({
        type: 'link',
        name: 'variant_of',
        label: t`Variant of`,
        path: ApiPaths.part_list,
        dest: '/part/'
      });
    }

    right.push({
      type: 'string',
      name: 'unallocated_stock',
      unit: true,
      label: t`Available Stock`
    });

    right.push({
      type: 'string',
      name: 'total_in_stock',
      unit: true,
      label: t`In Stock`
    });

    if (part.minimum_stock) {
      right.push({
        type: 'string',
        name: 'minimum_stock',
        unit: true,
        label: t`Minimum Stock`
      });
    }

    if (part.ordering <= 0) {
      right.push({
        type: 'string',
        name: 'ordering',
        label: t`On order`,
        unit: true
      });
    }

    if (
      part.assembly &&
      (part.allocated_to_build_orders > 0 || part.required_for_build_orders > 0)
    ) {
      right.push({
        type: 'progressbar',
        name: 'allocated_to_build_orders',
        total: 'required_for_build_orders',
        progress: 'allocated_to_build_orders',
        label: t`Allocated to Build Orders`
      });
    }

    if (part.salable && part.allocated_to_sales_orders > 0) {
      right.push({
        type: 'progressbar',
        name: 'allocated_to_sales_orders',
        total: 'allocated_to_sales_orders',
        progress: 'allocated_to_sales_orders',
        label: t`Allocated to Sales Orders`
      });
    }

    if (part.assembly) {
      right.push({
        type: 'string',
        name: 'can_build',
        unit: true,
        label: t`Can Build`
      });
    }

    if (part.assembly) {
      right.push({
        type: 'string',
        name: 'building',
        unit: true,
        label: t`Building`
      });
    }

    if (part.category) {
      bottom_left.push({
        type: 'link',
        name: 'category',
        label: t`Category`,
        path: ApiPaths.category_list,
        dest: '/part/category/'
      });
    }

    if (part.IPN) {
      bottom_left.push({
        type: 'string',
        name: 'IPN',
        label: t`IPN`
      });
    }

    if (part.revision) {
      bottom_left.push({
        type: 'string',
        name: 'revision',
        label: t`Revision`
      });
    }

    if (part.units) {
      bottom_left.push({
        type: 'string',
        name: 'units',
        label: t`Units`
      });
    }

    if (part.keywords) {
      bottom_left.push({
        type: 'string',
        name: 'keywords',
        label: t`Keywords`
      });
    }

    bottom_right.push([
      {
        type: 'string',
        name: 'creation_date',
        label: t`Creation Date`
      },
      {
        type: 'string',
        name: 'creation_user',
        owner: true,
        user: true
      }
    ]);

    id &&
      bottom_right.push({
        type: 'string',
        name: 'pricing',
        label: t`Price Range`,
        value_formatter: () => {
          const { data } = useSuspenseQuery({
            queryKey: ['pricing', id],
            queryFn: async () => {
              const url = apiUrl(ApiPaths.part_pricing_get, null, { id: id });

              return api
                .get(url)
                .then((response) => {
                  switch (response.status) {
                    case 200:
                      return response.data;
                    default:
                      return null;
                  }
                })
                .catch((error) => {
                  return null;
                });
            }
          });

          return formatPriceRange(data.overall_min, data.overall_max);
        }
      });

    id &&
      bottom_right.push([
        {
          type: 'string',
          name: 'stocktake',
          label: t`Last Stocktake`,
          unit: true,
          value_formatter: () => {
            const { data } = useSuspenseQuery({
              queryKey: ['stocktake', id],
              queryFn: async () => {
                const url = apiUrl(ApiPaths.part_stocktake_list);

                return api
                  .get(url, { params: { part: id, ordering: 'date' } })
                  .then((response) => {
                    switch (response.status) {
                      case 200:
                        return response.data[response.data.length - 1];
                      default:
                        return null;
                    }
                  })
                  .catch((error) => {
                    console.error(`Error fetching instance ${url}:`, error);
                    return null;
                  });
              }
            });
            return [data.quantity, data.user];
          }
        },
        {
          type: 'string',
          name: 'creation_user',
          owner: true,
          user: true
        }
      ]);

    if (part.default_location) {
      bottom_right.push({
        type: 'link',
        name: 'default_location',
        label: t`Default Location`,
        path: ApiPaths.stock_location_list,
        dest: '/stock/location/'
      });
    }

    if (part.default_supplier) {
      bottom_right.push({
        type: 'link',
        name: 'default_supplier',
        label: t`Default Supplier`,
        path: ApiPaths.supplier_part_list,
        dest: '/part/'
      });
    }

    if (part.link) {
      bottom_right.push({
        type: 'link',
        name: 'link',
        label: t`Link`,
        external: true
      });
    }

    if (part.responsible) {
      bottom_right.push({
        type: 'string',
        name: 'responsible',
        label: t`responsible`,
        owner: true
      });
    }

    let fields: ItemDetailFields = {
      left: left,
      right: right,
      bottom_left: bottom_left,
      bottom_right: bottom_right,
      image: image
    };

    return fields;
  };

  // Part data panels (recalculate when part data changes)
  const partPanels: PanelType[] = useMemo(() => {
    return [
      {
        name: 'details',
        label: t`Details`,
        icon: <IconInfoCircle />,
        content: !instanceQuery.isFetching && (
          <ItemDetails
            params={part}
            apiPath={apiUrl(ApiPaths.part_list, part.pk)}
            refresh={refreshInstance}
            fields={detailFields(part)}
            partModel
          />
        )
      },
      {
        name: 'parameters',
        label: t`Parameters`,
        icon: <IconList />,
        content: <PartParameterTable partId={id ?? -1} />
      },
      {
        name: 'stock',
        label: t`Stock`,
        icon: <IconPackages />,
        content: (
          <StockItemTable
            params={{
              part: part.pk ?? -1
            }}
          />
        )
      },
      {
        name: 'variants',
        label: t`Variants`,
        icon: <IconVersions />,
        hidden: !part.is_template,
        content: <PartVariantTable partId={String(id)} />
      },
      {
        name: 'allocations',
        label: t`Allocations`,
        icon: <IconBookmarks />,
        hidden: !part.component && !part.salable
      },
      {
        name: 'bom',
        label: t`Bill of Materials`,
        icon: <IconListTree />,
        hidden: !part.assembly,
        content: <BomTable partId={part.pk ?? -1} />
      },
      {
        name: 'builds',
        label: t`Build Orders`,
        icon: <IconTools />,
        hidden: !part.assembly,
        content: (
          <BuildOrderTable
            params={{
              part_detail: true,
              part: part.pk ?? -1
            }}
          />
        )
      },
      {
        name: 'used_in',
        label: t`Used In`,
        icon: <IconStack2 />,
        hidden: !part.component,
        content: <UsedInTable partId={part.pk ?? -1} />
      },
      {
        name: 'pricing',
        label: t`Pricing`,
        icon: <IconCurrencyDollar />
      },
      {
        name: 'manufacturers',
        label: t`Manufacturers`,
        icon: <IconBuildingFactory2 />,
        hidden: !part.purchaseable,
        content: part.pk && (
          <ManufacturerPartTable
            params={{
              part: part.pk
            }}
          />
        )
      },
      {
        name: 'suppliers',
        label: t`Suppliers`,
        icon: <IconBuilding />,
        hidden: !part.purchaseable,
        content: part.pk && (
          <SupplierPartTable
            params={{
              part: part.pk
            }}
          />
        )
      },
      {
        name: 'purchase_orders',
        label: t`Purchase Orders`,
        icon: <IconShoppingCart />,
        hidden: !part.purchaseable
      },
      {
        name: 'sales_orders',
        label: t`Sales Orders`,
        icon: <IconTruckDelivery />,
        hidden: !part.salable,
        content: part.pk ? (
          <SalesOrderTable
            params={{
              part: part.pk ?? -1
            }}
          />
        ) : (
          <Skeleton />
        )
      },
      {
        name: 'scheduling',
        label: t`Scheduling`,
        icon: <IconCalendarStats />
      },
      {
        name: 'stocktake',
        label: t`Stocktake`,
        icon: <IconClipboardList />
      },
      {
        name: 'test_templates',
        label: t`Test Templates`,
        icon: <IconTestPipe />,
        hidden: !part.trackable,
        content: part?.pk ? (
          <PartTestTemplateTable partId={part?.pk} />
        ) : (
          <Skeleton />
        )
      },
      {
        name: 'related_parts',
        label: t`Related Parts`,
        icon: <IconLayersLinked />,
        content: <RelatedPartTable partId={part.pk ?? -1} />
      },
      {
        name: 'attachments',
        label: t`Attachments`,
        icon: <IconPaperclip />,
        content: (
          <AttachmentTable
            endpoint={ApiPaths.part_attachment_list}
            model="part"
            pk={part.pk ?? -1}
          />
        )
      },
      {
        name: 'notes',
        label: t`Notes`,
        icon: <IconNotes />,
        content: (
          <NotesEditor
            url={apiUrl(ApiPaths.part_list, part.pk)}
            data={part.notes ?? ''}
            allowEdit={true}
          />
        )
      }
    ];
  }, [id, part]);

  const breadcrumbs = useMemo(
    () => [
      { name: t`Parts`, url: '/part' },
      ...(part.category_path ?? []).map((c: any) => ({
        name: c.name,
        url: `/part/category/${c.pk}`
      }))
    ],
    [part]
  );

  const partDetail = useMemo(() => {
    return (
      <Group spacing="xs" noWrap={true}>
        <Stack spacing="xs">
          <Text>Stock: {part.in_stock}</Text>
        </Stack>
      </Group>
    );
  }, [part, id]);

  const partActions = useMemo(() => {
    // TODO: Disable actions based on user permissions
    return [
      <BarcodeActionDropdown
        actions={[
          ViewBarcodeAction({}),
          LinkBarcodeAction({
            disabled: part?.barcode_hash
          }),
          UnlinkBarcodeAction({
            disabled: !part?.barcode_hash
          })
        ]}
      />,
      <ActionDropdown
        key="stock"
        tooltip={t`Stock Actions`}
        icon={<IconPackages />}
        actions={[
          {
            icon: <IconClipboardList color="blue" />,
            name: t`Count Stock`,
            tooltip: t`Count part stock`
          },
          {
            icon: <IconTransfer color="blue" />,
            name: t`Transfer Stock`,
            tooltip: t`Transfer part stock`
          }
        ]}
      />,
      <ActionDropdown
        key="part"
        tooltip={t`Part Actions`}
        icon={<IconDots />}
        actions={[
          DuplicateItemAction({}),
          EditItemAction({
            onClick: () => {
              part.pk &&
                editPart({
                  part_id: part.pk,
                  callback: refreshInstance
                });
            }
          }),
          DeleteItemAction({
            disabled: part?.active
          })
        ]}
      />
    ];
  }, [id, part, user]);

  return (
    <>
      <Stack spacing="xs">
        <LoadingOverlay visible={instanceQuery.isFetching} />
        <PartCategoryTree
          opened={treeOpen}
          onClose={() => {
            setTreeOpen(false);
          }}
          selectedCategory={part?.category}
        />
        <PageDetail
          title={t`Part` + ': ' + part.full_name}
          subtitle={part.description}
          imageUrl={part.image}
          detail={partDetail}
          breadcrumbs={breadcrumbs}
          breadcrumbAction={() => {
            setTreeOpen(true);
          }}
          actions={partActions}
        />
        <PanelGroup pageKey="part" panels={partPanels} />
      </Stack>
    </>
  );
}
