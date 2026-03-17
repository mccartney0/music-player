import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer from 'react-native-track-player';
import {useProgress} from 'react-native-track-player';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {togglePlayback} from '../hooks/useTrackPlayer';

interface Props {
  onPress: () => void;
}

export function MiniPlayer({onPress}: Props) {
  const {currentTrack, isPlaying} = usePlayerContext();
  const {position, duration} = useProgress(500);
  const insets = useSafeAreaInsets();

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <TouchableOpacity
      style={[styles.container, {paddingBottom: insets.bottom}]}
      onPress={onPress}
      activeOpacity={0.9}>
      <View style={[styles.progressBar, {width: `${progress * 100}%`}]} />
      <View style={styles.content}>
        <View style={styles.artwork}>
          {currentTrack.artwork ? (
            <Image
              source={{uri: currentTrack.artwork}}
              style={styles.artworkImage}
            />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <Icon name="musical-note" size={18} color={colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <TouchableOpacity
          onPress={togglePlayback}
          style={styles.playBtn}>
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => TrackPlayer.skipToNext()}
          style={styles.playBtn}>
          <Icon name="play-skip-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.miniPlayerBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'relative',
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.accent,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
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
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  playBtn: {
    padding: 8,
  },
});
