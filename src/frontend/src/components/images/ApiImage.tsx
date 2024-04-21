/**
 * Component for loading an image from the InvenTree server
 *
 * Image caching is handled automagically by the browsers cache
 */
import { Image, ImageProps, Skeleton, Stack } from '@mantine/core';
import { useMemo } from 'react';

import { useLocalState } from '../../states/LocalState';

/**
 * Construct an image container which will load and display the image
 */
export function ApiImage(props: ImageProps) {
  const { host } = useLocalState.getState();

  const imageUrl = useMemo(() => {
    return `${host}${props.src}`;
  }, [host, props.src]);

  return (
    <Stack>
      {imageUrl ? (
        <Image {...props} src={imageUrl} withPlaceholder fit="contain" />
      ) : (
        <Skeleton
          height={props?.height ?? props.width}
          width={props?.width ?? props.height}
        />
      )}
    </Stack>
  );
}
