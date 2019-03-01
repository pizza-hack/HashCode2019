import * as fs from 'fs';
import { Photo, PhotoOrientation } from './photo.model';
import { fileName } from '.';

let dataSet: Photo[] = [];

function cleanAndSplit(line: string) {
  return line.trim().split(' ');
}

function readBody(lines: string[]) {
  for (const [index, line] of lines.entries()) {
    const array: string[] = line.split(' ');
    if (array[0] === 'H') {
      dataSet.push(new Photo({
        id: index,
        orientation: PhotoOrientation.horizontal,
        tags: array.slice(2),
      }));
    } else {
      dataSet.push(new Photo({
        id: index,
        orientation: PhotoOrientation.vertical,
        tags: array.slice(2),
      }));
    }
  }
}

export function readData(): Photo[] {
  const file = fs.readFileSync(`./${fileName}`);
  const splitLines = file.toString().trim().split('\n');
  readBody(splitLines.slice(1));
  return dataSet;
}