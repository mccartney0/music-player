import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import {useProgress} from 'react-native-track-player';
import {colors} from '../theme/colors';
import {formatTime} from '../utils/formatTime';

export function ProgressBar() {
  const {position, duration} = useProgress(200);
  const progress = duration > 0 ? position / duration : 0;

  const handleSeek = (event: any) => {
    const {locationX} = event.nativeEvent;
    // Get width from layout
    (event.target as any).measure(
      (_x: number, _y: number, width: number) => {
        const seekPosition = (locationX / width) * duration;
        TrackPlayer.seekTo(seekPosition);
      },
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.barContainer}
        onPress={handleSeek}
        activeOpacity={1}>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, {width: `${progress * 100}%`}]} />
          <View
            style={[
              styles.thumb,
              {left: `${progress * 100}%`},
            ]}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  barContainer: {
    paddingVertical: 8,
  },
  barBackground: {
    height: 4,
    backgroundColor: colors.card,
    borderRadius: 2,
    position: 'relative',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    marginLeft: -7,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
