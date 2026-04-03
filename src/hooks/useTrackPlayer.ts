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
  } catch (error: any) {
    // "already initialized" é esperado quando o serviço Android ainda está
    // rodando em background — nesse caso o player já está funcional.
    // Qualquer outro erro significa falha real na inicialização.
    const alreadyInitialized =
      typeof error?.message === 'string' &&
      error.message.toLowerCase().includes('already');
    if (!alreadyInitialized) {
      throw error;
    }
  }
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
    alwaysPauseOnInterruption: false,
    progressUpdateEventInterval: 1000,
  });
  isSetup = true;
}

const SETUP_RETRIES = 3;
const SETUP_RETRY_DELAY_MS = 500;

export function useSetupPlayer() {
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      for (let attempt = 1; attempt <= SETUP_RETRIES; attempt++) {
        try {
          await setupPlayer();
          if (!cancelled) setPlayerReady(true);
          return;
        } catch {
          if (attempt < SETUP_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, SETUP_RETRY_DELAY_MS));
          }
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return playerReady;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function toPlayerTrack(t: Track) {
  return {
    id: t.id,
    url: t.url,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration: t.duration,
    artwork: t.artwork,
  };
}

/**
 * Chamado quando o shuffle é ATIVADO com música já tocando.
 * Mantém a faixa atual e embaralha o restante da lista.
 */
export async function reshuffleQueue(allTracks: Track[]) {
  if (!isSetup) return;
  try {
    const queue = await TrackPlayer.getQueue();
    const activeIndex = await TrackPlayer.getActiveTrackIndex();
    if (!queue.length || activeIndex == null) return;

    const activeId = queue[activeIndex].id as string;
    const others = allTracks.filter(t => t.id !== activeId);
    const shuffled = shuffleArray(others);

    // Remove todas as faixas exceto a atual
    const toRemove = queue.map((_, i) => i).filter(i => i !== activeIndex);
    if (toRemove.length > 0) {
      await TrackPlayer.remove(toRemove);
    }

    // Adiciona o restante embaralhado após a faixa atual
    await TrackPlayer.add(shuffled.map(toPlayerTrack));
  } catch (error) {
    console.error('Erro ao embaralhar fila:', error);
  }
}

/**
 * Chamado quando o shuffle é DESATIVADO com música já tocando.
 * Restaura a ordem original, mantendo a faixa atual.
 */
export async function restoreQueue(allTracks: Track[]) {
  if (!isSetup) return;
  try {
    const queue = await TrackPlayer.getQueue();
    const activeIndex = await TrackPlayer.getActiveTrackIndex();
    if (!queue.length || activeIndex == null) return;

    const activeId = queue[activeIndex].id as string;
    const originalIndex = allTracks.findIndex(t => t.id === activeId);
    const tracksAfter = originalIndex >= 0 ? allTracks.slice(originalIndex + 1) : [];

    const toRemove = queue.map((_, i) => i).filter(i => i !== activeIndex);
    if (toRemove.length > 0) {
      await TrackPlayer.remove(toRemove);
    }

    await TrackPlayer.add(tracksAfter.map(toPlayerTrack));
  } catch (error) {
    console.error('Erro ao restaurar fila:', error);
  }
}

export async function playTrack(track: Track, queue: Track[], shuffle = false) {
  if (!isSetup) return;
  try {
    await TrackPlayer.reset();

    let orderedQueue: Track[];
    if (shuffle) {
      const others = queue.filter(t => t.id !== track.id);
      orderedQueue = [track, ...shuffleArray(others)];
    } else {
      orderedQueue = queue;
    }

    await TrackPlayer.add(orderedQueue.map(toPlayerTrack));

    if (!shuffle) {
      const index = orderedQueue.findIndex(t => t.id === track.id);
      if (index > 0) {
        await TrackPlayer.skip(index);
      }
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
