// Pure-JS audio duration parser — no native modules, works in CF Workers.
// Supports WAV and MPEG Layer 3 (MP3). Returns null for unsupported formats.

export function parseAudioDuration(bytes: Uint8Array): number | null {
  if (bytes.length < 12) return null;
  // WAV: "RIFF" + "WAVE"
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return parseWavDuration(bytes);
  }
  return parseMp3Duration(bytes);
}

function parseWavDuration(b: Uint8Array): number | null {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (b.length < 44) return null;
  if (view.getUint32(8, false) !== 0x57415645) return null; // "WAVE"
  let offset = 12;
  let byteRate = 0;
  while (offset + 8 <= b.length) {
    const id = view.getUint32(offset, false);
    const size = view.getUint32(offset + 4, true);
    if (id === 0x666d7420 && offset + 16 <= b.length) { // "fmt "
      byteRate = view.getUint32(offset + 12, true);
    }
    if (id === 0x64617461 && byteRate > 0) { // "data"
      return Math.round(size / byteRate);
    }
    offset += 8 + size;
    if (size % 2 !== 0) offset++; // word-aligned
  }
  return null;
}

// MPEG1 Layer3 bitrate table (kbps, index 1-14)
const MP3_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
// MPEG1 sample-rate table (Hz, index 0-2)
const MP3_SAMPLE_RATES = [44100, 48000, 32000];

function parseMp3Duration(b: Uint8Array): number | null {
  let offset = 0;
  // Skip ID3v2 tag
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33 && b.length > 10) { // "ID3"
    const sz =
      ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f);
    offset = sz + 10;
  }
  // Scan for first valid MPEG1 Layer3 sync frame
  while (offset < b.length - 4) {
    if (b[offset] === 0xff && (b[offset + 1] & 0xe0) === 0xe0) {
      const h1 = b[offset + 1];
      const h2 = b[offset + 2];
      const version = (h1 >> 3) & 0x3;    // 0x3 = MPEG1
      const layer = (h1 >> 1) & 0x3;      // 0x1 = Layer3
      const bitrateIdx = (h2 >> 4) & 0xf;
      const srIdx = (h2 >> 2) & 0x3;
      if (version === 3 && layer === 1 && bitrateIdx > 0 && bitrateIdx < 15 && srIdx < 3) {
        const bitrate = MP3_BITRATES[bitrateIdx] * 1000;
        if (bitrate > 0) {
          return Math.round(((b.length - offset) * 8) / bitrate);
        }
      }
    }
    offset++;
  }
  return null;
}
