import fs from 'fs';
import path from 'path';
import CLI from './cli';
import process from 'process';
import * as crypto from 'crypto';
import * as gltfPipe from 'gltf-pipeline';
import { makeSureDir, readJsonSync, walkDir, writeJsonSync } from './utils';

const cli = new CLI();

interface Args {
  dir: string;
  outdir: string;
}

function updateGLTFRes(gltf: any, resUri: string, newResUri: string) {
  [...gltf.images, ...gltf.buffers].some(i => {
    if (i.uri === resUri) {
      i.uri = newResUri;
      return true;
    }
  });
}

const main = async (args: Args) => {
  try {
    const t = Date.now();
    // prettier-ignore
    const { dir, outdir = './gltf'} = args;
    console.log(dir, outdir);

    const resMap = {};
    makeSureDir(outdir);

    await walkDir(dir, async (file, isDir) => {
      const ext = path.extname(file);
      const isGLTF = !!ext.match(/\.gltf$/i);
      const isGLB = !!ext.match(/\.glb$/i);
      if (!isDir && (isGLB || isGLTF)) {
        const fileName = path.basename(file, ext);
        let result;
        if (isGLB) {
          result = await gltfPipe.glbToGltf(fs.readFileSync(file), {
            separate: true,
          });
        } else if (isGLTF) {
          const gltf = readJsonSync(file);
          result = await gltfPipe.processGltf(gltf, {
            resourceDirectory: dir,
            separate: true,
          });
        }

        for (let [resName, buffer] of Object.entries(
          result.separateResources as { [k: string]: Buffer },
        )) {
          const hash = crypto.createHash('md5');
          hash.update(buffer);
          const md5 = hash.digest('hex');
          const ext = path.extname(resName);
          const base = path.basename(resName, ext);
          if (!resMap[md5]) {
            resMap[md5] = `${base}-${md5.slice(0, 6)}${ext}`;
            fs.writeFileSync(path.resolve(outdir, resMap[md5]), buffer);
          }
          updateGLTFRes(result.gltf, resName, resMap[md5]);
        }
        writeJsonSync(path.resolve(outdir, fileName + '.gltf'), result.gltf);
      }
    });
    console.log(`
cost: ${Date.now() - t}ms
`);
  } catch (error) {
    console.log(error);
  }
};

cli
  .action('-h --help', '显示帮助', '', () => cli.help())
  .action<Args>(
    '-i --input [dir] [?outdir]',
    '多个 gltf 依赖资源合并',
    '',
    main,
  )

  .action("gltf-merge -i '../examples/glb' '../examples/gltf'", '', 'Examples')

  .run(process.argv.slice(2));
