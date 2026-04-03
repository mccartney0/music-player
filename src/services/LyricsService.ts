import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@lyrics:';

export async function fetchLyrics(trackId: string, artist: string, title: string): Promise<string | null> {
  // Remove feat., ft., parênteses e colchetes do título para melhorar a busca
  const cleanTitle = title
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\.?.*/i, '')
    .replace(/ft\.?.*/i, '')
    .trim();

  const cleanArtist = artist.replace(/,.*/, '').trim(); // pega só o primeiro artista

  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
    const response = await fetch(url, {signal: AbortSignal.timeout(8000)});
    if (!response.ok) return null;
    const data = await response.json();
    const lyrics = data.lyrics?.trim() || null;
    if (lyrics) {
      await saveLyrics(trackId, lyrics);
    }
    return lyrics;
  } catch {
    return null;
  }
}

export async function getSavedLyrics(trackId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_PREFIX + trackId);
  } catch {
    return null;
  }
}

export async function saveLyrics(trackId: string, lyrics: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + trackId, lyrics);
  } catch {}
}

export async function deleteLyrics(trackId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_PREFIX + trackId);
  } catch {}
}
