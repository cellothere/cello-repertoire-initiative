import { forwardRef, useCallback, useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * next/image that fades in once its pixels have arrived, instead of painting in line by line.
 * Priority (above-the-fold) images skip the fade so they show the moment they load.
 */
const FadeImage = forwardRef<HTMLImageElement, ImageProps>(function FadeImage({ alt, onLoad, style, priority, ...props }, forwardedRef) {
  const [loaded, setLoaded] = useState(false);

  // An image already in the cache may finish before React hydrates and never fire onLoad.
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) setLoaded(true);
      if (typeof forwardedRef === 'function') forwardedRef(img);
      else if (forwardedRef) forwardedRef.current = img;
    },
    [forwardedRef]
  );

  return (
    <Image
      {...props}
      alt={alt}
      ref={ref}
      priority={priority}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      style={{
        ...style,
        ...(priority
          ? null
          : { opacity: loaded ? 1 : 0, transition: `opacity 700ms ${EASE}, transform 500ms ${EASE}` }),
      }}
    />
  );
});

export default FadeImage;
