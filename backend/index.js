const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const libre = require('libreoffice-convert');
const fs = require('fs');
const { exec } = require('child_process');
const sharp = require('sharp');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Cấu hình lưu file tạm thời trên server
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Middleware ghi log
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const log = {
      time: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start
    };
    logStream.write(JSON.stringify(log) + '\n');
  });
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend API hoạt động!' });
});

// API upload file PDF/DOCX
app.post('/api/upload-doc', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Chưa có file tải lên' });
  res.json({
    message: 'Đã nhận file',
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// API upload ảnh
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Chưa có file ảnh tải lên' });
  res.json({
    message: 'Đã nhận ảnh',
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// API nhận URL TikTok
app.post('/api/tiktok', express.json(), (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Chưa có URL TikTok' });
  res.json({
    message: 'Đã nhận URL TikTok',
    url
  });
});

// API chuyển đổi PDF <-> DOCX
app.post('/api/convert-doc', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Chưa có file tải lên' });
  const ext = path.extname(req.file.originalname).toLowerCase();
  let targetExt = '';
  if (ext === '.pdf') targetExt = '.docx';
  else if (ext === '.docx') targetExt = '.pdf';
  else return res.status(400).json({ error: 'Chỉ hỗ trợ PDF hoặc DOCX' });

  const inputPath = req.file.path;
  const outputPath = inputPath + targetExt;
  const fileBuffer = fs.readFileSync(inputPath);

  try {
    libre.convert(fileBuffer, targetExt, undefined, (err, done) => {
      if (err) {
        // Không để server crash, chỉ trả lỗi cho client
        return res.status(500).json({ error: 'Lỗi chuyển đổi file', detail: err.message });
      }
      fs.writeFileSync(outputPath, done);
      res.download(outputPath, path.basename(req.file.originalname, ext) + targetExt, (err) => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi chuyển đổi', detail: err.message });
  }
});

// API chuyển đổi định dạng ảnh
app.post('/api/convert-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Chưa có file ảnh tải lên' });
    const { format, width, height, quality } = req.body;
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
    if (!format || !allowedFormats.includes(format)) {
      return res.status(400).json({ error: 'Định dạng ảnh không hợp lệ (jpeg, jpg, png, webp)' });
    }
    let img = sharp(req.file.path);
    if (width || height) {
      img = img.resize(width ? parseInt(width) : null, height ? parseInt(height) : null);
    }
    if (format === 'jpeg' || format === 'jpg') {
      img = img.jpeg({ quality: quality ? parseInt(quality) : 80 });
    } else if (format === 'png') {
      img = img.png({ quality: quality ? parseInt(quality) : 80 });
    } else if (format === 'webp') {
      img = img.webp({ quality: quality ? parseInt(quality) : 80 });
    }
    const outputPath = req.file.path + '.' + format;
    await img.toFile(outputPath);
    res.download(outputPath, path.basename(req.file.originalname, path.extname(req.file.originalname)) + '.' + format, (err) => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi chuyển đổi ảnh', detail: err.message });
  }
});

// API tải video TikTok không logo
app.post('/api/download-tiktok', express.json(), (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Chưa có URL TikTok' });
  const outPath = path.join(__dirname, 'uploads', `tiktok_${Date.now()}.mp4`);
  const cmd = `yt-dlp -f mp4 --no-warnings --output "${outPath}" --no-watermark "${url}"`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Lỗi tải video', detail: stderr || error.message });
    }
    res.download(outPath, `tiktok_${Date.now()}.mp4`, (err) => {
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    });
  });
});

app.use((err, req, res, next) => {
  console.error('Lỗi:', err);
  res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
}); 