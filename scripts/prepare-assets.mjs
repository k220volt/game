import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const generated = 'art-source/';
await mkdir('public/img',{recursive:true});
await sharp(generated+'park.png').resize(960).webp({quality:86}).toFile('public/img/park.webp');
await sharp(generated+'title.png').resize(840).webp({quality:90}).toFile('public/img/title.webp');
const atlas = generated+'characters.png';
const normalized = await sharp(atlas).resize(1280,1280).png().toBuffer();
// Crop authored atlas cells for game packaging; preserve original transparency.
for(const [name,left,top,width,height] of [['eppy',0,80,461,540],['dange',463,65,390,557],['flower',850,130,430,485],['kiss',0,642,426,556],['celebrate',426,640,426,558],['cry',852,740,428,450]]){
  await sharp(normalized).extract({left,top,width,height}).resize({width:420}).webp({quality:90}).toFile(`public/img/${name}.webp`);
}
for (const [name,file] of [['kiss','kiss.png'],['celebrate','celebrate.png']]) {
  await sharp(generated+file).trim().resize(560).webp({quality:90}).toFile(`public/img/${name}.webp`);
}
