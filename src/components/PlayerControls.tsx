import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer from 'react-native-track-player';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {togglePlayback} from '../hooks/useTrackPlayer';

export function PlayerControls() {
  const {isPlaying, shuffle, repeat, toggleShuffle, cycleRepeat} =
    usePlayerContext();

  const repeatIcon =
    repeat === 'one' ? 'repeat' : repeat === 'all' ? 'repeat' : 'repeat';
  const repeatColor =
    repeat === 'off' ? colors.textMuted : colors.accent;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleShuffle} style={styles.btn}>
        <Icon
          name="shuffle"
          size={24}
          color={shuffle ? colors.accent : colors.textMuted}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => TrackPlayer.skipToPrevious()}
        style={styles.btn}>
        <Icon name="play-skip-back" size={28} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={togglePlayback}
        style={styles.playBtn}>
        <Icon
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={colors.background}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => TrackPlayer.skipToNext()}
        style={styles.btn}>
        <Icon name="play-skip-forward" size={28} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={cycleRepeat} style={styles.btn}>
        <Icon name={repeatIcon} size={24} color={repeatColor} />
        {repeat === 'one' && <View style={styles.repeatOneDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
  },
  btn: {
    padding: 8,
    alignItems: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
});
