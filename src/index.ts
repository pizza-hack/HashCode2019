import { readData } from "./read-data";
import * as _ from 'lodash';
import { writeData } from "./write-data";
import { PhotoOrientation, Photo } from "./photo.model";
import { Slide } from "./slide.model";
import { createHorizontalSlide, createVerticalSlide } from "./create-slides";
import { getScore, getPairScore } from "./get-score";

export const fileName = 'e_shiny_selfies.txt';

const photos: Photo[] = readData();
const verticalPhotos: Photo[] = photos.filter(photo => photo.orientation === PhotoOrientation.vertical);
const horizontalPhotos: Photo[] = photos.filter(photo => photo.orientation === PhotoOrientation.horizontal);

const initialSlides: Slide[] = [];

for (const photo of horizontalPhotos) {
  initialSlides.push(
    createHorizontalSlide(photo)
  );
}
for (let i = 0; i < Math.floor(verticalPhotos.length); i = i + 2) {
  initialSlides.push(
    createVerticalSlide(verticalPhotos[i], verticalPhotos[i + 1])
  );
}

//const trozoSize = Math.max(Math.ceil(initialSlides.length / 10), 1000);
const trozoSize = 450;
const trozos: Slide[][] = [];

for (let i = 0; i < Math.ceil(initialSlides.length / trozoSize); i++) {
  trozos.push(initialSlides.slice(i * trozoSize, i * trozoSize + trozoSize));
}


function orderSlides(inputSlides: Slide[]): Slide[] {
  let slides: Slide[] = [...inputSlides];
  const orderedSlides: Slide[] = [];

  let currentSlide = slides.shift();
  // if (currentSlide) {
  //   orderedSlides.push(currentSlide);
  // }
  while (slides.length > 0) {
    if (currentSlide) {
      orderedSlides.push(currentSlide);
      let currentScore = 0;
      let bestScoreSlide: Slide = currentSlide;
      for (let slide of slides) {
        const auxScore = getPairScore(currentSlide, slide);
        if (auxScore >= currentScore) {
          currentScore = auxScore;
          bestScoreSlide = slide;
        }
      }
      currentSlide = bestScoreSlide;
      slides = slides.filter(slide => slide !== currentSlide);
    }
  }
  return orderedSlides;
}

for (let i = 0; i < trozos.length; i++) {
  console.log(i);
  trozos[i] = orderSlides(trozos[i]);
}


const resultSlides = trozos.reduce((a, b) => {
  return a.concat(b);
}, []);
writeData(resultSlides, getScore(resultSlides));
// console.log(initialSlides);