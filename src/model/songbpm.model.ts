export type Mode = 'major' | 'minor';
export type ModeType = 'flat' | 'sharp';
type Genres = 'Blues' | 'Classical' | 'Country' | 'Electronic' | 'Folk' | ' Funk' | ' Heavy Meal' | 'Hip Hop' | ' Jazz' | ' Latin' | ' New Age' | ' Pop' | ' Punk' | ' R&B' | ' Rap' | ' Raggae' | ' Rock' | ' Soul' | ' World';

export interface ArtistResult {
    id: string; // The GetSong ID for the artist.
    name: string; // The name of the artist.
    uri: string; // The GetSong URI for the artist.
    img: string; // Link to artist photo.
    genres: Genres[]; // Artist main genres.
    from: string; // Country or region/city of origin.
    mbid: string; // MusicBrainz ID.
}

export interface SongResult {
    id: string; // The GetSong ID for the song.
    title: string; // The title of the song.
    uri: string; // The GetSong URI for the song.
    artist: ArtistResult; // See "artist" object.
    tempo: number; // Beat per minute of the song (BPM).
    time_sig: string; // Time signature (beta).
    key_of: string; // Original published key of the song.
    camelot?: string; // Name of the Key on the Camelot Wheel.
    album: Album;
}

export interface BothResult {
    song_id: string; // The GetSong ID for the song.
    song_title: string; // The title of the song.
    song_uri: string; // The GetSong URI for the song.
    tempo: number; // Beat per minute of the song.
    time_sig: string; // Time signature (beta).
    key_of: string; // Original published key of the song.
    open_key: string; // Original published key of the song.
    camelot?: string; // Name of the Key on the Camelot Wheel.
    artist?: ArtistResult; // See "artist" object.
    album: Album;
}

interface Album {
    title: string; // Album name
    uri: string; // The GetSong URI for the album
    img: string; // Link to album cover art
    year: number // Release Year
}

export interface TempoResult {
    song_id: string; // The GetSong ID for the song.
    song_title: string; // The title of the song.
    song_uri: string; // The GetSong URI for the song.
    tempo: number; // Beat per minute of the song.
    artist: ArtistResult; // See "artist" object.
    album: Album; // Same keys and values as for "both" query type at /search/ endpoint.
}

export interface KeyResult {
    song_id: string; // The GetSong ID for the song.
    song_title: string; // The title of the song.
    song_uri: string; // The GetSong URI for the song.
    music_key: {
        raw: string; // input query
        key_of: string; // English name of the Key
        mode: Mode;
    };
    artist: ArtistResult; // See "artist" object.
    album: Album; // Same keys and values as for "both" query type at /search/ endpoint.
}