import React, {useState, useCallback} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {usePlayerContext} from '../store/playerStore';
import {searchYouTube, getYouTubeTrack, YouTubeVideo} from '../services/YouTubeService';
import {playTrack} from '../hooks/useTrackPlayer';

export function YouTubeSearchScreen() {
  const {setCurrentTrack, setIsPlaying} = usePlayerContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const videos = await searchYouTube(searchQuery);
      setResults(videos);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handlePlayVideo = async (video: YouTubeVideo) => {
    try {
      setLoading(true);
      const track = await getYouTubeTrack(video);
      setCurrentTrack(track);
      setIsPlaying(true);
      await playTrack(track, [track]);
    } catch (error) {
      console.error('Erro ao reproduzir vídeo:', error);
      alert('Erro ao reproduzir vídeo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views?: number) => {
    if (!views) return '';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Buscar no YouTube..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Icon
            name="close-circle"
            size={20}
            color={colors.textMuted}
            onPress={() => {
              setSearchQuery('');
              setResults([]);
              setSearched(false);
            }}
          />
        )}
      </View>

      {!searched ? (
        <View style={styles.center}>
          <Icon name="logo-youtube" size={48} color={colors.primary} />
          <Text style={styles.hintText}>
            Digite para buscar vídeos no YouTube
          </Text>
          <Text style={styles.subHintText}>
            O áudio será extraído automaticamente
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.videoItem}
              onPress={() => handlePlayVideo(item)}>
              {item.thumbnail && (
                <Image
                  source={{uri: item.thumbnail}}
                  style={styles.thumbnail}
                />
              )}
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.videoMeta} numberOfLines={1}>
                  {item.uploader}
                </Text>
                <View style={styles.videoStats}>
                  <Text style={styles.videoStat}>
                    {formatDuration(item.duration)}
                  </Text>
                  {item.views && (
                    <Text style={styles.videoStat}>
                      {formatViews(item.views)} visualizações
                    </Text>
                  )}
                </View>
              </View>
              <Icon name="play-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    padding: 0,
  },
  list: {
    paddingBottom: 80,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 12,
  },
  subHintText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    padding: 8,
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  videoMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  videoStat: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
