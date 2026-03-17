import React, {useMemo} from 'react';
import {View, FlatList, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {useFavorites} from '../store/favoritesStore';
import {TrackItem} from '../components/TrackItem';
import {playTrack} from '../hooks/useTrackPlayer';

export function FavoritesScreen() {
  const {tracks, currentTrack, setCurrentTrack, setIsPlaying} =
    usePlayerContext();
  const {favorites} = useFavorites();

  const favoriteTracks = useMemo(
    () => tracks.filter(t => favorites.includes(t.id)),
    [tracks, favorites],
  );

  const handlePlay = async (track: typeof tracks[0]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    await playTrack(track, favoriteTracks);
  };

  if (favoriteTracks.length === 0) {
    return (
      <View style={styles.center}>
        <Icon name="heart-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>Sem favoritos ainda</Text>
        <Text style={styles.emptySubtext}>
          Toque no coração para adicionar músicas
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {favoriteTracks.length} favorita{favoriteTracks.length !== 1 ? 's' : ''}
      </Text>
      <FlatList
        data={favoriteTracks}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TrackItem
            track={item}
            isPlaying={currentTrack?.id === item.id}
            onPress={() => handlePlay(item)}
          />
        )}
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
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
});
