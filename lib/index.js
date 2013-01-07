"use strict"; // run code in ES5 strict mode

var pathUtil = require("path");

var slice = Array.prototype.slice,
    extend = getExtend(Class);

function Class(obj) {
    if (arguments.length === 1 && typeof obj === "function") {
        return getSuperClassWrapper(obj);
    }
    return extend.apply(null, arguments);
}
Class.dev = true;

function getExtend(SuperClass) {
    return function extend(obj) {
        var name = "AnonymousClass",
            prototype = objCreate(SuperClass.prototype),
            sources,
            constructors,
            NewClass;

        function init() {
            var prev = this._super,
                superCalled = false,
                i;

            if (SuperClass !== Class) {
                this._super = function () {
                    superCalled = true;
                    SuperClass.apply(this, arguments);
                };
            }
            for (i = 0; i < constructors.length; i++) {
                constructors[i].apply(this, arguments);
            }
            if (SuperClass !== Class && !superCalled) {
                SuperClass.apply(this, arguments);
            }
            this.constructor = NewClass;
            this._super = prev;
        }

        if (typeof obj === "string") {
            sources = slice.call(arguments, 1);
            if (Class.dev) {
                name = sanitizeName(obj);
            }
        } else {
            sources = slice.call(arguments, 0);
        }

        applyProperties(sources, prototype);
        constructors = collectConstructors(sources);

        NewClass = getNewClass(name, prototype.constructor.length, init);
        NewClass.extend = getExtend(NewClass);
        NewClass.prototype = prototype;

        return NewClass;
    };
}

function collectConstructors(sources) {
    var constructors = [],
        constructor,
        j = 0,
        i,
        source;

    for (i = 0; i < sources.length; i++) {
        source = sources[i];
        if (typeof source === "function") {
            constructors[j++] = source;
        } else if (source.hasOwnProperty("constructor") && typeof source.constructor === "function") {
            constructors[j++] = source.constructor;
        }
    }

    return constructors;
}

function applyProperties(sources, target) {
    var i,
        source,
        key,
        value,
        superFn;

    for (i = 0; i < sources.length; i++) {
        source = sources[i];
        if (!source || (typeof source !== "object" && typeof source !== "function")) {
            throw new TypeError("(alamid-class) Cannot apply properties of mixin " + source);
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
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 * @param {Object} o
 * @return {F}
 */
function objCreate(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

function getMethodWrapper(thisFn, superFn) {
    var length = thisFn.length;

    switch(length) {
        case 0: return (function () { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 1: return (function (a) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 2: return (function (a, b) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
        case 3: return (function (a, b, c) { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; });
    }

    return eval("(function (" + getArgList(length) + ") { var prev = this._super, result; this._super = superFn; result = thisFn.apply(this, arguments); this._super = prev; return result; })");
}

function getNewClass(name, length, init) {
    if (name === "AnonymousClass") {
        switch(length) {
            case 0: return (function AnonymousClass() { init.apply(this, arguments); });
            case 1: return (function AnonymousClass(a) { init.apply(this, arguments); });
            case 2: return (function AnonymousClass(a, b) { init.apply(this, arguments); });
            case 3: return (function AnonymousClass(a, b, c) { init.apply(this, arguments); });
        }
    }
    return eval("(function " + name + "(" + getArgList(length) + ") { init.apply(this, arguments); })");
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
    var str = "",
        i;

    for (i = 0; i < length; i++) {
        str += ("arg" + i);
        if (i < length - 1) {
            str += ", ";
        }
    }

    return str;
}

function sanitizeName(path) {
    var name = pathUtil.basename(path);

    name = name.replace(/\W.*/, "");

    return name;
}


module.exports = Class;