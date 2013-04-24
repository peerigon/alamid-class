// @see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof exports === 'object') { // Node
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) { // AMD
        define(factory);
    } else { // Classic
        root.peerigon = root.peerigon || {};
        root.peerigon.Class = factory();
  }
}(this, function alamidClass() {
    "use strict"; // run code in ES5 strict mode

    var slice = Array.prototype.slice,
        argListCache = [],
        extend = _getExtend(Class);

    /**
     * Creates a new class according to the given prototypes. You may pass several objects as prototypes which will be
     * merged into one prototype. The latter prototypes take precedence over the former prototypes. It is also possible
     * to pass functions as prototypes (like mixins).
     *
     * If the prototype contains a "constructor"-function, this method will be called every time an instance is created.
     * The instance will have the constructor function set to the Class.
     *
     * You can also pass a class name as first argument.
     *
     * @param {Function|Object} obj
     * @return {Function}
     */
    function Class(obj) {
        if (arguments.length === 1 && typeof obj === "function") {
            return _getSuperClassWrapper(obj);
        }
        return extend.apply(null, arguments);
    }

    /**
     * In dev-mode alamid class will display the class name in the debugger if it has been provided.
     *
     * @type {Boolean}
     */
    Class.dev = false;

    /**
     * Creates an extend method for the given SuperClass.
     *
     * @private
     * @param {Function} SuperClass
     * @return {Function}
     */
    function _getExtend(SuperClass) {

        /**
         * Creates a new class that inherits from the super class.
         * @see Class
         */
        return function _extend(name, source1, source2, source3) {
            var prototype,
                sources,
                NewClass;

            // Shortcuts for common use-cases because calling slice() is usually slow
            if (typeof name === "string") {
                switch (arguments.length) {
                    case 2: sources = [source1]; break;
                    case 3: sources = [source1, source2]; break;
                    case 4: sources = [source1, source2, source3]; break;
                    default: sources = slice.call(arguments, 1);
                }
            } else {
                switch (arguments.length) {
                    case 1: sources = [name]; break;
                    case 2: sources = [name, source1]; break;
                    case 3: sources = [name, source1, source2]; break;
                    case 4: sources = [name, source1, source2, source3]; break;
                    default: sources = slice.call(arguments, 0);
                }
            }

            if (typeof name !== "string" || Class.dev === false) {
                name = "AnonymousClass";
            }

            prototype = _createPrototypeOf(SuperClass, sources);
            NewClass = _createClassFunction(name, prototype, SuperClass);
            prototype.Class = NewClass;
            _applyClassProperties(NewClass);
            NewClass.prototype = prototype;

            return NewClass;
        };
    }

    /**
     * Mixes all properties of the current prototype into the given object.
     *
     * @param {Object} obj
     * @return {Class}
     */
    function mixin(obj) { /*jshint forin: false, validthis: true */
        var key,
            prototype = this.prototype;

        for (key in prototype) {
            obj[key] = prototype[key];
        }

        return this;
    }

    /**
     * Returns a prototype of the SuperClass and adds all keys from sources. If the SuperClass already contains a method of sources
     * it will be wrapped within a function so the method can access the superior method via this._super();
     *
     * @private
     * @param {Function} SuperClass
     * @param {Array} sources
     * @return {Object}
     */
    function _createPrototypeOf(SuperClass, sources) { /*jshint forin: false */
        var prototype = _createObj(SuperClass.prototype),
            i,
            source,
            key,
            value,
            superFn;

        for (i = 0; i < sources.length; i++) {
            source = sources[i];
            if (!source || (typeof source !== "object" && typeof source !== "function")) {
                throw new TypeError("(alamid-class) Cannot apply properties of " + source);
            }
            if (typeof source === "function") {
                source = source.prototype;
            }
            for (key in source) {
                value = source[key];
                superFn = prototype[key];
                if (key !== "constructor" && typeof value === "function" && typeof superFn === "function") {
                    value = _getMethodWrapper(value, SuperClass.prototype, key);
                }
                prototype[key] = value;
            }
        }

        return prototype;
    }

    /**
     * Applies all properties like extend() or mixin() to a Class.
     *
     * @private
     * @param {Function} Class
     */
    function _applyClassProperties(Class) {
        Class.extend = _getExtend(Class);
        Class.mixin = mixin;
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
     * @private
     * @param {Object} o
     * @return {Object}
     */
    function _createObj(o) {
        function F() {}
        F.prototype = o;
        return new F();
    }

    /**
     * Creates the method wrapper so a method can call the superior method via this._super(). The wrapper preserves
     * the length-attribute of the original method.
     *
     * @private
     * @param {Function} thisFn
     * @param {Object} superProto
     * @param {String} superFnName
     * @return {Function}
     */
    function _getMethodWrapper(thisFn, superProto, superFnName) { /*jshint evil: true */
        var length = thisFn.length,
            evalResult;

        // Shortcuts for common use-cases because eval is slower in some browsers
        switch (length) {
            case 0: return (function () { var prev = this._super, result; this._super = superProto[superFnName]; result = thisFn.apply(this, arguments); this._super = prev; return result; });
            // a, b, c, d are applied as well so code-minimizer don't strip them away
            case 1: return (function (a) { var prev = this._super, result; this._super = superProto[superFnName]; result = thisFn.apply(this, arguments, a); this._super = prev; return result; });
            case 2: return (function (a, b) { var prev = this._super, result; this._super = superProto[superFnName]; result = thisFn.apply(this, arguments, a, b); this._super = prev; return result; });
            case 3: return (function (a, b, c) { var prev = this._super, result; this._super = superProto[superFnName]; result = thisFn.apply(this, arguments, a, b, c); this._super = prev; return result; });
            case 4: return (function (a, b, c, d) { var prev = this._super, result; this._super = superProto[superFnName]; result = thisFn.apply(this, arguments, a, b, c, d); this._super = prev; return result; });
        }

        eval("evalResult = (function (" + _getArgList(length) + ") { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; })");
        return evalResult;
    }

    /**
     * Creates the constructor function with the length of prototype.constructor.
     *
     * @private
     * @param {String} name
     * @param {Object} prototype
     * @param {Function} SuperClass
     * @return {Function}
     */
    function _createClassFunction(name, prototype, SuperClass) { /*jshint evil: true */
        var length = prototype.constructor.length,
            evalResult;

        // Shortcuts for common use-cases because eval is slower in some browsers
        // name will always be "AnonymousClass" when not in dev-mode
        if (name === "AnonymousClass") {
            switch (length) {
                case 0: return (function AnonymousClass() { _initClass.call(this, prototype, SuperClass, arguments); });
                // a, b, c, d are applied as well so code-minimizer don't strip them away
                case 1: return (function AnonymousClass(a) { _initClass.call(this, prototype, SuperClass, arguments, a); });
                case 2: return (function AnonymousClass(a, b) { _initClass.call(this, prototype, SuperClass, arguments, a, b); });
                case 3: return (function AnonymousClass(a, b, c) { _initClass.call(this, prototype, SuperClass, arguments, a, b, c); });
                case 4: return (function AnonymousClass(a, b, c, d) { _initClass.call(this, prototype, SuperClass, arguments, a, b, c, d); });
            }
        }

        eval("evalResult = (function " + name + "(" + _getArgList(length) + ") { _initClass.call(this, prototype, SuperClass, arguments); })");
        return evalResult;
    }

    /**
     * Will be called for every instance. Ensures that the superior constructor is called.
     * This function is performance critical.
     *
     * @private
     * @param {Object} prototype
     * @param {Function} SuperClass
     * @param {Arguments} args
     */
    function _initClass(prototype, SuperClass, args) { /*jshint validthis: true */
        var prev = this._super,
            superCalled = false;

        if (SuperClass !== Class) {
            this._super = function () {
                superCalled = true;
                SuperClass.apply(this, arguments);
                return this;
            };
        }
        if (prototype.hasOwnProperty("constructor")) {
            prototype.constructor.apply(this, args);
        }
        if (SuperClass !== Class && !superCalled) {
            SuperClass.apply(this, args);
        }
        this._super = prev;
    }

    /**
     * Returns a light-weight wrapper for existing functions so they can be extended.
     *
     * @private
     * @param {Function} SuperClass
     * @return {Function}
     */
    function _getSuperClassWrapper(SuperClass) {
        function Class() {
            return SuperClass.apply(this, arguments);
        }
        _applyClassProperties(Class);
        Class.prototype = SuperClass.prototype;

        return Class;
    }

    /**
     * Creates a string for eval() that looks like an arguments-list, e.g.: a, b, c, d, e
     *
     * @private
     * @param {Number} length
     * @return {String}
     */
    function _getArgList(length) {
        var cached = argListCache[length],
            str = "",
            i;

        if (cached) {
            return cached;
        }

        for (i = 0; i < length; i++) {
            str += ("arg" + i);
            if (i < length - 1) {
                str += ", ";
            }
        }

        argListCache[length] = str;

        return str;
    }

    return Class;
}));