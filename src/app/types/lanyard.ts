export interface LanyardData {
  spotify: {
    track_id: string;
    timestamps: {
      start: number;
      end: number;
    };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
  } | null;
  discord_user: {
    username: string;
    public_flags: number;
    id: string;
    discriminator: string;
    avatar: string | null;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Activity[];
  listening_to_spotify: boolean;
}

export interface Activity {
  details: string;
  type: number;
  state: string;
  name: string;
  id: string;
  emoji?: {
    name: string;
    id?: string;
    animated?: boolean;
  };
  created_at: number;
  timestamps?: {
    start: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface LanyardMessage {
  op: number;
  t?: "INIT_STATE" | "PRESENCE_UPDATE";
  d: LanyardData;
}
