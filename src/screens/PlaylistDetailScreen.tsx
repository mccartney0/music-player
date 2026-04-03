import React, {useMemo} from 'react';
import {View, FlatList, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {usePlaylists, Playlist} from '../store/playlistStore';
import {TrackItem} from '../components/TrackItem';
import {playTrack} from '../hooks/useTrackPlayer';

export function PlaylistDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const playlist: Playlist = route.params?.playlist;
  const {tracks, currentTrack, setCurrentTrack, setIsPlaying, shuffle} =
    usePlayerContext();
  const {} = usePlaylists();

  const playlistTracks = useMemo(
    () => tracks.filter(t => playlist.trackIds.includes(t.id)),
    [tracks, playlist.trackIds],
  );

  const handlePlay = async (track: typeof tracks[0]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    await playTrack(track, playlistTracks, shuffle);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{playlist.name}</Text>
          <Text style={styles.count}>
            {playlistTracks.length} música
            {playlistTracks.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {playlistTracks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Playlist vazia</Text>
          <Text style={styles.emptySubtext}>
            Adicione músicas pela tela inicial
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlistTracks}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  list: {
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
