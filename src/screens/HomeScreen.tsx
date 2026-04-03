import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {requestPermission, scanMusicFiles} from '../services/MusicScanner';
import {TrackItem} from '../components/TrackItem';
import {playTrack} from '../hooks/useTrackPlayer';
import {getRecentIds, getPlayCounts, PlayCounts} from '../services/HistoryService';

type Tab = 'all' | 'recent' | 'top';
type SortKey = 'title_asc' | 'title_desc' | 'artist' | 'duration_asc' | 'duration_desc';

const SORT_LABELS: Record<SortKey, string> = {
  title_asc: 'Título A–Z',
  title_desc: 'Título Z–A',
  artist: 'Artista',
  duration_asc: 'Duração ↑',
  duration_desc: 'Duração ↓',
};

export function HomeScreen() {
  const {tracks, setTracks, currentTrack, setCurrentTrack, setIsPlaying, shuffle} =
    usePlayerContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [sort, setSort] = useState<SortKey>('title_asc');
  const [sortOpen, setSortOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [playCounts, setPlayCounts] = useState<PlayCounts>({});

  const loadHistory = useCallback(async () => {
    const [ids, counts] = await Promise.all([getRecentIds(), getPlayCounts()]);
    setRecentIds(ids);
    setPlayCounts(counts);
  }, []);

  const loadMusic = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) { setLoading(false); return; }
    const songs = await scanMusicFiles();
    setTracks(songs);
    setLoading(false);
    setRefreshing(false);
  }, [setTracks]);

  useEffect(() => {
    loadMusic();
    loadHistory();
  }, [loadMusic, loadHistory]);

  const displayedTracks = useMemo(() => {
    if (tab === 'recent') {
      return recentIds
        .map(id => tracks.find(t => t.id === id))
        .filter(Boolean) as typeof tracks;
    }
    if (tab === 'top') {
      return [...tracks]
        .filter(t => (playCounts[t.id] ?? 0) > 0)
        .sort((a, b) => (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0));
    }
    // tab === 'all' with sort
    return [...tracks].sort((a, b) => {
      switch (sort) {
        case 'title_asc':  return a.title.localeCompare(b.title);
        case 'title_desc': return b.title.localeCompare(a.title);
        case 'artist':     return a.artist.localeCompare(b.artist);
        case 'duration_asc':  return a.duration - b.duration;
        case 'duration_desc': return b.duration - a.duration;
      }
    });
  }, [tracks, tab, sort, recentIds, playCounts]);

  const handlePlay = useCallback(async (track: typeof tracks[0]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    await playTrack(track, tab === 'all' ? tracks : displayedTracks, shuffle);
  }, [setCurrentTrack, setIsPlaying, tab, tracks, displayedTracks, shuffle]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([loadMusic(), loadHistory()]);
  }, [loadMusic, loadHistory]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Buscando músicas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['all', 'recent', 'top'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'all' ? 'Todas' : t === 'recent' ? 'Recentes' : 'Mais tocadas'}
            </Text>
          </TouchableOpacity>
        ))}
        {tab === 'all' && (
          <TouchableOpacity onPress={() => setSortOpen(true)} style={styles.sortBtn}>
            <Icon name="funnel-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {displayedTracks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {tab === 'recent' ? 'Nenhuma música tocada ainda' : 'Nenhuma música encontrada'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedTracks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TrackItem
              track={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => handlePlay(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <Text style={styles.header}>
              {displayedTracks.length} música{displayedTracks.length !== 1 ? 's' : ''}
              {tab === 'top' ? ' • por plays' : tab === 'all' ? ` • ${SORT_LABELS[sort]}` : ''}
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      )}

      {/* Sort modal */}
      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSortOpen(false)}>
          <View style={styles.sortMenu}>
            <Text style={styles.sortTitle}>Ordenar por</Text>
            {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
              <TouchableOpacity
                key={key}
                style={styles.sortOption}
                onPress={() => { setSort(key); setSortOpen(false); }}>
                <Text style={[styles.sortOptionText, sort === key && styles.sortOptionActive]}>
                  {SORT_LABELS[key]}
                </Text>
                {sort === key && <Icon name="checkmark" size={16} color={colors.accent} />}
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
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.background },
  sortBtn: { marginLeft: 'auto', padding: 6 },
  header: {
    color: colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  list: { paddingBottom: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { color: colors.textSecondary, marginTop: 12, fontSize: 15 },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sortMenu: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  sortTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionText: { color: colors.text, fontSize: 15 },
  sortOptionActive: { color: colors.accent, fontWeight: '700' },
});
