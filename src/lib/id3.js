// Minimal ID3v2 (v2.2/v2.3/v2.4) tag reader for MP3 files.
// Extracts embedded cover art (APIC/PIC) and title (TIT2/TT2).
export async function readId3Tags(file) {
  try {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return {};
    const majorVersion = bytes[3];
    const synchsafe = (off, len) => {
      let v = 0;
      for (let i = 0; i < len; i++) v = (v << 7) | bytes[off + i];
      return v;
    };
    const tagSize = synchsafe(6, 4);
    const end = 10 + tagSize;
    const frameIdLen = majorVersion === 2 ? 3 : 4;
    const frameSizeLen = majorVersion === 2 ? 3 : 4;
    const frameHeaderLen = frameIdLen + frameSizeLen + (majorVersion === 2 ? 0 : 2);
    const readFrameSize = (off) => {
      if (majorVersion === 4) return synchsafe(off, 4);
      if (majorVersion === 2) return synchsafe(off, 3);
      // v2.3: plain 4-byte big-endian
      return (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
    };
    const result = {};
    let offset = 10;
    while (offset + frameHeaderLen <= end) {
      let id = "";
      for (let i = 0; i < frameIdLen; i++) id += String.fromCharCode(bytes[offset + i]);
      if (id.charCodeAt(0) === 0) break;
      const frameSize = readFrameSize(offset + frameIdLen);
      const dataOffset = offset + frameHeaderLen;
      if (frameSize <= 0 || dataOffset + frameSize > end) break;
      const data = bytes.subarray(dataOffset, dataOffset + frameSize);

      if (id === "APIC" || id === "PIC") {
        let p = 0;
        const encoding = data[p++];
        let mime = "";
        if (id === "APIC") {
          while (data[p] !== 0 && p < data.length) mime += String.fromCharCode(data[p++]);
          p++;
        } else {
          mime = String.fromCharCode(data[p], data[p + 1], data[p + 2]);
          p += 3;
        }
        p++; // picture type
        // skip description (encoding-dependent null terminator)
        if (encoding === 1 || encoding === 2) {
          while (p + 1 < data.length && !(data[p] === 0 && data[p + 1] === 0)) p += 2;
          p += 2;
        } else {
          while (p < data.length && data[p] !== 0) p++;
          p++;
        }
        const picData = data.subarray(p);
        const finalMime = mime || "image/jpeg";
        const blob = new Blob([picData], { type: finalMime });
        result.pictureUrl = URL.createObjectURL(blob);
        result.pictureFile = new File([blob], "cover", { type: finalMime });
      } else if (id === "TIT2" || id === "TT2") {
        const encoding = data[0];
        let text;
        if (encoding === 1 || encoding === 2) text = new TextDecoder("utf-16").decode(data.subarray(1));
        else if (encoding === 3) text = new TextDecoder("utf-8").decode(data.subarray(1));
        else text = new TextDecoder("latin1").decode(data.subarray(1));
        result.title = text.replace(/\0/g, "").trim();
      }
      offset = dataOffset + frameSize;
    }
    return result;
  } catch {
    return {};
  }
}