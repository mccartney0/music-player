import React, {useEffect, useState, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme/colors';
import {Track} from '../services/MusicScanner';
import {
  fetchLyrics,
  getSavedLyrics,
  saveLyrics,
  deleteLyrics,
} from '../services/LyricsService';

type Props = {
  visible: boolean;
  track: Track;
  onClose: () => void;
};

type Status = 'loading' | 'found' | 'not_found' | 'editing';

export function LyricsModal({visible, track, onClose}: Props) {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Status>('loading');
  const [lyrics, setLyrics] = useState('');
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    setStatus('loading');
    setLyrics('');

    async function load() {
      // Prioridade: letra salva manualmente
      const saved = await getSavedLyrics(track.id);
      if (saved) {
        setLyrics(saved);
        setStatus('found');
        return;
      }

      // Tenta buscar online
      const fetched = await fetchLyrics(track.id, track.artist, track.title);
      if (fetched) {
        setLyrics(fetched);
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    }

    load();
  }, [visible, track.id, track.artist, track.title]);

  function startEditing() {
    setDraft(lyrics);
    setStatus('editing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function handleSave() {
    const trimmed = draft.trim();
    if (trimmed) {
      await saveLyrics(track.id, trimmed);
      setLyrics(trimmed);
      setStatus('found');
    }
  }

  async function handleDelete() {
    await deleteLyrics(track.id);
    setLyrics('');
    setStatus('not_found');
  }

  function handleCancel() {
    setStatus(lyrics ? 'found' : 'not_found');
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.container,
            {paddingTop: insets.top || 16, paddingBottom: insets.bottom || 16},
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {track.title}
              </Text>
              <Text style={styles.headerArtist} numberOfLines={1}>
                {track.artist}
              </Text>
            </View>
            {status === 'found' && (
              <TouchableOpacity onPress={startEditing} style={styles.iconBtn}>
                <Icon name="pencil" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {status === 'not_found' && (
              <TouchableOpacity onPress={startEditing} style={styles.iconBtn}>
                <Icon name="add" size={24} color={colors.accent} />
              </TouchableOpacity>
            )}
            {status === 'editing' && (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancel} style={styles.iconBtn}>
                  <Icon name="close-circle-outline" size={22} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
                  <Icon name="checkmark-circle" size={22} color={colors.accent} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Conteúdo */}
          {status === 'loading' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.hint}>Buscando letra...</Text>
            </View>
          )}

          {status === 'found' && (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.lyricsText}>{lyrics}</Text>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteBtn}>
                <Icon name="trash-outline" size={14} color={colors.textMuted} />
                <Text style={styles.deleteBtnText}>Remover letra salva</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {status === 'not_found' && (
            <View style={styles.center}>
              <Icon name="musical-note-outline" size={48} color={colors.textMuted} />
              <Text style={styles.notFoundText}>Letra não encontrada</Text>
              <Text style={styles.hint}>
                Não foi possível encontrar a letra online.
              </Text>
              <TouchableOpacity onPress={startEditing} style={styles.addBtn}>
                <Icon name="add" size={18} color={colors.background} />
                <Text style={styles.addBtnText}>Adicionar letra manualmente</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'editing' && (
            <TextInput
              ref={inputRef}
              style={styles.editor}
              value={draft}
              onChangeText={setDraft}
              multiline
              placeholder="Cole ou digite a letra aqui..."
              placeholderTextColor={colors.textMuted}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="sentences"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
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
    gap: 8,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  headerArtist: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  iconBtn: {
    padding: 6,
  },
  editActions: {
    flexDirection: 'row',
    gap: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  lyricsText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 26,
  },
  editor: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    padding: 20,
    backgroundColor: colors.surface,
    margin: 12,
    borderRadius: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  notFoundText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  addBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
    paddingVertical: 8,
  },
  deleteBtnText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
