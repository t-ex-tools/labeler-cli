
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import JSONStream from 'JSONStream';
import Util from './Util.js';
import Blocklists from './blocklists.js';

import pkg from '../labeler-core/dist/labeler-core.module.js';
const { BlockList } = pkg.Labeler;

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {

  label: function(dir, options) {

    let path = Util.path(dir);
    if (!path) {
      console.log('Error: files not found at ' + path);
      process.exit(1);
    }

    if (!Util.isDir(path)) {
      console.log('Error: ' + path + ' is not a directory');
      process.exit(1);
    }

    let files = Util.batches(path);
    if (files.length === 0) {
      console.log('Error: ' + path + ' contains no JSON files');
      process.exit(1);
    }

    // TODO: this is the shit
    let lists = Blocklists.map((e) => new BlockList(e.name, e.url, e.evaluator));
    Promise
      .allSettled(lists.map((l) => l.init()))
      .then(() => this.process(path, files, options, lists));    
  },

  process: function(path, files, options, lists) {

    let output = options.output;
    const writeStream = fs.createWriteStream(output);
    writeStream.write('[');

    const log = Array(files.length).fill(0);
    let isFirst = true;

    files
      .forEach((file, idx) => {

        const pipeline = fs
          .createReadStream(path + file)
          .pipe(JSONStream.parse('*'));

        pipeline.on('start', () => {
          console.log("start")
        });
  
        pipeline.on('data', (r) => {
          log[idx] += 1;
          if (!options.silent) {
            console.clear();
            console.log(log.reduce((acc, val) => acc + val, 0));
          }
  
          if (r.success) {
            r.labels = lists.map((l) => l.isLabeled(r));

            if (!isFirst) {
              writeStream.write(', ');
              isFirst = false;
            }
            
            writeStream.write(JSON.stringify(r));
          }
        });
  
        pipeline.on('end', () => {
          if (idx === files.length - 1) {
            writeStream.write(']');
            writeStream.close();
          }
        });
  
      })
  },

}