import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';

export function VolumeControl() {
  const [volume, setVolume] = useState(1);

  const handleVolumeChange = async (event: any) => {
    (event.target as any).measure(
      (_x: number, _y: number, width: number) => {
        const newVolume = Math.max(0, Math.min(1, event.nativeEvent.locationX / width));
        setVolume(newVolume);
        TrackPlayer.setVolume(newVolume);
      },
    );
  };

  const volumeIcon =
    volume === 0
      ? 'volume-mute'
      : volume < 0.5
      ? 'volume-low'
      : 'volume-high';

  return (
    <View style={styles.container}>
      <Icon name={volumeIcon} size={20} color={colors.textMuted} />
      <View
        style={styles.barContainer}
        onTouchEnd={handleVolumeChange}>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, {width: `${volume * 100}%`}]} />
        </View>
      </View>
      <Icon name="volume-high" size={20} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  barContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  barBackground: {
    height: 3,
    backgroundColor: colors.card,
    borderRadius: 2,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
  },
});
