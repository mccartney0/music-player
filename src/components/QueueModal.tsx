import React, {useEffect, useState, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';

type QueueTrack = {
  id: string;
  title: string;
  artist: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function QueueModal({visible, onClose}: Props) {
  const insets = useSafeAreaInsets();
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const loadQueue = useCallback(async () => {
    const [q, idx] = await Promise.all([
      TrackPlayer.getQueue(),
      TrackPlayer.getActiveTrackIndex(),
    ]);
    setQueue(q.map(t => ({
      id: t.id as string,
      title: t.title as string,
      artist: t.artist as string,
    })));
    setActiveIndex(idx ?? null);
  }, []);

  useEffect(() => {
    if (visible) loadQueue();
  }, [visible, loadQueue]);

  const skipTo = useCallback(async (index: number) => {
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    setActiveIndex(index);
  }, []);

  const removeTrack = useCallback(async (index: number) => {
    await TrackPlayer.remove(index);
    await loadQueue();
  }, [loadQueue]);

  const clearQueue = useCallback(async () => {
    if (activeIndex == null) return;
    const toRemove = queue.map((_, i) => i).filter(i => i !== activeIndex);
    if (toRemove.length > 0) await TrackPlayer.remove(toRemove);
    await loadQueue();
  }, [queue, activeIndex, loadQueue]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={[styles.container, {paddingTop: insets.top || 16, paddingBottom: insets.bottom || 16}]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Fila de reprodução</Text>
          <TouchableOpacity onPress={clearQueue} style={styles.iconBtn}>
            <Icon name="trash-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={queue}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({item, index}) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                style={[styles.item, isActive && styles.itemActive]}
                onPress={() => skipTo(index)}
                activeOpacity={0.7}>
                <View style={styles.itemLeft}>
                  {isActive ? (
                    <Icon name="musical-note" size={16} color={colors.accent} />
                  ) : (
                    <Text style={styles.itemIndex}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, isActive && styles.itemTitleActive]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemArtist} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
                {!isActive && (
                  <TouchableOpacity
                    onPress={() => removeTrack(index)}
                    style={styles.removeBtn}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Icon name="close" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Fila vazia</Text>
            </View>
          }
        />
      </View>
    </Modal>
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  iconBtn: { padding: 6 },
  list: { paddingVertical: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  itemActive: {
    backgroundColor: colors.card,
  },
  itemLeft: {
    width: 24,
    alignItems: 'center',
  },
  itemIndex: {
    color: colors.textMuted,
    fontSize: 13,
  },
  itemInfo: { flex: 1 },
  itemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  itemTitleActive: { color: colors.accent },
  itemArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  removeBtn: { padding: 4 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
