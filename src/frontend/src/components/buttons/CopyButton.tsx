import { t } from '@lingui/macro';
import { Button, CopyButton as MantineCopyButton } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';

export function CopyButton({
  value,
  label
}: {
  value: any;
  label?: JSX.Element;
}) {
  return (
    <MantineCopyButton value={value}>
      {({ copied, copy }) => (
        <Button
          color={copied ? 'teal' : 'gray'}
          onClick={copy}
          title={t`Copy to clipboard`}
          variant="subtle"
          size="compact-md"
        >
          <IconCopy size={10} />
          {label && <div>&nbsp;</div>}
          {label && label}
        </Button>
      )}
    </MantineCopyButton>
  );
}
