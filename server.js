import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import yts from 'yt-search';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

// API Search
app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json({ status: false, message: 'No query' });

  try {
    const r = await yts(query);
    const songs = r.videos.map(v => ({
      videoId: v.videoId,
      title: v.title,
      artist: v.author.name,
      thumbnail: v.thumbnail,
      cover: v.thumbnail, // provide both for compatibility
      url: v.url,
      artistId: v.author.url // fallback
    }));
    
    const artists = [];
    const seenArtists = new Set();
    (r.accounts || []).forEach(a => {
        if (!seenArtists.has(a.name.toLowerCase())) {
            seenArtists.add(a.name.toLowerCase());
            artists.push({
                id: a.url,
                name: a.name,
                thumbnail: a.image,
                cover: a.image
            });
        }
    });

    res.json({
      status: true,
      result: { songs, artists }
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// API Suggest
app.get('/api/suggest', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data[1] || []);
  } catch (error) {
    res.json([]);
  }
});

// API Home
app.get('/api/home', async (req, res) => {
  try {
    const recQueries = [
      'Tulus Hati-Hati di Jalan', 'Virgoun Surat Cinta Untuk Starla', 'Payung Teduh Akad',
      'Nadin Amizah Rayuan Perempuan Gila', 'Ghea Indrawari Jiwa Yang Bersedih',
      'Mahalini Sial', 'Tiara Andini Usai', 'Anggi Marito Tak Segampang Itu',
      'Tulus Monokrom', 'Virgoun Bukti', 'Payung Teduh Resah',
      'Tulus Pamit', 'Tulus Labirin', 'Sheila on 7 Dan',
      'Sheila on 7 Seberapa Pantas', 'Peterpan Mungkin Nanti',
      'Noah Separuh Aku', 'Raisa Terjebak Nostalgia',
      'Raisa Kali Kedua', 'Glenn Fredly Januari',
      'Tulus Diri', 'Nadin Amizah Bertaut',
      'Kunto Aji Pilu Membawa Kelabu',
      'Feby Putri Halu', 'Fourtwnty Zona Nyaman',
      'Hindia Evaluasi', 'Pamungkas Liburan Dini Hari',
      'Tulus Sewindu', 'Dewa 19 Kangen',
      'Dewa 19 Risalah Hati', 'Ariel Noah Menghapus Jejakmu',
      'Mahen Pura Pura Lupa', 'Anji Dia',
      'Judika Putus Atau Terus', 'Yura Yunita Tutur Batin',
      'Yura Yunita Jalan Pulang', 'Kunto Aji Rehat',
      'Tulus Ingkar', 'Tulus Interaksi', 'Tulus Adaptasi',
      'Mahalini Melawan Restu', 'Mahalini Sisa Rasa',
      'Rizky Febian Kesempurnaan Cinta', 'Rizky Febian Cuek',
      'Kunto Aji Mercusuar', 'Kunto Aji Terlalu Lama Sendiri',
      'Nadin Amizah Sorak Sorai', 'Nadin Amizah Bertaut',
      'Hindia Rumah ke Rumah', 'Hindia Secukupnya',
      'Dewa 19 Larut', 'Dewa 19 Pupus',
      'Sheila on 7 Melompat Lebih Tinggi', 'Sheila on 7 Lapang Dada',
      'Raisa Bahaso Kalbu', 'Raisa Jatuh Hati',
      'Glenn Fredly Akhir Cerita Cinta', 'Glenn Fredly Sekali Ini Saja',
      'Tulus Hati-Hati di Jalan', 'Andra and the BackBone Sempurna', 'TULUS - Teh Hijau'
    ];
    
    const trendQueries = [
      'Bernadya Satu Bulan', 'Sal Priadi Dari Planet Lain', 'Juicy Luicy Lantas',
      'Feby Putri Runtuh', 'Hindia Secukupnya', 'Pamungkas To the Bone',
      'Last Child Seluruh Nafas Ini', 'Budi Doremi Melukis Senja'
    ];
    
    const target = 'TULUS - Teh Hijau';
    const otherRecs = recQueries.filter(q => q !== target);
    const selectedRec = [target, ...otherRecs.sort(() => 0.5 - Math.random())].slice(0, 20);
    const selectedTrend = trendQueries.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    const [recResults, trendResults] = await Promise.all([
        Promise.all(selectedRec.map(q => yts(q + ' official music video'))),
        Promise.all(selectedTrend.map(q => yts(q + ' official music video')))
    ]);
    
    const mapper = r => {
        // Find video from official-looking channel or with "official" in title
        const authorKeywords = ['official', 'vevo', 'records', 'music', 'tuluscompany', 'virgoun', 'payungteduh'];
        const v = r.videos.find(vid => {
            const name = vid.author.name.toLowerCase();
            const title = vid.title.toLowerCase();
            return vid.seconds < 600 && (authorKeywords.some(k => name.includes(k)) || title.includes('official'));
        }) || r.videos[0];
        
        return v ? {
            id: v.videoId,
            videoId: v.videoId,
            title: v.title,
            artist: v.author.name,
            artistId: v.author.url,
            thumbnail: v.thumbnail,
            cover: v.thumbnail,
            ytUrl: v.url,
            duration: v.timestamp // yt-search provides this
        } : null;
    };

    const recommendations = recResults.map(mapper).filter(Boolean);
    const trending = trendResults.map(mapper).filter(Boolean);

    res.json({ status: true, result: { recommendations, trending } });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// API Artist
app.get('/api/artist', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.json({ status: false });

  try {
    const r = await yts({ query: id });
    const channel = r.accounts && r.accounts[0];
    
    if (channel) {
      res.json({
        status: true,
        result: {
          name: channel.name,
          thumbnails: [
            { url: channel.image },
            { url: channel.image },
            { url: channel.image }
          ],
          topSongs: r.videos.slice(0, 15).map(v => ({
            videoId: v.videoId,
            title: v.title,
            artist: v.author.name,
            thumbnails: [{ url: v.thumbnail }],
            duration: v.timestamp
          })),
          topAlbums: [],
          topSingles: [],
          topVideos: [],
          featuredOn: [],
          similarArtists: []
        }
      });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    res.json({ status: false });
  }
});

// API Lyrics
app.get('/api/lyrics', async (req, res) => {
  let { title, artist } = req.query;
  if (!title) return res.json({ status: false, result: { lyrics: { lines: [] } } });

  // Clean title
  title = title.replace(/\(official.*?\)|\[official.*?\]|official video|official music video|mv|lyric video|video resmi|video musik resmi|lirik|lyrics|audio|full album|hq|hd/gi, '').replace(/\s+/g, ' ').trim();

  // Clean artist
  if (artist) {
    artist = artist.replace(/\s*-\s*Topic$/i, '').replace(/Vevo$/i, '').replace(/Official$/i, '').trim();
  }

  try {
    // Try lrclib first for synced lyrics
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(title + ' ' + (artist || ''))}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData && searchData.length > 0) {
      const bestMatch = searchData[0];
      // If we have synced lyrics, use them
      if (bestMatch.syncedLyrics) {
          const lines = bestMatch.syncedLyrics.split('\n').map(line => {
              const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
              if (match) {
                  const minutes = parseInt(match[1]);
                  const seconds = parseFloat(match[2]);
                  return {
                      timeTag: match[1] + ':' + match[2],
                      words: match[3].trim(),
                      startTimeMs: (minutes * 60 + seconds) * 1000
                  };
              }
              return null;
          }).filter(l => l && l.words);

          return res.json({
              status: true,
              result: { lyrics: { lines, type: 'synced' } }
          });
      } else if (bestMatch.plainLyrics) {
          const lines = bestMatch.plainLyrics.split('\n').map(l => ({ words: l.trim() })).filter(l => l.words);
          return res.json({
              status: true,
              result: { lyrics: { lines, type: 'plain' } }
          });
      }
    }

    // Fallback to lyrics.ovh for plain lyrics
    if (artist) {
        const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
        const ovhRes = await fetch(ovhUrl);
        const ovhData = await ovhRes.json();
        if (ovhData.lyrics) {
            const lines = ovhData.lyrics.split('\n').map(l => ({ words: l.trim() })).filter(l => l.words);
            return res.json({
                status: true,
                result: { lyrics: { lines, type: 'plain' } }
            });
        }
    }

    res.json({
      status: false,
      result: { lyrics: { lines: [] } }
    });
  } catch (error) {
    res.json({
      status: false,
      result: { lyrics: { lines: [] } }
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
