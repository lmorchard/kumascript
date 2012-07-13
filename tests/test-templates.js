/*jshint node: true, expr: false, boss: true */

var util = require('util'),
    fs = require('fs'),
    _ = require('underscore'),
    nodeunit = require('nodeunit'),

    kumascript = require('..'),
    ks_utils = kumascript.utils,
    ks_templates = kumascript.templates,
    ks_api = kumascript.api,
    ks_macros = kumascript.macros,
    ks_test_utils = kumascript.test_utils;

// Main test case starts here
module.exports = nodeunit.testCase({

    "Embedded JS templates should work": function (test) {
        testTemplateClass(test, ks_templates.EJSTemplate, 'templates1.txt');
    },

    "JS sandboxed by node.js should work": function (test) {
        testTemplateClass(test, ks_templates.JSTemplate, 'templates2.txt');
    },

    "Peek at what EJS does for source": function (test) {
        fs.readFile(__dirname + '/fixtures/templates3.txt', function (err, data) {
            var ejs = require('ejs');
            
            var js_src = ejs.parse(''+data);
            util.debug("\n"+js_src);

            try {
                var tmpl = ejs.compile(''+data);
                var result = tmpl({ alpha: 'ALPHA', beta: 'BETA' });
                util.debug("RESULT " + util.inspect(result));
            } catch (e) {
                util.debug("ERROR " + util.inspect([
                    e.message, e.fileName, e.lineNumber    
                ]));
            }

            test.done();
        });
    }

    // TODO: Template loading from filesystem
});

function testTemplateClass(test, t_cls, t_fn) {

    fs.readFile(__dirname + '/fixtures/' + t_fn, function (err, data) {
        if (err) { throw err; }

        var parts = (''+data).split('---'),
            src = parts.shift(),
            expected = parts.shift(),
            templates = {
                t1: new t_cls({source: parts.shift()}),
                t2: new t_cls({source: parts.shift()}),
                t3: new t_cls({source: parts.shift()})
            },
            loader_class = ks_test_utils.LocalLoader,
            loader_options = { templates: templates },
            mp = new ks_macros.MacroProcessor({
                loader_class: loader_class,
                loader_options: loader_options 
            }),
            api_ctx = new ks_api.APIContext({ });

        mp.process(src, api_ctx, function (err, result) {
            test.equal(result.trim(), expected.trim());
            test.done();
        });

    });

}
