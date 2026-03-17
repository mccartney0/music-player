import React from 'react';
import {Track} from '../services/MusicScanner';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  searchQuery: string;
}

export interface PlayerContextType extends PlayerState {
  setTracks: (tracks: Track[]) => void;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setSearchQuery: (query: string) => void;
}

const defaultState: PlayerContextType = {
  tracks: [],
  currentTrack: null,
  isPlaying: false,
  shuffle: false,
  repeat: 'off',
  searchQuery: '',
  setTracks: () => {},
  setCurrentTrack: () => {},
  setIsPlaying: () => {},
  toggleShuffle: () => {},
  cycleRepeat: () => {},
  setSearchQuery: () => {},
};

export const PlayerContext = React.createContext<PlayerContextType>(defaultState);

export function usePlayerContext() {
  return React.useContext(PlayerContext);
}
