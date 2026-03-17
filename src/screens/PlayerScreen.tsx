import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {useFavorites} from '../store/favoritesStore';
import {PlayerControls} from '../components/PlayerControls';
import {ProgressBar} from '../components/ProgressBar';
import {VolumeControl} from '../components/VolumeControl';

const {width} = Dimensions.get('window');
const ARTWORK_SIZE = width - 80;

export function PlayerScreen() {
  const navigation = useNavigation();
  const {currentTrack} = usePlayerContext();
  const {isFavorite, toggleFavorite} = useFavorites();
  const insets = useSafeAreaInsets();

  if (!currentTrack) return null;

  const favorite = isFavorite(currentTrack.id);

  return (
    <View style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}>
          <Icon name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tocando agora</Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(currentTrack.id)}
          style={styles.headerBtn}>
          <Icon
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={favorite ? colors.accent : colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.artworkContainer}>
        {currentTrack.artwork ? (
          <Image
            source={{uri: currentTrack.artwork}}
            style={styles.artwork}
          />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Icon name="musical-notes" size={80} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      <ProgressBar />
      <PlayerControls />
      <VolumeControl />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  artworkContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 12,
  },
  artworkPlaceholder: {
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
});
