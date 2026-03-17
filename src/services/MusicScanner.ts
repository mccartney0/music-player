import {Platform, PermissionsAndroid, NativeModules} from 'react-native';

const {MusicScanner: NativeMusicScanner} = NativeModules;

export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork?: string;
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const apiLevel = Platform.Version;
  const permission =
    typeof apiLevel === 'number' && apiLevel >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const granted = await PermissionsAndroid.request(permission, {
    title: 'Permissão de Áudio',
    message: 'O app precisa acessar suas músicas para reproduzi-las.',
    buttonPositive: 'Permitir',
    buttonNegative: 'Negar',
  });

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function scanMusicFiles(): Promise<Track[]> {
  try {
    const songs = await NativeMusicScanner.getAll();

    if (!songs || !Array.isArray(songs)) return [];

    return songs.map((song: any, index: number) => ({
      id: song.id?.toString() || `track-${index}`,
      url: song.path || '',
      title: song.title || 'Sem título',
      artist: song.artist || 'Artista desconhecido',
      album: song.album || 'Álbum desconhecido',
      duration: song.duration ? song.duration / 1000 : 0,
      artwork: song.cover || undefined,
    }));
  } catch (error) {
    console.error('Erro ao escanear músicas:', error);
    return [];
  }
}
