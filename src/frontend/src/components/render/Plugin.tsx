import { t } from '@lingui/macro';
import { Badge } from '@mantine/core';
import { ReactNode } from 'react';

import { RenderInlineModel } from './Instance';

export function RenderPlugin({ instance }: { instance: any }): ReactNode {
  return (
    <RenderInlineModel
      primary={instance.name}
      secondary={instance.meta?.description}
      suffix={
        !instance.active && <Badge size="sm" color="red">{t`Inactive`}</Badge>
      }
    />
  );
}
