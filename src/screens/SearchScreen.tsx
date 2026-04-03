import React, {useMemo} from 'react';
import {View, TextInput, FlatList, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {TrackItem} from '../components/TrackItem';
import {playTrack} from '../hooks/useTrackPlayer';

export function SearchScreen() {
  const {
    tracks,
    currentTrack,
    searchQuery,
    setSearchQuery,
    setCurrentTrack,
    setIsPlaying,
    shuffle,
  } = usePlayerContext();

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return tracks.filter(
      t =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.album.toLowerCase().includes(query),
    );
  }, [tracks, searchQuery]);

  const handlePlay = async (track: typeof tracks[0]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    const queue = filteredTracks.length > 0 ? filteredTracks : tracks;
    await playTrack(track, queue, shuffle);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Buscar músicas, artistas, álbuns..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Icon
            name="close-circle"
            size={20}
            color={colors.textMuted}
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>

      {searchQuery.trim() === '' ? (
        <View style={styles.center}>
          <Icon name="search" size={48} color={colors.textMuted} />
          <Text style={styles.hintText}>
            Digite para buscar suas músicas
          </Text>
        </View>
      ) : filteredTracks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhum resultado</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTracks}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    padding: 0,
  },
  list: {
    paddingBottom: 80,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
