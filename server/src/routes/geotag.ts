import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { ImageProcessor, MetadataPayload } from '../services/imageProcessor';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/**
 * GET /api/geotag/elevation
 * Fetches elevation for coordinates
 */
router.get('/elevation', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Lat and Lng are required' });
  }
  const elevation = await ImageProcessor.getElevation(parseFloat(lat as string), parseFloat(lng as string));
  res.json({ elevation });
});

/**
 * POST /api/geotag/extract-metadata
 * Extracts existing metadata from an image
 */
router.post('/extract-metadata', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    const metadata = await ImageProcessor.getMetadata(file.path);
    res.json(metadata);
  } catch (error: any) {
    console.error('Error extracting metadata:', error);
    res.status(500).json({ error: 'Extraction failed', details: error.message });
  }
});

/**
 * POST /api/geotag/process
 * Processes images by injecting GPS and IPTC metadata
 * Supports multiple images and returns a ZIP if more than one
 */
router.post('/process', upload.array('images'), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { lat, lng, alt, headline, description, keywords } = req.body;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No images uploaded' });
      return;
    }

    if (!lat || !lng) {
      res.status(400).json({ error: 'Coordinates are required' });
      return;
    }

    const metadata: MetadataPayload = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      alt: alt ? parseFloat(alt) : undefined,
      headline: headline || undefined,
      description: description || undefined,
      keywords: keywords ? (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords) : undefined
    };

    const processedFiles = [];
    const outputDir = path.join(__dirname, '../../uploads');

    for (const file of files) {
      const inputPath = file.path;
      const outputFilename = 'geotagged-' + path.parse(file.filename).name + '.png';
      const outputPath = path.join(outputDir, outputFilename);

      await ImageProcessor.injectMetadata(inputPath, outputPath, metadata);
      
      processedFiles.push({
        originalName: file.originalname,
        filename: outputFilename,
        path: outputPath
      });
    }

    // If multiple files, create a ZIP
    if (processedFiles.length > 1) {
      const zipFilename = `geotagged-batch-${Date.now()}.zip`;
      const zipPath = path.join(outputDir, zipFilename);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        res.json({
          message: 'Bulk processing complete',
          isZip: true,
          zipUrl: `/api/geotag/download/${zipFilename}`,
          files: processedFiles.map(f => ({ originalName: f.originalName, filename: f.filename }))
        });
      });

      archive.pipe(output);
      processedFiles.forEach(file => {
        archive.file(file.path, { name: file.originalName.replace(/\.[^/.]+$/, "") + ".png" });
      });
      await archive.finalize();
    } else {
      res.json({
        message: 'Processing complete',
        isZip: false,
        files: [{
          originalName: processedFiles[0].originalName,
          filename: processedFiles[0].filename,
          downloadUrl: `/api/geotag/download/${processedFiles[0].filename}`
        }]
      });
    }
  } catch (error: any) {
    console.error('Error processing images:', error);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  }
});

/**
 * GET /api/geotag/download/:filename
 * Downloads a processed file
 */
router.get('/download/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
