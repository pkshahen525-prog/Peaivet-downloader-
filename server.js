const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Downloads folder
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'YouTube Downloader API is running 🚀' });
});

// ✅ Get video info (title, thumbnail, formats)
app.get('/info', (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  const command = `yt-dlp --dump-json --no-playlist "${url}"`;

  exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch video info', details: stderr });
    }

    try {
      const info = JSON.parse(stdout);
      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        uploader: info.uploader,
        view_count: info.view_count,
        formats: info.formats
          ? info.formats
              .filter(f => f.ext && (f.height || f.abr))
              .map(f => ({
                format_id: f.format_id,
                ext: f.ext,
                quality: f.height ? `${f.height}p` : `audio ${f.abr}kbps`,
                filesize: f.filesize || null,
              }))
          : [],
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse video info' });
    }
  });
});

// ✅ Download video - streams directly to client
app.get('/download', (req, res) => {
  const { url, quality } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  // quality options: 'best', '720', '480', '360', 'audio'
  let formatArg = '-f bestvideo+bestaudio/best';

  if (quality === 'audio') {
    formatArg = '-f bestaudio --extract-audio --audio-format mp3';
  } else if (quality && quality !== 'best') {
    formatArg = `-f "bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]"`;
  }

  const outputTemplate = path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s');
  const command = `yt-dlp ${formatArg} --merge-output-format mp4 -o "${outputTemplate}" --print filename --no-playlist "${url}"`;

  exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Download failed', details: stderr });
    }

    const filePath = stdout.trim();

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: 'File not found after download' });
    }

    const fileName = path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Delete file after sending
    fileStream.on('close', () => {
      fs.unlink(filePath, () => {});
    });
  });
});

// ✅ Download audio only (MP3)
app.get('/download/audio', (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  const outputTemplate = path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s');
  const command = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${outputTemplate}" --print filename --no-playlist "${url}"`;

  exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Audio download failed', details: stderr });
    }

    // yt-dlp changes extension to mp3
    let filePath = stdout.trim().replace(/\.[^.]+$/, '.mp3');

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: 'Audio file not found after download' });
    }

    const fileName = path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('close', () => {
      fs.unlink(filePath, () => {});
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
