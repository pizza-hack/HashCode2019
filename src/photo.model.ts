export enum PhotoOrientation {
  horizontal,
  vertical
}

export class Photo {
  id: number; // Starting 0
  orientation: PhotoOrientation;
  tags: string[];

  constructor(obj: Photo) {
    this.id = obj.id;
    this.orientation = obj.orientation;
    this.tags = obj.tags;
  }
}