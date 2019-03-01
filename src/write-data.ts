import * as fs from 'fs';
import { Slide } from './slide.model';
import { fileName } from '.';

export function writeData(slides: Slide[], score: number) {
  let fileStr: string = `${String(slides.length)}\n`;
  for (const slide of slides) {
    if (Array.isArray(slide.photos)) {
      fileStr = fileStr.concat(`${String(slide.photos[0].id)} `);
      fileStr = fileStr.concat(String(slide.photos[1].id));
    } else {
      fileStr = fileStr.concat(`${String(slide.photos.id)}`);
    }
    fileStr = fileStr.concat('\n');
  }
  const dirName = fileName.split('.')[0];
  if (!fs.existsSync(`./results/${dirName}`)){
    fs.mkdirSync(`./results/${dirName}`);
}
  fs.writeFileSync(`./results/${dirName}/${score}_${(new Date()).toLocaleTimeString()}`, fileStr);
}