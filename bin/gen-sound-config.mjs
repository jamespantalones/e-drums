import path from 'node:path';
import fs from 'node:fs/promises';

const DELIMITER = '_';
const SRC_DIR = path.resolve(process.cwd(), 'public/sounds');
const EXT = '.wav';

(async function start() {
  const files = await fs.readdir(SRC_DIR);

  console.log({ files });

  const config = files
    .filter((f) => f.includes(EXT))
    .map((file) => {
      const [i, ...name] = file.split(DELIMITER);

      const index = parseInt(i, 10);
      let extDirty = name.pop();

      let [ext, ..._rest] = (extDirty || '').split('.');

      const val = {
        index,
        name: `${name.join(' ')} ${ext}`,
        files: [file],
      };

      return val;
    })
    .sort((a, b) => {
      if (a.index > b.index) {
        return 1;
      }
      if (a.index < b.index) {
        return -1;
      }
      return 0;
    });

  console.log(config);

  // now write it
  await fs.writeFile(
    `${SRC_DIR}/config.json`,
    JSON.stringify(config, null, 2),
    'utf-8'
  );
})();
