'use strict';

const path = require('path');
const assert = require('assert');


describe('auto-exports', function () {

    const autoExports = require('../lib/auto-exports');
    const fixturesPath = path.join(__dirname, 'fixtures');

    const watExtendModuleHandler = (moduleName, module) => {
        module.wat = `wat! my name is "${moduleName}"`;
        return module;
    };

    let result;


    describe('when required', function () {

        describe('from within the index directory', function () {

            it(`should not fail`, function () {
                const self = require('./fixtures/self');
                assert.ok(self);
            });
        });
    });

    
    describe('when called with no arguments', function () {

        it(`should resolve the path to the directory of the requiring module`, function () {
            result = autoExports();
            assert('autoExports' in result);
        });
    });


    describe('when called with a modules directory path', function () {

        beforeEach(function init() {
            result = autoExports(fixturesPath);
        });

        it('should not include the "index" module', function () {
            assert(!('index' in result));
        });

        it('should include three modules', function () {
            assert.equal(Object.keys(result).length, 3);
        });

        it('should include the "foo-foo" module, with api name "fooFoo"', function () {
            assert('fooFoo' in result);
        });
    });

    describe('when called with a modules directory path and an array of modules to exclude', function () {

        beforeEach(function init() {
            result = autoExports(fixturesPath, ['foo-foo']);
        });

        it('should exclude the "foo-foo" module', function () {
            assert(!('fooFoo' in result));
        });

        it('should include the "bar-bar" module', function () {
            assert('barBar' in result);
        });
    });

    describe('when called with a modules directory path and a function to handle modules', function () {

        it('should extend all extensible modules with the "wat" prop', function () {
            result = autoExports(fixturesPath, watExtendModuleHandler);
            assert.ok(result.barBar.wat);
        });
    });

    describe('when called with a modules directory path, an array of modules to exclude and a function to handle modules', function () {

        it('should extend all extensible modules with the "wat" prop', function () {
            result = autoExports(fixturesPath, ['foo-foo'], watExtendModuleHandler);
            assert.ok(result.barBar.wat);
        });
    });

});
