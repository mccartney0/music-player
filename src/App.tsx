import React, {useState, useCallback, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from './theme/colors';
import {Track} from './services/MusicScanner';
import {
  PlayerContext,
  RepeatMode,
} from './store/playerStore';
import {
  FavoritesContext,
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from './store/favoritesStore';
import {
  PlaylistContext,
  Playlist,
  loadPlaylistsFromStorage,
  savePlaylistsToStorage,
} from './store/playlistStore';
import {useSetupPlayer, setRepeatMode} from './hooks/useTrackPlayer';
import {usePlaybackState, useActiveTrack} from 'react-native-track-player';
import {State} from 'react-native-track-player';

import {HomeScreen} from './screens/HomeScreen';
import {SearchScreen} from './screens/SearchScreen';
import {YouTubeSearchScreen} from './screens/YouTubeSearchScreen';
import {PlaylistsScreen} from './screens/PlaylistsScreen';
import {PlaylistDetailScreen} from './screens/PlaylistDetailScreen';
import {FavoritesScreen} from './screens/FavoritesScreen';
import {PlayerScreen} from './screens/PlayerScreen';
import {MiniPlayer} from './components/MiniPlayer';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator({onOpenPlayer}: {onOpenPlayer: () => void}) {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Músicas',
            tabBarIcon: ({color, size}) => (
              <Icon name="musical-notes" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Buscar',
            tabBarIcon: ({color, size}) => (
              <Icon name="search" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="YouTube"
          component={YouTubeSearchScreen}
          options={{
            title: 'YouTube',
            tabBarIcon: ({color, size}) => (
              <Icon name="logo-youtube" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{
            title: 'Playlists',
            tabBarIcon: ({color, size}) => (
              <Icon name="list" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Favoritos',
            tabBarIcon: ({color, size}) => (
              <Icon name="heart" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <MiniPlayer onPress={onOpenPlayer} />
    </>
  );
}

export default function App() {
  const playerReady = useSetupPlayer();
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();

  // Player state
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [searchQuery, setSearchQuery] = useState('');

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  // Playlists state
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const isPlaying = playerReady && playbackState.state === State.Playing;

  // Sync active track from track player
  useEffect(() => {
    if (activeTrack) {
      const found = tracks.find(t => t.id === activeTrack.id);
      if (found && found.id !== currentTrack?.id) {
        setCurrentTrack(found);
      }
    }
  }, [activeTrack, tracks, currentTrack]);

  // Load persisted data
  useEffect(() => {
    loadFavoritesFromStorage().then(setFavorites);
    loadPlaylistsFromStorage().then(setPlaylists);
  }, []);

  // Player context
  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat(prev => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      setRepeatMode(next);
      return next;
    });
  }, []);

  const playerContext = {
    tracks,
    currentTrack,
    isPlaying,
    shuffle,
    repeat,
    searchQuery,
    setTracks,
    setCurrentTrack,
    setIsPlaying: () => {},
    toggleShuffle,
    cycleRepeat,
    setSearchQuery,
  };

  // Favorites context
  const toggleFavorite = useCallback(
    (trackId: string) => {
      setFavorites(prev => {
        const next = prev.includes(trackId)
          ? prev.filter(id => id !== trackId)
          : [...prev, trackId];
        saveFavoritesToStorage(next);
        return next;
      });
    },
    [],
  );

  const favoritesContext = {
    favorites,
    isFavorite: (trackId: string) => favorites.includes(trackId),
    toggleFavorite,
    loadFavorites: async () => {
      const loaded = await loadFavoritesFromStorage();
      setFavorites(loaded);
    },
  };

  // Playlists context
  const createPlaylist = useCallback((name: string) => {
    setPlaylists(prev => {
      const next = [
        ...prev,
        {
          id: `playlist-${Date.now()}`,
          name,
          trackIds: [],
          createdAt: Date.now(),
        },
      ];
      savePlaylistsToStorage(next);
      return next;
    });
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== id);
      savePlaylistsToStorage(next);
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => {
      const next = prev.map(p =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? {...p, trackIds: [...p.trackIds, trackId]}
          : p,
      );
      savePlaylistsToStorage(next);
      return next;
    });
  }, []);

  const removeFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setPlaylists(prev => {
        const next = prev.map(p =>
          p.id === playlistId
            ? {...p, trackIds: p.trackIds.filter(id => id !== trackId)}
            : p,
        );
        savePlaylistsToStorage(next);
        return next;
      });
    },
    [],
  );

  const playlistContext = {
    playlists,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    loadPlaylists: async () => {
      const loaded = await loadPlaylistsFromStorage();
      setPlaylists(loaded);
    },
  };

  const navigationRef = React.useRef<any>(null);

  const openPlayer = () => {
    navigationRef.current?.navigate('Player');
  };

  return (
    <SafeAreaProvider>
    <PlayerContext.Provider value={playerContext}>
      <FavoritesContext.Provider value={favoritesContext}>
        <PlaylistContext.Provider value={playlistContext}>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              <Stack.Screen name="Main">
                {() => <TabNavigator onOpenPlayer={openPlayer} />}
              </Stack.Screen>
              <Stack.Screen
                name="Player"
                component={PlayerScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="PlaylistDetail"
                component={PlaylistDetailScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PlaylistContext.Provider>
      </FavoritesContext.Provider>
    </PlayerContext.Provider>
    </SafeAreaProvider>
  );
}
