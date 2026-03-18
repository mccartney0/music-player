import {Track} from './MusicScanner';

export interface YouTubeVideo {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  thumbnail?: string;
  views?: number;
}

// Usando Piped API (sem anúncios, sem rastreamento do Google)
const PIPED_API = 'https://pipedapi.kavin.rocks';

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `${PIPED_API}/search?q=${encodeURIComponent(query)}&filter=videos`,
    );
    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items
      .filter((item: any) => item.type === 'video')
      .slice(0, 20)
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        uploader: item.uploader,
        duration: item.duration || 0,
        thumbnail: item.thumbnail,
        views: item.views,
      }));
  } catch (error) {
    console.error('Erro ao buscar no YouTube:', error);
    return [];
  }
}

export async function getYouTubeAudioUrl(videoId: string): Promise<string> {
  try {
    const response = await fetch(`${PIPED_API}/streams/${videoId}`);
    const data = await response.json();

    if (!data.audioStreams || data.audioStreams.length === 0) {
      throw new Error('Nenhum stream de áudio disponível');
    }

    // Selecionar o stream de áudio com melhor qualidade (maior bitrate)
    const audioStream = data.audioStreams.reduce((best: any, current: any) => {
      const bestBitrate = best.bitrate || 0;
      const currentBitrate = current.bitrate || 0;
      return currentBitrate > bestBitrate ? current : best;
    });

    return audioStream.url;
  } catch (error) {
    console.error('Erro ao obter URL de áudio:', error);
    throw error;
  }
}

export function convertYouTubeToTrack(video: YouTubeVideo): Track {
  return {
    id: `yt-${video.id}`,
    url: '', // Será preenchido quando necessário
    title: video.title,
    artist: video.uploader,
    album: 'YouTube',
    duration: video.duration,
    artwork: video.thumbnail,
  };
}

export async function getYouTubeTrack(video: YouTubeVideo): Promise<Track> {
  try {
    const audioUrl = await getYouTubeAudioUrl(video.id);
    const track = convertYouTubeToTrack(video);
    track.url = audioUrl;
    return track;
  } catch (error) {
    console.error('Erro ao converter vídeo do YouTube para track:', error);
    throw error;
  }
}
