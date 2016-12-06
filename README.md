# auto-exports

> creates a `module.exports` map for all modules in a directory


## installation

```shell
npm i auto-exports -S
```


## usage

this module exports (no pun intended) a single function, which 
synchronously transforms all JS modules in a directory (*except for 
`index.js`!*) into a dictionary suited for `module.exports`. 
the keys in this dictionary will be the camel-cased module names, and 
the values will hold the loaded modules.

this function accepts the modules directory path as the first argument, 
an optional list of module names to exclude as the second, and an 
optional module handler as the third.

the module exclusions list is an array of modules names that will be 
excluded from the resulted dictionary.

the module handler is a function that's called after each module has 
been loaded. it receives two arguments: the module name, and the loaded 
module, and may return the module after modifying it. useful if you want 
to add a method to each module, or wrap all modules with the same type 
of proxy.


## examples

let's assume we have a directory with two files (modules); `foo-foo.js`, 
which exports an object, and `bar-bar.js`, which exports a function.

we also have an additional `index.js` file, where we call `autoExports()`.


#### just auto load all modules

###### index.js

```javascript
const autoExports = require('auto-exports');
module.exports = autoExports(__dirname);
```

###### result

```javascript
{
    fooFoo: [Object],
    barBar: [Function]
}
```


#### exclude some modules

###### index.js

```javascript
// ...
module.exports = autoExports(__dirname, ['foo-foo']);
```

###### result

```javascript
{
    barBar: [Function]
}
```


#### modify each loaded module

###### index.js

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

###### result

```javascript
{
    fooFoo: [Proxy],
    barBar: [Proxy]
}
```


#### exclude some modules and modify each loaded module

###### index.js

```javascript
// ...
module.exports = autoExports(__dirname, ['foo-foo'], (moduleName, module) => {
    return Object.defineProperty(module, 'wat', { value: moduleName });
});
```

###### result

```javascript
{
    barBar: [Object]
}
// barBar.wat -> 'bar-bar'
```
