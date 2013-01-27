"use strict"; // run code in ES5 strict mode

var slice = Array.prototype.slice,
    argListCache = [],
    extend = getExtend(Class);

function Class(arg1) {
    if (arguments.length === 1 && typeof arg1 === "function") {
        return getSuperClassWrapper(arg1);
    }
    return extend.apply(null, arguments);
}
Class.dev = false;

function getExtend(SuperClass) {
    return function extend(name, source1, source2, source3) {
        var prototype = createObj(SuperClass.prototype),
            sources,
            NewClass;

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

        applyProperties(sources, prototype);

        NewClass = getNewClass(name, prototype.constructor.length, prototype, SuperClass);

        NewClass.extend = getExtend(NewClass);
        NewClass.mixin = mixin;
        NewClass.prototype = prototype;

        return NewClass;
    };
}

function mixin(obj) { /*jshint forin: false, validthis: true */
    var key,
        prototype = this.prototype;

    for (key in prototype) {
        obj[key] = prototype[key];
    }

    return this;
}

function applyProperties(sources, target) { /*jshint forin: false */
    var i,
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
            superFn = target[key];
            if (key !== "constructor" && typeof value === "function" && typeof superFn === "function") {
                value = getMethodWrapper(value, superFn);
            }
            target[key] = value;
        }
    }
}

/**
 *
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 * @param {Object} o
 * @return {F}
 */
function createObj(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

function getMethodWrapper(thisFn, superFn) { /*jshint evil: true */
    var length = thisFn.length;

    switch (length) {
        case 0: return (function () { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 1: return (function (a) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 2: return (function (a, b) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 3: return (function (a, b, c) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 4: return (function (a, b, c, d) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
    }

    return eval("(function (" + getArgList(length) + ") { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; })");
}

function getNewClass(name, length, prototype, SuperClass) { /*jshint evil: true */
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

function getSuperClassWrapper(SuperClass) {
    function Class() {
        return SuperClass.apply(this, arguments);
    }
    Class.prototype = SuperClass.prototype;
    Class.extend = getExtend(SuperClass);
    return Class;
}

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