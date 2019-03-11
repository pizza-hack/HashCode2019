import { Photo } from "./photo.model";

export class Slide {
  id: number;
  photos: Photo | Photo[];
  tags: string[];
  tagIndexes: number[];

  constructor(obj: Slide) {
    this.id = obj.id;
    this.photos = obj.photos;
    this.tags = obj.tags;
    this.tagIndexes = obj.tagIndexes;
  }
}