import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';
import {Track} from './MusicScanner';

const KEY = '@queue:persisted';

interface PersistedQueue {
  tracks: Track[];
  activeIndex: number;
  position: number;
}

export async function persistQueue(): Promise<void> {
  try {
    const [queue, activeIndex, progress] = await Promise.all([
      TrackPlayer.getQueue(),
      TrackPlayer.getActiveTrackIndex(),
      TrackPlayer.getProgress(),
    ]);
    if (!queue.length || activeIndex == null) return;
    const data: PersistedQueue = {
      tracks: queue.map(t => ({
        id: t.id as string,
        url: t.url as string,
        title: t.title as string,
        artist: t.artist as string,
        album: t.album as string,
        duration: t.duration as number,
        artwork: t.artwork as string | undefined,
      })),
      activeIndex,
      position: progress.position,
    };
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export async function restoreQueue(): Promise<{track: Track; position: number} | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const data: PersistedQueue = JSON.parse(raw);
    if (!data.tracks.length) return null;

    await TrackPlayer.reset();
    await TrackPlayer.add(data.tracks.map(t => ({
      id: t.id,
      url: t.url,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      artwork: t.artwork,
    })));

    const idx = Math.min(data.activeIndex, data.tracks.length - 1);
    if (idx > 0) await TrackPlayer.skip(idx);
    if (data.position > 0) await TrackPlayer.seekTo(data.position);

    return {track: data.tracks[idx], position: data.position};
  } catch {
    return null;
  }
}

export async function clearPersistedQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
