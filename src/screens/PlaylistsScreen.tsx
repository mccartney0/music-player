import React, {useState} from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../theme/colors';
import {usePlaylists} from '../store/playlistStore';

export function PlaylistsScreen() {
  const navigation = useNavigation<any>();
  const {playlists, createPlaylist, deletePlaylist} = usePlaylists();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim());
      setNewName('');
      setShowModal(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Excluir playlist', `Deseja excluir "${name}"?`, [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deletePlaylist(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => setShowModal(true)}>
        <Icon name="add-circle" size={24} color={colors.accent} />
        <Text style={styles.createText}>Criar playlist</Text>
      </TouchableOpacity>

      {playlists.length === 0 ? (
        <View style={styles.center}>
          <Icon name="list-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>Nenhuma playlist</Text>
          <Text style={styles.emptySubtext}>
            Crie uma para organizar suas músicas
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.playlistItem}
              onPress={() =>
                navigation.navigate('PlaylistDetail', {playlist: item})
              }
              onLongPress={() => handleDelete(item.id, item.name)}>
              <View style={styles.playlistIcon}>
                <Icon name="musical-notes" size={24} color={colors.accent} />
              </View>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.playlistCount}>
                  {item.trackIds.length} música
                  {item.trackIds.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da playlist"
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setNewName('');
                }}
                style={styles.modalBtn}>
                <Text style={styles.modalBtnCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} style={styles.modalBtn}>
                <Text style={styles.modalBtnConfirm}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  createText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 80,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playlistIcon: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  playlistCount: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalBtnCancel: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  modalBtnConfirm: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
