interface PusherListingChunk {
  id: string;

  index: number;

  chunk: string;

  final: boolean;
}

export default PusherListingChunk;
