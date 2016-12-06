'use strict';

const fs = require('fs');
const path = require('path');
const camelCase = require('lodash.camelcase');
const includes = require('lodash.includes');

const ext = '.js';


/**
 * synchronously transforms module names found in a path into a dictionary suited for module.exports, with camel-cased
 * function names as keys and loaded modules as values.
 * @param modulesDir the modules directory path.
 * @param excludeModules (optional) an array of module names to exclude from the resulting exports object.
 * @param moduleHandler (optional) a function that's called after each module has been loaded. receives two arguments:
 * the module name, and the loaded module, and may return the module after modifying it.
 * @returns {*} a mapping object for module.exports
 */
function autoExports() {

    let next, args = Array.prototype.slice.call(arguments);
    let modulesDir, excludeModules, moduleHandler;

    if (args.length) {
        next = args.shift();
        if (typeof next === 'string') {
            modulesDir = next;
        }
    }

    if (!modulesDir) {
        throw new Error('modules directory path must be passed as the first argument');
    }
    
    if (args.length) {
        next = args.shift();
        if (typeof next === 'function') {
            moduleHandler = next;
        } else if (Array.isArray(next)) {
            excludeModules = ensureArray(next);
        }
    }

    if (!moduleHandler && args.length) {
        next = args.shift();
        if (typeof next === 'function') {
            moduleHandler = next;
        }
    }

    return []
        .concat(fs.readdirSync(path.resolve(modulesDir, '.'))) // start the chain with files in the modules dir
        .filter((file) => file.endsWith(ext)) // only deal with js modules
        .filter((file) => 'index.js' !== file) // omit the index file
        .map((file) => path.basename(file, ext)) // strip file extensions, now we have bare module names
        .filter((moduleName) => !includes(excludeModules, moduleName)) // omit passed excluded modules
        .reduce((exportsMap, moduleName) => { // build the exports object entries from each module name
            let module = require(`${modulesDir}/${moduleName}`);
            if (moduleHandler) {
                let modified = moduleHandler(moduleName, module);
                if (modified) {
                    module = modified;
                }
            }
            let fnName = camelCase(moduleName);
            exportsMap[fnName] = module;
            return exportsMap;
        }, {});
}

function ensureArray(arr) {
    return [].concat(arr).filter(Boolean);
}


module.exports = autoExports;
