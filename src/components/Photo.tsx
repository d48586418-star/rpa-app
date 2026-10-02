import { Image, type ImageProps } from 'expo-image';
import { PHOTOS } from '../constants/photos';
import { isPhotoRef, photoKey } from '../lib/photoKeys';

/** Resolve uma foto por chave empacotada, "photo:chave", URL ou URI local. */
export function photoSource(ref: string | null | undefined): ImageProps['source'] | null {
  if (!ref) return null;
  const key = isPhotoRef(ref) ? photoKey(ref) : ref;
  if (PHOTOS[key]) return PHOTOS[key] as ImageProps['source'];
  if (/^(https?:|file:|blob:|data:|content:)/.test(ref)) return { uri: ref };
  return null;
}

export function Photo({ photo, style, ...rest }: { photo: string | null | undefined } & Omit<ImageProps, 'source'>) {
  const source = photoSource(photo);
  if (!source) return null;
  return <Image source={source} style={style} contentFit="cover" transition={150} {...rest} />;
}
