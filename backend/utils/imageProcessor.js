import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export const processUploadedImage = async (file) => {
  try {
    const image = sharp(file.path);
    const metadata = await image.metadata();
    let pipeline = image.withMetadata(false);  // Remove all metadata

    const targetWidth = 1780;
    const targetHeight = 1370;

    // Resize image to fit within target dimensions while maintaining aspect ratio
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: 'inside',  // Ensures the image fits inside the target dimensions
      withoutEnlargement: true  // Prevents upscaling smaller images
    });

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