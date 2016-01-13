/**
 * Copyright 2013, Twitter Inc. and other contributors
 * Licensed under the MIT License
 */

(function (root) {
  'use strict';

  jasmine.flight = {};

  /**
   * setupComponent
   * - Assumes it has been called in the context of a jasmine spec.
   * - Creates a new HTML element and attaches to it an instance of this.Component
   * - If a fixture is provided, the fixture will serve as the component root.
   *
   * @param fixture: HTML or jQuery fixture
   * @param options: component initialization options
   */
  function setupComponent (fixture, options) {
    // tear down any existing component instance
    if (this.component) {
      this.component.teardown();
      this.$node.remove();
    }

    if (fixture instanceof jQuery || typeof fixture === 'string') {
      // use the fixture to create component root node
      this.$node = $(fixture).addClass('component-root');
    } else {
      // create an empty component root node
      this.$node = $('<div class="component-root" />');
      options = fixture;
      fixture = null;
    }

    // append component root node to body
    $('body').append(this.$node);

    // normalize options
    options = options === undefined ? {} : options;

    // instantiate component on component root node
    this.component = (new this.Component()).initialize(this.$node, options);
  };

  /**
   * describeComponent wraps jasmine.Env.prototype.describeComponent, providing a global
   * variable to access the current jasmine environment
   *
   * @param componentPath
   * @param specDefinitions
   */
  root.describeComponent = function (componentPath, specDefinitions) {
    jasmine.getEnv().describeComponent(componentPath, specDefinitions);
  };
  jasmine.Env.prototype.describeComponent = function (componentPath, specDefinitions) {
    describe(componentPath, describeComponentFactory(componentPath, specDefinitions));
  };

  /**
   * ddescribeComponent wraps ddescribe
   *
   * @param componentPath
   * @param specDefinitions
   */
  root.ddescribeComponent = function (componentPath, specDefinitions) {
    jasmine.getEnv().ddescribeComponent(componentPath, specDefinitions);
  };
  jasmine.Env.prototype.ddescribeComponent = function (componentPath, specDefinitions) {
    ddescribe(componentPath, describeComponentFactory(componentPath, specDefinitions));
  };

  /**
   * describeComponentFactory
   * loads the specified amd component/mixin before executing specDefinitions
   * provides this.setupComponent
   * Component instances created with this.setupComponent are torn down after each spec
   *
   * @param componentPath
   * @param specDefinitions
   */
  function describeComponentFactory (componentPath, specDefinitions, isMixin) {
    return function () {
      beforeEach(function (done) {
        // reset member variables
        this.Component = this.component = this.$node = null;

        // bind setupComponent to the current context
        this.setupComponent = setupComponent.bind(this);

        var requireCallback = function (registry, defineComponent, Component) {
          // reset the registry
          registry.reset();

          if (isMixin) {
            // mix the mixin in to an anonymous, component
            this.Component = defineComponent(function () {}, Component);
          } else {
            this.Component = Component;
          }
          // let Jasmine know we're good to continue with the tests
          done();
        }.bind(this);

        require(['flight/lib/registry', 'flight/lib/component', componentPath], requireCallback);
      });

      afterEach(function (done) {
        // remove the component root node
        if (this.$node) {
          this.$node.remove();
          this.$node = null;
        }

        var requireCallback = function (defineComponent) {
          // reset local member variables
          this.component = null;
          this.Component = null;
          // teardown all flight components
          defineComponent.teardownAll();
          done();
        }.bind(this);

        require(['flight/lib/component'], requireCallback);
      });

      specDefinitions.apply(this);
    };
  };

  /**
   * Wrapper for describe.
   *
   * @param mixinPath
   * @param specDefinitions
   */
  root.describeMixin = function (mixinPath, specDefinitions) {
    jasmine.getEnv().describeMixin(mixinPath, specDefinitions);
  };
  jasmine.Env.prototype.describeMixin = function (mixinPath, specDefinitions) {
    describe(mixinPath, describeMixinFactory(mixinPath, specDefinitions));
  };

  /**
   * Wrapper for ddescribe.
   *
   * @param mixinPath
   * @param specDefinitions
   */
  root.ddescribeMixin = function (mixinPath, specDefinitions) {
    jasmine.getEnv().ddescribeMixin(mixinPath, specDefinitions);
  };
  jasmine.Env.prototype.ddescribeMixin = function (mixinPath, specDefinitions) {
    ddescribe(mixinPath, describeMixinFactory(mixinPath, specDefinitions));
  };

  /**
   * describeMixinFactory is a wrapper for describeComponentFactory
   * Loads amd mixin as a component before executing specDefinitions
   *
   * @param componentPath
   * @param specDefinitions
   */
  function describeMixinFactory (mixinPath, specDefinitions) {
    return describeComponentFactory(mixinPath, specDefinitions, true);
  };

  /**
   * Wrapper for describe.
   *
   * @param modulePath
   * @param specDefinitions
   */
  root.describeModule = function (modulePath, specDefinitions) {
    return jasmine.getEnv().describeModule(modulePath, specDefinitions);
  };
  jasmine.Env.prototype.describeModule = function (modulePath, specDefinitions) {
    describe(modulePath, describeModuleFactory(modulePath, specDefinitions));
  };

  root.ddescribeModule = function (modulePath, specDefinitions) {
    return jasmine.getEnv().ddescribeModule(modulePath, specDefinitions);
  };
  jasmine.Env.prototype.ddescribeModule = function (modulePath, specDefinitions) {
    ddescribe(modulePath, describeModuleFactory(modulePath, specDefinitions));
  };

  /**
   * Load amd module before executing specDefinitions
   */
  function describeModuleFactory (modulePath, specDefinitions) {
    return function () {
      beforeEach(function (done) {
        this.module = null;

        var requireCallback = function (module) {
          this.module = module;
          done();
        }.bind(this);

        require([modulePath], requireCallback);
      });

      specDefinitions.apply(this);
    };
  };

}(this));
