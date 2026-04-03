import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
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
import {LyricsModal} from '../components/LyricsModal';
import {QueueModal} from '../components/QueueModal';
import {SleepTimerModal} from '../components/SleepTimerModal';

const {width} = Dimensions.get('window');
const ARTWORK_SIZE = width - 80;

const CROSSFADE_OPTIONS = [
  {label: 'Desligado', value: 0},
  {label: '1s', value: 1},
  {label: '2s', value: 2},
  {label: '3s', value: 3},
  {label: '5s', value: 5},
];

export function PlayerScreen() {
  const navigation = useNavigation();
  const {currentTrack, sleepMinutes, sleepEndTime, crossfadeDuration, setSleepTimer, setCrossfadeDuration} =
    usePlayerContext();
  const {isFavorite, toggleFavorite} = useFavorites();
  const insets = useSafeAreaInsets();

  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [crossfadeOpen, setCrossfadeOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Countdown do sleep timer
  useEffect(() => {
    if (!sleepEndTime) { setRemainingSeconds(null); return; }
    const update = () => {
      const diff = Math.max(0, Math.round((sleepEndTime - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [sleepEndTime]);

  if (!currentTrack) return null;

  const favorite = isFavorite(currentTrack.id);

  return (
    <View style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tocando agora</Text>
        <TouchableOpacity onPress={() => toggleFavorite(currentTrack.id)} style={styles.headerBtn}>
          <Icon
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={favorite ? colors.accent : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {currentTrack.artwork ? (
          <Image source={{uri: currentTrack.artwork}} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Icon name="musical-notes" size={80} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Track info */}
      <View style={styles.trackInfo}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>

      <ProgressBar />
      <PlayerControls />
      <VolumeControl />

      {/* Botões de ação */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setQueueOpen(true)} style={styles.actionBtn}>
          <Icon name="list" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>Fila</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSleepOpen(true)} style={styles.actionBtn}>
          <Icon
            name="moon-outline"
            size={18}
            color={sleepMinutes > 0 ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.actionText, sleepMinutes > 0 && styles.actionTextActive]}>
            {remainingSeconds != null && sleepMinutes > 0
              ? `${Math.ceil(remainingSeconds / 60)}m`
              : 'Timer'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCrossfadeOpen(true)} style={styles.actionBtn}>
          <Icon
            name="git-merge-outline"
            size={18}
            color={crossfadeDuration > 0 ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.actionText, crossfadeDuration > 0 && styles.actionTextActive]}>
            {crossfadeDuration > 0 ? `${crossfadeDuration}s` : 'Fade'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setLyricsOpen(true)} style={styles.actionBtn}>
          <Icon name="document-text-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>Letra</Text>
        </TouchableOpacity>
      </View>

      <LyricsModal visible={lyricsOpen} track={currentTrack} onClose={() => setLyricsOpen(false)} />
      <QueueModal visible={queueOpen} onClose={() => setQueueOpen(false)} />
      <SleepTimerModal
        visible={sleepOpen}
        sleepMinutes={sleepMinutes}
        remainingSeconds={remainingSeconds}
        onSelect={setSleepTimer}
        onClose={() => setSleepOpen(false)}
      />

      {/* Crossfade modal */}
      <Modal visible={crossfadeOpen} transparent animationType="slide" onRequestClose={() => setCrossfadeOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setCrossfadeOpen(false)}>
          <View style={[styles.sheet, {paddingBottom: (insets.bottom || 16) + 8}]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Icon name="git-merge-outline" size={20} color={colors.accent} />
              <Text style={styles.sheetTitle}>Crossfade</Text>
            </View>
            {CROSSFADE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.sheetOption}
                onPress={() => { setCrossfadeDuration(opt.value); setCrossfadeOpen(false); }}>
                <Text style={[styles.sheetOptionText, crossfadeDuration === opt.value && styles.sheetOptionActive]}>
                  {opt.label}
                </Text>
                {crossfadeDuration === opt.value && (
                  <Icon name="checkmark" size={18} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: { padding: 4 },
  headerTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  artworkContainer: { alignItems: 'center', paddingVertical: 16 },
  artwork: { width: ARTWORK_SIZE, height: ARTWORK_SIZE, borderRadius: 12 },
  artworkPlaceholder: { backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
  trackInfo: { paddingHorizontal: 24, paddingBottom: 8 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  artist: { color: colors.textSecondary, fontSize: 16, marginTop: 4 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionBtn: { alignItems: 'center', gap: 4, padding: 8 },
  actionText: { color: colors.textMuted, fontSize: 11 },
  actionTextActive: { color: colors.accent },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  sheetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOptionText: { color: colors.text, fontSize: 15 },
  sheetOptionActive: { color: colors.accent, fontWeight: '700' },
});
