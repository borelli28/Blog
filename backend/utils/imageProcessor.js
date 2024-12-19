import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export const processUploadedImage = async (file, maxWidth = 1920) => {
  try {
    const image = sharp(file.path);
    const metadata = await image.metadata();
    let pipeline = image.withMetadata(false);  // Remove all metadata

    // Resize if width is larger than maxWidth
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth);
    }

    const processedFilename = `stipespicturam_${file.filename}`;
    const outputPath = path.join(path.dirname(file.path), processedFilename);
    await pipeline.toFile(outputPath);

    // Remove the original file
    await fs.unlink(file.path);

    // Update the file object
    file.filename = processedFilename;
    file.path = outputPath;

    return file;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};