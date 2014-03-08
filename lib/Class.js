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
        NewClass = _createClassFunction(name, prototype.constructor.length);
        prototype.Class = NewClass;
        prototype.constructor = _createConstructorWrapper(prototype, SuperClass);
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
function mixin(obj) { /* jshint forin: false, validthis: true */
    var key,
        prototype = this.prototype;

    for (key in prototype) {
        obj[key] = prototype[key];
    }

    return this;
}

/**
 * Creates a new use()-function that can be attached to new classes.
 *
 * @returns {use}
 */
function createUseFunction() {
    /**
     * Calls the given function with the Class as first argument and the given config (optionally). Plugins can be used
     * to hook into class methods by overriding them.
     *
     * You may call this function multiple times with the same plugin, the plugin will only be applied once.
     *
     * @param {Function} plugin
     * @param {Object=} config
     * @returns {Object}
     */
    function use(plugin, config) { /* jshint validthis: true */

        if (use.plugins.indexOf(plugin) === -1) {
            plugin(this, config);
            use.plugins.push(plugin);
        }

        return this;
    }
    use.plugins = [];

    return use;
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
    Class.use = createUseFunction();
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
 * Creates a constructor wrapper which memorizes the original constructor and just proxies to _initClass.
 * The wrapper preserves the length-attribute of the original method.
 *
 * @private
 * @param {Object} prototype
 * @param {Object} SuperClass
 * @return {Function}
 */
function _createConstructorWrapper(prototype, SuperClass) { /*jshint evil: true */
    var length = prototype.constructor.length,
        constructor,
        evalResult;

    // Save constructor reference
    if (prototype.hasOwnProperty("constructor")) {
        constructor = prototype.constructor;
    } else if (SuperClass.prototype.Class !== SuperClass) {
        // If the prototype has no constructor and the SuperClass is not a alamid-class, the constructor is just the SuperClass.
        constructor = SuperClass;
    }

    // Shortcuts for common use-cases because eval is slower in some browsers
    switch (length) {
        case 0: return (function () { return _initClass.call(this, constructor, SuperClass, arguments); });
        // a, b, c, d are applied as well so code-minimizer don't strip them away
        case 1: return (function (a) { return _initClass.call(this, constructor, SuperClass, arguments, a); });
        case 2: return (function (a, b) { return _initClass.call(this, constructor, SuperClass, arguments, a, b); });
        case 3: return (function (a, b, c) { return _initClass.call(this, constructor, SuperClass, arguments, b, c); });
        case 4: return (function (a, b, c, d) { return _initClass.call(this, constructor, SuperClass, arguments, a, b, c, d); });
    }

    eval("evalResult = (function (" + _getArgList(length) + ") { return _initClass.call(this, constructor, SuperClass, arguments); })");
    return evalResult;
}

/**
 * Creates the constructor function with the given length.
 *
 * @private
 * @param {String} name
 * @param {Number} length
 * @return {Function}
 */
function _createClassFunction(name, length) { /*jshint evil: true */
    var evalResult;

    // Shortcuts for common use-cases because eval is slower in some browsers
    // name will always be "AnonymousClass" when not in dev-mode
    if (name === "AnonymousClass") {
        switch (length) {
            case 0: return (function AnonymousClass() { AnonymousClass.prototype.constructor.apply(this, arguments); });
            // a, b, c, d are applied as well so code-minimizer don't strip them away
            case 1: return (function AnonymousClass(a) { AnonymousClass.prototype.constructor.apply(this, arguments, a); });
            case 2: return (function AnonymousClass(a, b) { AnonymousClass.prototype.constructor.apply(this, arguments, a, b); });
            case 3: return (function AnonymousClass(a, b, c) { AnonymousClass.prototype.constructor.apply(this, arguments, a, b, c); });
            case 4: return (function AnonymousClass(a, b, c, d) { AnonymousClass.prototype.constructor.apply(this, arguments, a, b, c, d); });
        }
    }

    eval("evalResult = (function " + name + "(" + _getArgList(length) + ") { " + name + ".prototype.constructor.apply(this, arguments); })");
    return evalResult;
}

/**
 * Will be called for every instance. Ensures that the superior constructor is called.
 * This function is performance critical.
 *
 * @private
 * @param {Function} constructor
 * @param {Function} SuperClass
 * @param {Arguments} args
 */
function _initClass(constructor, SuperClass, args) { /*jshint validthis: true */
    var prev = this._super,
        isLastInInheritanceChain = this.hasOwnProperty("_Class_initialized") === false,
        isFirstInInheritanceChain = SuperClass === Class || SuperClass.prototype.Class !== SuperClass;

    if (isLastInInheritanceChain) {
        this._Class_initialized = false;
    }
    if (SuperClass !== Class) {
        this._super = function () {
            if (isFirstInInheritanceChain) {
                SuperClass.apply(this, arguments);
            } else {
                SuperClass.prototype.constructor.apply(this, arguments);
            }

            return this;
        };
    }

    constructor && constructor.apply(this, args);

    if (isFirstInInheritanceChain) {
        this._Class_initialized = true;
    } else if (this._Class_initialized === false) {
        this._super.apply(this, args);
    }

    if (isLastInInheritanceChain) {
        delete this._Class_initialized;
    }

    this._super = prev;

    return this;
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

module.exports = Class;