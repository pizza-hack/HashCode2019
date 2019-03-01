import { Photo } from "./photo.model";

export class Slide {
  photos: Photo | Photo[];
  tags: string[];

  constructor(obj: Slide) {
    this.photos = obj.photos;
    this.tags = obj.tags;
  }
}