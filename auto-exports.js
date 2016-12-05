'use strict';

const fs = require('fs');
const path = require('path');
const camelCase = require('lodash.camelcase');


/**
 * synchronously transforms module names found in a path into an dictionary suited for module.exports, with camel-cased 
 * function names as keys and loaded modules as values.
 * @param modulesPath the modules directory path.
 * @param moduleHandler a function that's called after each module has been loaded. receives two arguments:
 * the module name, and the loaded module, and may return the module after modifying it.
 * @returns {*} a mapping object for module.exports
 */
function autoExports(modulesPath, moduleHandler) {
    return []
        .concat(fs.readdirSync(path.resolve(modulesPath, '.'))) // start the chain with files in the modules dir
        .filter((file) => 'index.js' !== file) // leave out the index file
        .map((file) => path.basename(file, '.js')) // strip file extensions, now we have bare module names
        .reduce((exportsMap, moduleName) => { // build the exports object entries from each module name
            let module = require(`${modulesPath}/${moduleName}`);
            if (typeof moduleHandler === 'function') {
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


module.exports = autoExports;
