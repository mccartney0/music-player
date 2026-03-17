import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Track} from '../services/MusicScanner';
import {colors} from '../theme/colors';
import {formatTime} from '../utils/formatTime';
import {useFavorites} from '../store/favoritesStore';

interface Props {
  track: Track;
  isPlaying: boolean;
  onPress: () => void;
  onAddToPlaylist?: () => void;
}

export function TrackItem({track, isPlaying, onPress, onAddToPlaylist}: Props) {
  const {isFavorite, toggleFavorite} = useFavorites();
  const favorite = isFavorite(track.id);

  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.active]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.artwork}>
        {track.artwork ? (
          <Image source={{uri: track.artwork}} style={styles.artworkImage} />
        ) : (
          <View style={styles.artworkPlaceholder}>
            <Icon name="musical-note" size={24} color={colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.title, isPlaying && styles.titleActive]}
          numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist} • {formatTime(track.duration)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => toggleFavorite(track.id)}
        style={styles.iconBtn}>
        <Icon
          name={favorite ? 'heart' : 'heart-outline'}
          size={22}
          color={favorite ? colors.accent : colors.textMuted}
        />
      </TouchableOpacity>
      {onAddToPlaylist && (
        <TouchableOpacity onPress={onAddToPlaylist} style={styles.iconBtn}>
          <Icon name="add-circle-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  active: {
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  titleActive: {
    color: colors.accent,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  iconBtn: {
    padding: 8,
  },
});
