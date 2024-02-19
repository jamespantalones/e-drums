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
      const [index, ...name] = file.split(DELIMITER);

      let extDirty = name.pop();

      let [ext, ..._rest] = (extDirty || '').split('.');

      return {
        index,
        name: `${name.join(' ')} ${ext}`,
        files: [file],
      };
    });

  // now write it
  await fs.writeFile(
    `${SRC_DIR}/config.json`,
    JSON.stringify(config, null, 2),
    'utf-8'
  );
})();
