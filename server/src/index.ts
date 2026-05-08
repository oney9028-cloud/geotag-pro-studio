import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geotagRoutes from './routes/geotag';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

app.use('/api/geotag', geotagRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  const { exiftool } = await import('exiftool-vendored');
  await exiftool.end();
  process.exit();
});

process.on('SIGTERM', async () => {
  const { exiftool } = await import('exiftool-vendored');
  await exiftool.end();
  process.exit();
});
