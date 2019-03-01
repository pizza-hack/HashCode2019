import { Slide } from "./slide.model";
import * as _ from 'lodash';

export function getScore(slides: Slide[]): number {
  let score: number = 0;
  for (let i = 0; i < slides.length - 1; i++) {
    score += getPairScore(slides[i], slides[i + 1]);
  }
  return score;
}

export function getPairScore(slide1: Slide, slide2: Slide): number {
  return Math.min(
    getIntersectionScore(slide1, slide2),
    getSuplementaryScore(slide1, slide2),
    getSuplementaryScore(slide2, slide1)
  );
}

function getIntersectionScore(slide1: Slide, slide2: Slide) {
  const score = _.intersection(slide1.tags, slide2.tags).length;
  return score;
}

function getSuplementaryScore(slide1: Slide, slide2: Slide) {
  const suplementary = slide1.tags.filter(tag => !slide2.tags.includes(tag));
  return suplementary.length;
}