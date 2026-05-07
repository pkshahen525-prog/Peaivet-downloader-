# 🎬 YouTube Downloader API

Node.js + Express দিয়ে তৈরি YouTube Video Downloader REST API।

---

## ⚙️ Prerequisites (আগে এগুলো ইনস্টল করো)

### 1. Node.js
https://nodejs.org থেকে ডাউনলোড করো।

### 2. yt-dlp (সবচেয়ে গুরুত্বপূর্ণ)
```bash
# Windows (PowerShell as Admin)
winget install yt-dlp

# macOS
brew install yt-dlp

# Linux
sudo apt install yt-dlp
# অথবা
pip install yt-dlp
```

### 3. ffmpeg (video merge এর জন্য দরকার)
```bash
# Windows
winget install ffmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

---

## 🚀 Setup & Run

```bash
# 1. Project folder এ যাও
cd yt-downloader-api

# 2. Dependencies install করো
npm install

# 3. Server চালু করো
npm start

# Development mode (auto-restart)
npm run dev
```

Server চালু হলে দেখবে:
```
✅ Server running on http://localhost:3000
```

---

## 📡 API Endpoints

### 1. Health Check
```
GET http://localhost:3000/
```

### 2. Video Info পাও
```
GET http://localhost:3000/info?url=YOUTUBE_URL
```
**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 300,
  "uploader": "Channel Name",
  "view_count": 1000000,
  "formats": [
    { "format_id": "137", "ext": "mp4", "quality": "1080p", "filesize": 50000000 }
  ]
}
```

### 3. Video Download
```
GET http://localhost:3000/download?url=YOUTUBE_URL&quality=720
```
**quality options:**
- `best` → সর্বোচ্চ quality (default)
- `1080` → 1080p
- `720` → 720p
- `480` → 480p
- `360` → 360p

### 4. Audio Only (MP3)
```
GET http://localhost:3000/download/audio?url=YOUTUBE_URL
```

---

## 🧪 Test করার উপায়

Browser এ সরাসরি এই URL দাও:
```
http://localhost:3000/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

অথবা cURL দিয়ে:
```bash
curl "http://localhost:3000/download?url=https://youtube.com/watch?v=VIDEO_ID&quality=720" -o video.mp4
```

---

## ⚠️ সমস্যা হলে

**yt-dlp not found error:**
```bash
pip install -U yt-dlp
```

**ffmpeg not found:**
ffmpeg install করো এবং PATH এ add করো।

**Timeout error:**
বড় ভিডিওর জন্য server.js এ timeout বাড়াও:
`timeout: 300000` (5 মিনিট)
