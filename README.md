# auto-exports

> creates a `module.exports` map for all modules in a directory


## installation

```shell
npm i auto-modules -S
```


## usage

this module exports (no pun intended) a single function, which 
synchronously transforms all modules in a directory (*except for `index.js`!*) 
into a dictionary suited for `module.exports`. 
the keys in this dictionary will be the camel-cased module names, and 
the values will hold the loaded modules.

this function accepts the modules directory path as the first argument, 
and a module handler as the second.

the module handler is a function that's called after each module has 
been loaded. it receives two arguments: the module name, and the loaded 
module, and may return the module after modifying it. useful if you want 
to add a method to each module, or wrap all modules with the same type 
of proxy.


## examples

### just auto load all modules

```javascript
const autoExports = require('auto-exports');
// ...
module.exports = autoExports(__dirname);
```

### modify each loaded module

```javascript
// ...
module.exports = autoExports(__dirname, (moduleName, module) => {
    return new Proxy(module, {
        get (target, key) {
            return Reflect.has(target, key) ? Reflect.get(target, key) : `${moduleName}'s got no ${key}`;
        }
    });
});
```
