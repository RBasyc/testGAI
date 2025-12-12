export interface SongMetadata {
  file: File;
  name: string;
  url: string;
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  coverArtUrl: string | null;
  isGeneratingArt: boolean;
}