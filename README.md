alamid-class
=====
**Easy prototypal inheritance in JavaScript**.

alamid-class is a lightweight library (~1.2 kb compressed and gzipped) that allows you to write classes in JavaScript intuitively. It embraces the dynamic and prototypal nature of JavaScript instead of pretending to be a compiled language like Java.

[![Build Status](https://secure.travis-ci.org/peerigon/alamid-class.png?branch=master)](https://travis-ci.org/peerigon/alamid-class)
[![Dependency Status](https://david-dm.org/peerigon/alamid-class/status.png)](https://david-dm.org/peerigon/alamid-class)

This library is not intended to obscure prototypal inheritance. There are [some caveats](https://github.com/peerigon/alamid-class#Notes) you should know about if you're new to it.

<br />

Installation
------------

`npm install alamid-class`

<br />

Quick Start
--------

### [Syntax](https://github.com/peerigon/alamid-class/blob/master/examples/basic.js)

The syntax is easy to grasp and expressive. A simple class looks like this:

```javascript
var Class = require("alamid-class");

var Cat = new Class({
    name: "Jimmy",
    age: 3,
    constructor: function (name, age) {
        this.name = name || this.name;
        this.age = age || this.age;
    },
    strollAround: function () {
        console.log("MEEEOOOWWW!!! Need food! Now!");
    }
});
```

```javascript
var cat = new Cat();
console.log(cat instanceof Cat); // true
console.log(cat.name); // "Jimmy"
console.log(cat.hasOwnProperty("strollAround")); // false because it is inherited by the prototype
```

### [Inheritance](https://github.com/peerigon/alamid-class/blob/master/examples/inheritance.js)

Now you can extend that class with:

```javascript
var Octocat = Cat.extend({
    mood: "sad",
    constructor: function () {
        this._super("Octocat", 5);
    },
    strollAround: function () {
        console.log("Seeking parents ... but in the meantime:");
        this._super();
    }
});
```

The special function `this._super()` inside a method provides access to the overridden method. In this case it's simply a shortcut for `Cat.prototype.strollAround.call(this)`

```javascript
var octocat = new Octocat();
console.log(octocat instanceof Cat); // true
console.log(octocat.name); // "Octocat"
console.log(octocat.mood); // "sad"
octocat.strollAround(); // "Seeking parents ... but in the meantime: 
                        // MEEEOOOWWW!!! Need food! Now!"
```

You can also inherit from existing prototypes just like that:

```javascript
var MyEventEmitter = Class(EventEmitter).extend({
    mute: false,
    emit: function () {
        if (this.mute) return;
        return this._super.apply(this, arguments);
    }
});
```

Additionally all instances provide a [read-only reference](https://github.com/peerigon/alamid-class#Read-only property) called `Class` on the function that created the instance:

```javascript
console.log(cat.Class); // Cat
console.log(octocat.Class); // Octocat
```

### [Mixins](https://github.com/peerigon/alamid-class/blob/master/examples/mixins.js)

Mixins are always part of a flexible and powerful class system. In alamid-class a mixin is just an object that is merged into the prototype.

```javascript
var Orphan = {
    seekParents: function () {
        console.log("No parents found. " + this.name + " is feeling " + this.mood + " now...");
    }
};
```

```javascript
var Octocat = Cat.extend(Orphan, {
    mood: "sad",
    constructor: function () {
        this._super("Octocat", 5);
    }
});

var octocat = new Octocat();
octocat.seekParents(); // "No parents found. Octocat is feeling sad now..."
```

If two mixins define a property with the same name, the latter mixin will simply override the former. This especially applies to the `constructor`. Keep in mind that in this case you need to invoke the overridden method manually.

Furthermore every function can also be a mixin again:

```javascript
var Octocat = Cat.extend(EventEmitter, Orphan, {
    mood: "sad",
    constructor: function () {
        this._super("Octocat", 5);
    }
});

var octocat = new Octocat();
octocat.emit("seekingParents");
```

Passing `EventEmitter` for instance is just a shortcut for passing `EventEmitter.prototype`.

A class itself can also augment existing objects:

```javascript
var someObj = {};
Octocat.mixin(someObj);
someObj.seekParents(); // "No parents found. Jimmy is feeling sad now..."
```

Please note, that you can't mix in a constructor. If your mixin has a constructor you need to invoke it manually on the object, like `Octocat.call(someObj);`

### [Dev-mode](https://github.com/peerigon/alamid-class/blob/master/examples/dev-mode.js)

For a nicer debugging experience and better stack traces you can give your classes names. Take a look at the difference:

![Dev-mode](https://github.com/peerigon/alamid-class/raw/master/examples/dev-mode.png)

But in order to set the function's name alamid-class needs to use eval(). Since eval() is slow and you usually don't need class names in production, this feature is only available when `Class.dev = true`. In production mode, names are simply ignored.

You can set a name like this:

```javascript
var Cat = new Class("Cat", {...});

var Octocat = Cat.extend("Octocat", {...});
```

<br />

API
-----

```javascript
var Class = require("alamid-class");
```

### new Class(name?, proto1, proto2, ...): Class

Creates a new function that will use the given prototypes.

- *name (optional)*: <br/>
Specifies the name of the returned function. Works only in dev-mode. Defaults to `"AnonymousClass"`

- *proto1, proto2, ...*: <br/>
Multiple prototypes that will be merged into one prototype (while the latter prototype overrides the former). If the given prototype is typeof function, its prototype is used instead. So, passing `func` or `func.prototype` is the same.

### class.extend(name?, proto1, proto2, ...): Class

Creates a new function that will inherit from `class` and implement the given prototypes.

### class.mixin(obj): Class

Copies all properties of `class.prototype` to the given target. Returns `class`.

- *obj*: <br/>
The target object that receives all properties.

### Class.dev

Boolean variable that switches alamid-class to [dev-mode](https://github.com/peerigon/alamid-class/#Dev-mode). Defaults to false. Checkout the [example](https://github.com/peerigon/alamid-class/blob/master/examples/dev-mode.js).

<br />

Notes
-----

### Object and arrays as properties
Since object and arrays are copied by reference in JavaScript all instances will share the **same object as property**. Imagine this class:

```javascript
var MyClass = new Class({
    myObj: {}
});

var a = new MyClass();
var b = new MyClass();
console.log(a.myObj === b.myObj); // true
```

This is a common misconception when using prototypal inheritance. So, if you want an object for each instance you should create it within the constructor like this:

```javascript
var MyClass = new Class({
    myObj: null,
    constructor: function () {
        this.myObj = {};
    }
});

var a = new MyClass();
var b = new MyClass();
console.log(a.myObj === b.myObj); // false
```

### How does this._super work?

While this is basically accomplished with [John Resig's trick](http://ejohn.org/blog/simple-javascript-inheritance/), it has been tweaked so the function's `length`-attribute isn't modified.

### Asynchronous calls of this._super

There is one problem with Resig's technique: If the call on this._super() is asynchronous, this._super may point to another function. So, instead of this:

```javascript
    somethingAsync: function () {
        var self = this;

        setTimeout(function () {
            self._super(); // this might point to another function than the overridden
        }, 0);
    }
```

you should do: 

```javascript
    somethingAsync: function () {
        var self = this,
            super = this._super;

        setTimeout(function () {
            super.call(self);
        }, 0);
    }
```

### Read-only property `Class`
Every instance provides a read-only reference called `Class` to the function that created the instance. Some could argue that alamid-class should use the built-in `constructor`-property for that. The problem is, that `constructor` always points to the topmost function in the prototype-chain:

```javascript
function A() {}
function B() {}
B.prototype = Object.create(A.prototype);

console.log(new B().constructor === A); // true
console.log(new B().constructor === B); // false
```

That's the reason why alamid-class introduces a new read-only reference to the function that has been called by `new`.

### About alamid

alamid-class has been extracted as standalone library from the application framework [alamid](https://github.com/peerigon/alamid).

<br />

License
-------

MIT
