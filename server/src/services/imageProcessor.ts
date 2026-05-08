import { exiftool, Tags } from 'exiftool-vendored';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

export interface MetadataPayload {
  lat: number;
  lng: number;
  alt?: number;
  headline?: string;
  description?: string;
  keywords?: string[];
}

export class ImageProcessor {
  /**
   * Inject GPS and IPTC metadata into an image and ensure output is PNG
   */
  static async injectMetadata(inputPath: string, outputPath: string, data: MetadataPayload): Promise<void> {
    const { lat, lng, alt = 0, headline, description, keywords } = data;

    // 1. Create a temporary PNG version of the input if it's not already PNG
    const tempPngPath = inputPath + '.temp.png';
    await sharp(inputPath)
      .png() // Enforce PNG format
      .toFile(tempPngPath);

    const tags: Tags = {
      GPSLatitude: lat,
      GPSLatitudeRef: lat >= 0 ? 'N' : 'S',
      GPSLongitude: lng,
      GPSLongitudeRef: lng >= 0 ? 'E' : 'W',
      GPSAltitude: alt,
      GPSAltitudeRef: alt >= 0 ? 0 : 1,
    };

    // Add IPTC/XMP tags if provided
    if (headline) {
      tags.Headline = headline;
      tags.Title = headline; // Sync with XMP Title
    }
    
    if (description) {
      tags.CaptionAbstract = description;
      tags.Description = description; // Sync with XMP Description
    }

    if (keywords && keywords.length > 0) {
      tags.Keywords = keywords;
      tags.Subject = keywords; // Sync with XMP Subject
    }

    // 2. Use exiftool to write metadata to the PNG file
    await exiftool.write(tempPngPath, tags);

    // 3. Move the tagged PNG to the final output path
    if (fs.existsSync(tempPngPath)) {
      fs.renameSync(tempPngPath, outputPath);
    }

    // Cleanup exiftool backup if it exists
    const backupPath = outputPath + '_original';
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  }

  /**
   * Get metadata from an image and format it for our frontend
   */
  static async getMetadata(imagePath: string): Promise<any> {
    const tags = await exiftool.read(imagePath);
    
    return {
      lat: tags.GPSLatitude,
      lng: tags.GPSLongitude,
      alt: tags.GPSAltitude,
      headline: tags.Headline || tags.Title,
      description: tags.CaptionAbstract || tags.Description,
      keywords: tags.Keywords || tags.Subject,
      make: tags.Make,
      model: tags.Model,
      dateTime: tags.DateTimeOriginal || tags.CreateDate,
    };
  }

  /**
   * Get elevation for coordinates using Open-Elevation API
   */
  static async getElevation(lat: number, lng: number): Promise<number> {
    try {
      const response = await axios.get(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
      if (response.data && response.data.results && response.data.results[0]) {
        return Math.round(response.data.results[0].elevation);
      }
      return 0;
    } catch (error) {
      console.error('Elevation lookup failed:', error);
      return 0;
    }
  }

  /**
   * Compress image using sharp
   */
  static async compressImage(inputPath: string, outputPath: string, quality: number = 80): Promise<void> {
    await sharp(inputPath)
      .png({ compressionLevel: 9 }) // PNG compression
      .toFile(outputPath);
  }
}
