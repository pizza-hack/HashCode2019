import { Slide } from "./slide.model";
import * as _ from 'lodash';
import { Photo } from "./photo.model";

export function getScore(slides: Slide[]): number {
  let score: number = 0;
  for (let i = 0; i < slides.length - 1; i++) {
    score += getPairScore(slides[i], slides[i + 1]);
  }
  return score;
}

export function getPairScore(slide1: Slide | Photo, slide2: Slide | Photo): number {
  const intersectionTagIndexes = getIntersection(slide1, slide2);
  return Math.min(
    intersectionTagIndexes.length,
    getSuplementary(slide1,intersectionTagIndexes).length,
    getSuplementary(slide2, intersectionTagIndexes).length
  );
}

export function getIntersection(slide1: Slide | Photo, slide2: Slide | Photo) {
  // if we process the arrays from shortest to longest
  // then we will identify failure points faster, i.e. when 
  // one item is not in all arrays
  const ordered = [slide1.tagIndexes, slide2.tagIndexes].sort((a1,a2) => a1.length - a2.length);
  const shortest = ordered[0];
  const set = new Set(); // used for bookeeping, Sets are faster
  const result = [] // the intersection, conversion from Set is slow
  // for each item in the shortest array
  for(let i=0;i<shortest.length;i++) {
    const item = shortest[i];
    // see if item is in every subsequent array
    let every = true; // don't use ordered.every ... it is slow
    for(let j=1;j<ordered.length;j++) {
      if(ordered[j].includes(item)) continue;
      every = false;
      break;
    }
    // ignore if not in every other array, or if already captured
    if(!every || set.has(item)) continue;
    // otherwise, add to bookeeping set and the result
    set.add(item);
    result[result.length] = item;
  }
  return result;
}

export function getSuplementary(slide: Slide | Photo, intersectionTagIndexes: number[]) {
  return slide.tagIndexes.filter(tagIndex => !intersectionTagIndexes.includes(tagIndex));
}