'use strict';

const fs = require('fs');
const path = require('path');
const camelCase = require('lodash.camelcase');
const includes = require('lodash.includes');

const indexFiles = ['index.js', 'index.node'];

/**
 * synchronously transforms module names found in a path into a dictionary suited for module.exports, with camel-cased
 * function names as keys and loaded modules as values.
 * @param dir (optional) the modules directory path.
 * @param excludes (optional) an array of module names to exclude from the resulting exports object.
 * @param interceptor (optional) a function that's called after each module has been loaded. receives two arguments:
 * the module name, and the loaded module, and may return the module after modifying it.
 * @returns {*} a mapping object for module.exports
 */
function autoExports() {

    let next, args = Array.prototype.slice.call(arguments);
    let dir, excludes, interceptor;

    if (next = args.shift()) {
        dir = String(next);
    } else {
        dir = path.dirname(module.parent.filename);
    }

    if (next = args.shift()) {
        if (typeof next === 'function') {
            interceptor = next;
        } else if (Array.isArray(next)) {
            excludes = ensureArray(next);
        }
    }

    if (!interceptor) {
        if (next = args.shift()) {
            if (typeof next === 'function') {
                interceptor = next;
            }
        }
    }

    return []
        .concat(filesIn(dir))
        .filter(excludeIndexFiles)
        .map(pathName)
        .filter(excludeOf(excludes))
        .reduce(moduleExportsBuilder(dir, interceptor), {});
}

function filesIn(dir) {
    return fs.readdirSync(path.resolve(dir));
}

function excludeOf(arr) {
    return function (item) {
        return !includes(arr, item);
    }
}

function excludeIndexFiles(file) {
    return !includes(indexFiles, file);
}

function pathName(file) {
    return path.parse(file).name;
}

function ensureArray(arr) {
    return [].concat(arr).filter(Boolean);
}

function moduleExportsBuilder(dir, interceptor) {
    return function (exportsMap, moduleName) {
        let module = require(`${dir}/${moduleName}`);
        if (interceptor) {
            let modified = interceptor(moduleName, module);
            if (modified) {
                module = modified;
            }
        }
        let fnName = camelCase(moduleName);
        exportsMap[fnName] = module;
        return exportsMap;
    }
}


module.exports = autoExports;
