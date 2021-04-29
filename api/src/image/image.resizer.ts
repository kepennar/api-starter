import { Image } from "@agado/model";
import sharp from "sharp";
import { Readable } from "stream";

const IMAGE_WIDTHS = {
  large: 720,
  medium: 150,
  small: 32,
};
type IMAGE_SIZE = "originalImage" | "smallImage" | "mediumImage" | "largeImage";

export function cropImage(inStream: Readable, cropData: Image.CropData) {
  const cropStream = sharp().extract(cropData);
  return inStream.pipe(cropStream);
}

export async function resizeImage(
  inStream: Readable
): Promise<{ [size in IMAGE_SIZE]: Readable }> {
  const toOriginalSharpStream = sharp().webp({ lossless: true });
  const toLargeSharpStream = sharp()
    .resize({ width: IMAGE_WIDTHS.large })
    .webp({ lossless: true });
  const toMediumSharpStream = sharp()
    .resize({ width: IMAGE_WIDTHS.medium })
    .webp({ lossless: true });
  const toSmallSharpStream = sharp()
    .resize({ width: IMAGE_WIDTHS.small })
    .webp({ lossless: true });

  const [
    originalImage,
    smallImage,
    mediumImage,
    largeImage,
  ] = await Promise.all([
    inStream.pipe(toOriginalSharpStream),
    inStream.pipe(toSmallSharpStream),
    inStream.pipe(toMediumSharpStream),
    inStream.pipe(toLargeSharpStream),
  ]);
  return {
    originalImage,
    smallImage,
    mediumImage,
    largeImage,
  };
}
