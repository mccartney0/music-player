import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYLISTS_KEY = '@music_player_playlists';

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  loadPlaylists: () => Promise<void>;
}

export const PlaylistContext = React.createContext<PlaylistContextType>({
  playlists: [],
  createPlaylist: () => {},
  deletePlaylist: () => {},
  addToPlaylist: () => {},
  removeFromPlaylist: () => {},
  loadPlaylists: async () => {},
});

export function usePlaylists() {
  return React.useContext(PlaylistContext);
}

export async function loadPlaylistsFromStorage(): Promise<Playlist[]> {
  try {
    const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function savePlaylistsToStorage(playlists: Playlist[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error('Erro ao salvar playlists:', error);
  }
}
