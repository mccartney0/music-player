import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = '@history:recent';
const COUNTS_KEY = '@history:counts';
const MAX_RECENT = 50;

export type PlayCounts = {[trackId: string]: number};

export async function recordPlay(trackId: string): Promise<void> {
  try {
    const [recentRaw, countsRaw] = await Promise.all([
      AsyncStorage.getItem(RECENT_KEY),
      AsyncStorage.getItem(COUNTS_KEY),
    ]);

    const recent: string[] = recentRaw ? JSON.parse(recentRaw) : [];
    const counts: PlayCounts = countsRaw ? JSON.parse(countsRaw) : {};

    // Recentes: remove duplicata e insere no início
    const updated = [trackId, ...recent.filter(id => id !== trackId)].slice(0, MAX_RECENT);
    counts[trackId] = (counts[trackId] ?? 0) + 1;

    await Promise.all([
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated)),
      AsyncStorage.setItem(COUNTS_KEY, JSON.stringify(counts)),
    ]);
  } catch {}
}

export async function getRecentIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getPlayCounts(): Promise<PlayCounts> {
  try {
    const raw = await AsyncStorage.getItem(COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
