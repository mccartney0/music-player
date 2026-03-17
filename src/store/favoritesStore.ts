import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@music_player_favorites';

export interface FavoritesContextType {
  favorites: string[];
  isFavorite: (trackId: string) => boolean;
  toggleFavorite: (trackId: string) => void;
  loadFavorites: () => Promise<void>;
}

export const FavoritesContext = React.createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  loadFavorites: async () => {},
});

export function useFavorites() {
  return React.useContext(FavoritesContext);
}

export async function loadFavoritesFromStorage(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveFavoritesToStorage(favorites: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
  }
}
