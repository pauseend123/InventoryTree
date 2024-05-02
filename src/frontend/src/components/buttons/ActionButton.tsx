import { ActionIcon, FloatingPosition, Group, Tooltip } from '@mantine/core';
import { ReactNode } from 'react';

import { notYetImplemented } from '../../functions/notifications';

export type ActionButtonProps = {
  key?: string;
  icon?: ReactNode;
  text?: string;
  color?: string;
  tooltip?: string;
  variant?: string;
  size?: number | string;
  disabled?: boolean;
  onClick?: any;
  hidden?: boolean;
  tooltipAlignment?: FloatingPosition;
};

/**
 * Construct a simple action button with consistent styling
 */
export function ActionButton(props: ActionButtonProps) {
  const hidden = props.hidden ?? false;

  return (
    !hidden && (
      <Tooltip
        key={`tooltip-${props.key}`}
        disabled={!props.tooltip && !props.text}
        label={props.tooltip ?? props.text}
        position={props.tooltipAlignment ?? 'left'}
      >
        <ActionIcon
          key={`action-icon-${props.key}`}
          disabled={props.disabled}
          radius="xs"
          color={props.color}
          size={props.size}
          onClick={props.onClick ?? notYetImplemented}
          variant={props.variant ?? 'light'}
        >
          <Group gap="xs" wrap="nowrap">
            {props.icon}
          </Group>
        </ActionIcon>
      </Tooltip>
    )
  );
}
