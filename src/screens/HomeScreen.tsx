import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {requestPermission, scanMusicFiles} from '../services/MusicScanner';
import {TrackItem} from '../components/TrackItem';
import {playTrack} from '../hooks/useTrackPlayer';

export function HomeScreen() {
  const {tracks, setTracks, currentTrack, setCurrentTrack, setIsPlaying} =
    usePlayerContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMusic = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setLoading(false);
      return;
    }
    const songs = await scanMusicFiles();
    setTracks(songs);
    setLoading(false);
    setRefreshing(false);
  }, [setTracks]);

  useEffect(() => {
    loadMusic();
  }, [loadMusic]);

  const handlePlay = async (track: typeof tracks[0]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    await playTrack(track, tracks);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Buscando músicas...</Text>
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🎵</Text>
        <Text style={styles.emptyText}>Nenhuma música encontrada</Text>
        <Text style={styles.emptySubtext}>
          Verifique se há músicas no seu dispositivo
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {tracks.length} música{tracks.length !== 1 ? 's' : ''}
      </Text>
      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TrackItem
            track={item}
            isPlaying={currentTrack?.id === item.id}
            onPress={() => handlePlay(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadMusic();
            }}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  list: {
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 15,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
});
