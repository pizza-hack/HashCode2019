import { Photo } from "./photo.model";
import { Slide } from "./slide.model";
import _ from "lodash";

export function createHorizontalSlide(photo: Photo): Slide {
  return new Slide({
    photos: photo,
    tags: photo.tags
  });
}

export function createVerticalSlide(photo1: Photo, photo2: Photo): Slide {
  return new Slide({
    photos: [photo1, photo2],
    tags: _.uniq(photo1.tags.concat(photo2.tags))
  });
}