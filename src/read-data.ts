import * as fs from 'fs';
import { Photo, PhotoOrientation } from './photo.model';
import { fileName } from './index';
import * as sqlite from 'sqlite';

let dataSet: Photo[] = [];

let databaseProm = sqlite.open('database.db', {
  verbose: true,
  cached: true
})
.then(database => {
  console.log('database connected');
  return database;
});

function cleanAndSplit(line: string) {
  return line.trim().split(' ');
}

async function readBody(lines: string[]) {
  const databaseName = `tags_${fileName.split('_')[0]}`;
  const database = await databaseProm;

   await database.run(`CREATE TABLE IF NOT EXISTS ${databaseName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL UNIQUE
    );`)
  .then(() => {
    console.log('created table succesfuly');
  });

  // console.log(await database.get(`SELECT count(*) FROM ${databaseName}`));
  await database.exec(`BEGIN`);
  const insertPrepStat = await database.prepare(`INSERT INTO ${databaseName} VALUES (?, ?)`);
  const selectPrepStat = await database.prepare(`SELECT * FROM ${databaseName} WHERE tag = ?`);

  for (const [index, line] of lines.entries()) {
    console.log(index);
    const array: string[] = line.split(' ');
    const tags: string[] = array.slice(2);
    const tagIndexes: number[] = [];
    
    for (let i = 0; i < tags.length; i++) {
      let tagId: number;
      const dbTag = await selectPrepStat.get(tags[i]);
      if (dbTag === undefined) {
        const result = await insertPrepStat.run(null, tags[i]);
        tagIndexes.push(result.lastID);
      } else {
        tagIndexes.push(dbTag.id);
      }
    }

    if (array[0] === 'H') {
      dataSet.push(new Photo({
        id: index,
        orientation: PhotoOrientation.horizontal,
        tags: tags,
        tagIndexes: tagIndexes
      }));
    } else {
      dataSet.push(new Photo({
        id: index,
        orientation: PhotoOrientation.vertical,
        tags: tags,
        tagIndexes: tagIndexes
      }));
    }
  }
  await database.exec(`COMMIT`);
}

export async function readData(): Promise<Photo[]> {
  const file = fs.readFileSync(`./${fileName}`);
  const splitLines = file.toString().trim().split('\n');
  await readBody(splitLines.slice(1));
  return dataSet;
}