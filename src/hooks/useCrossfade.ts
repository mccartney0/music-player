import {useEffect, useRef} from 'react';
import TrackPlayer from 'react-native-track-player';
import {useProgress, useActiveTrack} from 'react-native-track-player';

/**
 * Implementa crossfade via manipulação de volume:
 * - Fade out nos últimos `duration` segundos de cada faixa
 * - Fade in nos primeiros `duration` segundos de cada nova faixa
 *
 * @param duration segundos de crossfade (0 = desativado)
 */
export function useCrossfade(duration: number) {
  const {position, duration: trackDuration} = useProgress(200);
  const activeTrack = useActiveTrack();
  const fadingIn = useRef(false);
  const fadeInInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTrackId = useRef<string | undefined>(undefined);

  // Fade in quando a faixa muda
  useEffect(() => {
    if (!duration || !activeTrack) return;
    const newId = activeTrack.id as string | undefined;
    if (newId === lastTrackId.current) return;
    lastTrackId.current = newId;

    // Limpa fade in anterior se houver
    if (fadeInInterval.current) {
      clearInterval(fadeInInterval.current);
      fadeInInterval.current = null;
    }

    fadingIn.current = true;
    TrackPlayer.setVolume(0.05);

    const steps = 20;
    const stepTime = (duration * 1000) / steps;
    let step = 0;

    fadeInInterval.current = setInterval(() => {
      step++;
      const vol = Math.min(step / steps, 1);
      TrackPlayer.setVolume(vol);
      if (step >= steps) {
        fadingIn.current = false;
        if (fadeInInterval.current) clearInterval(fadeInInterval.current);
        fadeInInterval.current = null;
      }
    }, stepTime);

    return () => {
      if (fadeInInterval.current) {
        clearInterval(fadeInInterval.current);
        fadeInInterval.current = null;
      }
    };
  }, [activeTrack, duration]);

  // Fade out perto do fim da faixa
  useEffect(() => {
    if (!duration || fadingIn.current) return;
    if (!trackDuration || trackDuration <= 0) return;

    const remaining = trackDuration - position;
    if (remaining <= 0 || remaining > duration) {
      // Fora da janela de fade out — mantém volume em 1
      if (remaining > duration) TrackPlayer.setVolume(1);
      return;
    }

    const vol = Math.max(remaining / duration, 0.05);
    TrackPlayer.setVolume(vol);
  }, [position, trackDuration, duration]);

  // Quando desativado, restaura volume
  useEffect(() => {
    if (!duration) {
      TrackPlayer.setVolume(1);
    }
  }, [duration]);
}
