import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * A module for utility functions.
 * @module Util
 */
export default {

  /**
   * A function to check whether an absolute or relative path exists.
   * @param {String} dir A given path as string.
   * @returns {String} Returns the path in case it exists. Returns ``null`` otherwise.
   */
  path(dir) {
    return (fs.existsSync(dir)) 
      ? dir
      : (fs.existsSync(__dirname + '/' + dir))
        ? rel // TODO: not defined
        : null;    
  },

  /**
   * A function to check whether a path is a directory.
   * This is a wrapper function for ``fs.lstatSync(path).isDirectory()``.
   * @param {String} path  A given path as string.
   * @returns {Boolean} 
   */
  isDir(path) {
    return fs
      .lstatSync(path)
      .isDirectory();
  },

  /**
   * A function to read the contents of a directory and to
   * extract all files with the file extension ``*.json``.
   * @param {String} path A given path as string.
   * @returns {Array} Returns all JSON files contained in ``path``.
   */
  batches(path) {
    return fs
      .readdirSync(path)
      .filter((file) => file.endsWith('.json'));
  },

};