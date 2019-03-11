import { readData } from "./read-data";
import * as _ from 'lodash';
import { writeData } from "./write-data";
import { PhotoOrientation, Photo } from "./photo.model";
import { Slide } from "./slide.model";
import { getScore, getPairScore, getIntersection, getSuplementary } from "./get-score";
import { performance } from 'perf_hooks';

export const fileName = 'e_shiny_selfies.txt';

async function main() {
  const chunkSize = 1000; // Adjustable value, higher get optimal results, but is slower
  
  let startTime = performance.now();
  
  const photos: Photo[] = await readData();
  let verticalPhotos: Photo[] = photos.filter(photo => photo.orientation === PhotoOrientation.vertical);
  let horizontalPhotos: Photo[] = photos.filter(photo => photo.orientation === PhotoOrientation.horizontal);
  let initialSlides: Slide[] = [];
  
  for (let i = 0; i < horizontalPhotos.length; i++) {
    initialSlides.push(
      new Slide({
        id: i,
        photos: horizontalPhotos[i],
        tags: horizontalPhotos[i].tags,
        tagIndexes: horizontalPhotos[i].tagIndexes
      })
    );
  }

  // Vertical slides
  verticalPhotos = verticalPhotos
  .sort((a, b) => {
    return b.tagIndexes.length - a.tagIndexes.length;
  });

  // for (let i = 0; i < Math.floor(verticalPhotos.length / 2); i++) {
  //   const photos = [verticalPhotos[i], verticalPhotos[verticalPhotos.length - 1 - i]];
  //   initialSlides.push(
  //     new Slide({
  //       id: horizontalPhotos.length + i,
  //       photos: photos,
  //       tags: _.uniq([...photos[0].tags, ...photos[1].tags]),
  //       tagIndexes: _.uniq([...photos[0].tagIndexes, ...photos[1].tagIndexes]),
  //     })
  //   );
  // }

  for (let i = 0; i < Math.floor(verticalPhotos.length / 2); i++) {
    const photos = [verticalPhotos[i]];
    initialSlides.push(
      new Slide({
        id: horizontalPhotos.length + i,
        photos: photos,
        tags: photos[0].tags,
        tagIndexes: photos[0].tagIndexes,
      })
    );
  }
  verticalPhotos = verticalPhotos.slice(Math.floor(verticalPhotos.length / 2));

  initialSlides = _.shuffle(initialSlides);
  
  // initialSlides = initialSlides.sort((a, b) => {
  //   return b.tags.length - a.tags.length;
  // });

  const chunks: Slide[][] = [];
  
  for (let i = 0; i < Math.ceil(initialSlides.length / chunkSize); i++) {
    chunks.push(initialSlides.slice(i * chunkSize, i * chunkSize + chunkSize));
  }
  
  // WORKING FUNCTION
  function basicOrderSlides(inputSlides: Slide[]): Slide[] {
    // const prevTime = performance.now();
    let slides: Slide[] = [...inputSlides]
    const orderedSlides: Slide[] = [];
  
    let currentSlide = slides.shift();
    while (slides.length > 0) {
      if (slides.length % 100 === 0) {
        // console.log(`Remaining slides: ${slides.length}`);
        // console.log(`Score: ${getScore(orderedSlides)}`);
      }
      
      if (currentSlide) {
        orderedSlides.push(currentSlide);
        let currentScore = 0;
        let bestScoreSlide;
        for (let i = 0; i < slides.length; i++) {
          let auxScore = getPairScore(currentSlide, slides[i]);
          if (auxScore > currentScore || bestScoreSlide === undefined) {
            currentScore = auxScore;
            bestScoreSlide = slides[i];
          } else if (auxScore === currentScore && slides[i].tags.length < bestScoreSlide.tags.length) {
            currentScore = auxScore;
            bestScoreSlide = slides[i];
          }
        }
        currentSlide = bestScoreSlide;
        slides = slides.filter(slide => slide !== currentSlide);
      }
    }
    if (currentSlide) {
      orderedSlides.push(currentSlide);
    }
    // console.log(performance.now() - prevTime);
    return orderedSlides;
  }
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Trozo ${i}.`);
    console.log(`Score: ${getScore(chunks.reduce((a, b) => {
      return a.concat(b);
    }, []))}`);
    chunks[i] = basicOrderSlides(chunks[i]);
  }
  
  let resultSlides = chunks.reduce((a, b) => {
    return a.concat(b);
  }, []);
  
  // Añadir las fotos que faltan a los slides verticales
  for (let i = 0; i < verticalPhotos.length; i++) {
    console.log(i);
    let bestScore: number = -Infinity;
    let bestSlide: Slide = resultSlides[0];
    for (let j = 0; j < resultSlides.length; j++) {
      if (Array.isArray(resultSlides[j].photos) && (resultSlides[j].photos as Photo[]).length < 2) {
        let prevScore: number;
        if (j > 0 && j < resultSlides.length - 1) {
          prevScore = getScore([resultSlides[j-1], resultSlides[j], resultSlides[j+1]]);
        } else if (j === 0) {
          prevScore = getScore([resultSlides[j], resultSlides[j+1]]);
        } else {
          prevScore = getScore([resultSlides[j-1], resultSlides[j]]);
        }
        const newSlide = new Slide({
          id: resultSlides[j].id,
          photos: [...(resultSlides[j].photos as Photo[]),verticalPhotos[i]],
          tags: _.uniq([...resultSlides[j].tags, ...verticalPhotos[i].tags]),
          tagIndexes: _.uniq([...resultSlides[j].tagIndexes, ...verticalPhotos[i].tagIndexes])
        });
        let score: number;
        if (j > 0 && j < resultSlides.length - 1) {
          score = getScore([resultSlides[j-1], newSlide, resultSlides[j+1]]) - prevScore;
        } else if (j === 0) {
          score = getScore([newSlide, resultSlides[j+1]]) - prevScore;
        } else {
          score = getScore([resultSlides[j-1], newSlide]) - prevScore;
        }
        if (score > bestScore) {
          bestScore = score;
          bestSlide = newSlide;
        }
      }
    }
    const slideIndex = resultSlides.findIndex(slide => slide.id === bestSlide.id);
    resultSlides[slideIndex] = bestSlide;
  }
  
  writeData(resultSlides, getScore(resultSlides), chunkSize);
  console.log(`Ending after ${performance.now() - startTime} ms`);
}

main();