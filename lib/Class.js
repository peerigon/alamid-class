"use strict"; // run code in ES5 strict mode

var slice = Array.prototype.slice,
    argListCache = [],
    extend = getExtend(Class);

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
 * @return {Class}
 * @constructor
 */
function Class(obj) {
    if (arguments.length === 1 && typeof obj === "function") {
        return getSuperClassWrapper(obj);
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
 * @param SuperClass
 * @return {Function}
 */
function getExtend(SuperClass) {
    return function extend(name, source1, source2, source3) {
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

        prototype = createPrototypeOf(SuperClass, sources);
        NewClass = createClassFunction(name, prototype, SuperClass);
        applyClassProperties(NewClass, SuperClass);
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
 * @throws TypeError
 * @return {Object}
 */
function createPrototypeOf(SuperClass, sources) { /*jshint forin: false */
    var prototype = createObj(SuperClass.prototype),
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
                value = getMethodWrapper(value, superFn);
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
 * @param {Function} SuperClass
 */
function applyClassProperties(Class, SuperClass) {
    Class.extend = getExtend(Class);
    Class.mixin = mixin;
}

/**
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 * @private
 * @param {Object} o
 * @return {Object}
 */
function createObj(o) {
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
 * @param {Function} superFn
 * @return {Function}
 */
function getMethodWrapper(thisFn, superFn) { /*jshint evil: true */
    var length = thisFn.length;

    // Shortcuts for common use-cases because eval is slower in some browsers
    switch (length) {
        case 0: return (function () { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 1: return (function (a) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 2: return (function (a, b) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 3: return (function (a, b, c) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 4: return (function (a, b, c, d) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
    }

    return eval("(function (" + getArgList(length) + ") { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; })");
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
function createClassFunction(name, prototype, SuperClass) { /*jshint evil: true */
    var length = prototype.constructor.length;

    // Shortcuts for common use-cases because eval is slower in some browsers
    // name will always be "AnonymousClass" when not in dev-mode
    if (name === "AnonymousClass") {
        switch (length) {
            case 0: return (function AnonymousClass() { initClass.call(this, prototype, AnonymousClass, SuperClass, arguments); });
            case 1: return (function AnonymousClass(a) { initClass.call(this, prototype, AnonymousClass, SuperClass, arguments); });
            case 2: return (function AnonymousClass(a, b) { initClass.call(this, prototype, AnonymousClass, SuperClass, arguments); });
            case 3: return (function AnonymousClass(a, b, c) { initClass.call(this, prototype, AnonymousClass, SuperClass, arguments); });
            case 4: return (function AnonymousClass(a, b, c, d) { initClass.call(this, prototype, AnonymousClass, SuperClass, arguments); });
        }
    }

    return eval("(function " + name + "(" + getArgList(length) + ") { initClass.call(this, prototype, " + name + ", SuperClass, arguments); })");
}

/**
 * Will be called for every instance. Ensures that the superior constructor is called.
 * This function is performance critical.
 *
 * @private
 * @param {Object} prototype
 * @param {Function} NewClass
 * @param {Function} SuperClass
 * @param {Arguments} args
 */
function initClass(prototype, NewClass, SuperClass, args) { /*jshint validthis: true */
    var prev = this._super,
        superCalled = false;

    if (this.hasOwnProperty("constructor") === false) {
        this.constructor = NewClass;
    }
    if (SuperClass !== Class) {
        this._super = function () {
            superCalled = true;
            SuperClass.apply(this, arguments);
            return this;
        };
    }
    prototype.constructor.apply(this, args);
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
function getSuperClassWrapper(SuperClass) {
    function Class() {
        return SuperClass.apply(this, arguments);
    }
    applyClassProperties(Class, SuperClass);
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
function getArgList(length) {
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