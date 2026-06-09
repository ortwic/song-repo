export function buildArtistImgUrl(artistMbid: string): string {
    return `https://storage.googleapis.com/song-repo.appspot.com/artists/${artistMbid}.jpg`;
}
