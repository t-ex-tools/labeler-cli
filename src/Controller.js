
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import JSONStream from 'JSONStream';
import Util from './Util.js';
import Blocklists from './blocklists.js';

import pkg from '../labeler-core/dist/labeler-core.node.js';
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

    let lists = Blocklists.map((e) => new BlockList(e.name, e.url, e.evaluator));
    Promise
      .allSettled(lists.map((l) => l.init()))
      .then((results) => {
        let hadError = results
          .map((r) => r.status === 'rejected')
          .reduce((acc, val) => acc || val, false)

        if (hadError) {
          console.error('Error while retrieving blocklists');
          let errorous = results.filter((r) => r.status === 'rejected');
          errorous.forEach((e) => console.error(e.reason));
        } else {
          this.process(path, files, options, lists)
        }
      });    
  },

  process: function(path, files, options, lists) {

    let streams = files.map((file) => fs.createReadStream(path + file));
    streams.push(fs.createWriteStream(options.output));
    streams[streams.length - 1].write('[');

    this.pipe(streams, 0, {
      options, 
      lists,
      log: Array(files.length).fill(0),
      isFirst: true
    });
  },

  pipe: function(streams, idx, ctx) {
    
    let out = streams[streams.length - 1];
    let pipeline = streams[idx].pipe(JSONStream.parse('*'));

    pipeline.on('data', (r) => {
      
      ctx.log[idx] += 1;
      if (!ctx.options.silent) {
        console.clear();
        console.log(ctx.log.reduce((acc, val) => acc + val, 0));
      }

      if (r.success) {
        r.labels = ctx.lists.map((l) => l.isLabeled(r));

        if (!ctx.isFirst) {
          out.write(', ');
        }
        ctx.isFirst = false;
        
        out.write(JSON.stringify(r));
      }

    });
    
    if (idx < streams.length - 2) {
      pipeline.on('end', () => this.pipe(streams, idx + 1, ctx));
    }

    if (idx === streams.length - 2) {
      pipeline.on('end', () => out.write(']'));
    }
  },

}