import {useEffect, useState} from 'react';
import TrackPlayer, {
  Capability,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useActiveTrack,
} from 'react-native-track-player';
import {Track} from '../services/MusicScanner';

let isSetup = false;

async function setupPlayer() {
  if (isSetup) return;
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
    isSetup = true;
  } catch {
    // Player might already be initialized
    isSetup = true;
  }
}

export function useSetupPlayer() {
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    setupPlayer().then(() => {
      setPlayerReady(true);
    });
  }, []);

  return playerReady;
}

export async function playTrack(track: Track, queue: Track[]) {
  if (!isSetup) return;
  try {
    await TrackPlayer.reset();
    const tracks = queue.map(t => ({
      id: t.id,
      url: t.url,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      artwork: t.artwork,
    }));
    await TrackPlayer.add(tracks);
    const index = queue.findIndex(t => t.id === track.id);
    if (index > 0) {
      await TrackPlayer.skip(index);
    }
    await TrackPlayer.play();
  } catch (error) {
    console.error('Erro ao tocar:', error);
  }
}

export async function togglePlayback() {
  if (!isSetup) return;
  try {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  } catch (error) {
    console.error('Erro ao alternar playback:', error);
  }
}

export async function setRepeatMode(mode: 'off' | 'all' | 'one') {
  if (!isSetup) return;
  try {
    const map = {
      off: RepeatMode.Off,
      all: RepeatMode.Queue,
      one: RepeatMode.Track,
    };
    await TrackPlayer.setRepeatMode(map[mode]);
  } catch (error) {
    console.error('Erro ao mudar repeat:', error);
  }
}

export {usePlaybackState, useProgress, useActiveTrack};
