/* global Handlebars */
(function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // latest AMD Handlebars sets up in the 'default' property
        define(['handlebars'], function(Handlebars) {
            return factory(Handlebars.default||Handlebars);
        });
    }
    else if (typeof exports === 'object') {
        module.exports = factory(Handlebars);
    }
    else {
        root.withHandlebarsView = factory(Handlebars);
    }
}(this, function(Handlebars) {
    'use strict';

    var rePartials = /(?:{{>\s*([^}]+)\s*}})/g,
        reId = /^#/,
        isPrecompiled = function(name) {
            return !!(typeof Handlebars.templates !== 'undefined' && Handlebars.templates[name]);
        },
        isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };

    function withHandlebarsView() {
        /**
         * Defining templates to use in a component. Example:
         *
         *     this.templates({
         *         'test': ['#test', { noEscape: true }],  - A selector id referencing a <script id="test" type="text/x-template-handlebars"></script>
         *         'test2': 'test2', - name of a precompiled template that was loaded
         *         'test3': '<p>{{greeting}}, {{name}}</p>' - an inline, string html template
         *     });
         *
         */
        this.templates = function(cfg) {
            this._templates = cfg || {};

            // Each component caches it's own templates. We could cache across
            // the same component based on a template #id; but not all template definitions
            // passed in are via #ids on SCRIPT tags, some might be compiled template names
            // or even straight HTML strings.
            this.__templates_cache__ = {
                // identify owner and creation of cache
                __owner__: 'id-' + this.identity + ':' + (new Date()).toISOString()
            };
            return this;
        };

        /**
         * Define Handlebars template helper functions, passing in an
         * object with the helper name as the property and the function
         * definition as the value for that property.
         *
         *  this.templateHelpers({
         *      'json': function(obj) {
         *          // return JSON formatted object
         *          return new Handlebars.SafeString(JSON.stringify(obj));
         *      }
         *  });
         *
         */
        this.templateHelpers = function(cfg) {
            for (var key in cfg) {
                var fn = cfg[key],
                    helper = key;

                fn = (typeof fn === 'string') ? this[fn] : fn;

                if (fn) {
                    Handlebars.registerHelper(helper, cfg[helper].bind(this));
                }
            }
        };

        /**
         * Allow for components still using attributes() or defaultAttrs()
         * to pull in templates
         */
        this.addCompatTemplates = function() {
            if (!this._templates) {
                this._templates = {};
            }
            for (var prop in this.attr.templates) {
                // don't over-write new style templates
                if (!this._templates.hasOwnProperty(prop)) {
                    this._templates[prop] = this.attr.templates[prop];
                }
            }
            this._compat_done = true;
        };

        /**
         * Render the template via it's property `name' defined in the
         * templates({...}) call, using the given context `data'
         */
        this.render = function (name, data) {
            if (!this._compat_done && this.attr && this.attr.templates) {
                // pull in backward compat templates on first use if defined
                this.addCompatTemplates();
            }

            if (!this._templates) {
                // need to have some templates to render, dude.
                throw new Error('error: [' + this + '] render() called but no templates defined');
            }

            var context = data || {},
                template = this._templates[name] || name;

            // add to cache if we haven't already
            if (!this.__templates_cache__[name]) {
                if (isPrecompiled(template)) {
                    // pre-compiled, so just cache the template function
                    this.__templates_cache__[name] = Handlebars.templates[template];
                }
                else {
                    var markup,
                        options = {},
                        matches;

                    if (isArray(template)) {
                        // array with compile options
                        options = template[1];
                        template = template[0];
                    }

                    // not compiled, we'll need to compile the template
                    // and cache it as well.
                    if (reId.test(template)) {
                        // a template via <script> tag and #id
                        markup = $(template).html();
                        if (!markup) {
                            throw new Error("error: Handlebars: template with id '#" + template + "' is not defined");
                        }
                    }
                    else {
                        // an inline, HTML template
                        markup = template;
                    }

                  // Look for and pre-compile/cache any partials
                    while ((matches = rePartials.exec(markup)) !== null) {
                        var pname = matches[1],
                            pmarkup;

                        // Register this partial if not found
                        if (!Handlebars.partials[pname]) {
                            var poptions = {};
                            if (isPrecompiled(pname)) {
                                pmarkup = Handlebars.templates[pname];
                            }
                            else if (reId.test(pname)) {
                                pmarkup = $('#'+pname).html();
                            }
                            else {
                                // grab it from this._templates
                                pmarkup = this._templates[pname];
                                if (isArray(pmarkup)) {
                                    poptions = pmarkup[1];
                                    pmarkup = pmarkup[0];
                                }
                            }
                            Handlebars.registerPartial(pname, pmarkup, poptions);
                        }
                    }
                    // cache the compiled template function
                    this.__templates_cache__[name] = Handlebars.compile(markup, options);
                }
            }
            // return the rendered html using the passed context
            return this.__templates_cache__[name](context);
        };

        this.before('initialize', function() {
            // flag for pulling in backward compatible templates from prior versions
            this._compat_done = false;
        });
    }

    return withHandlebarsView;

}));
