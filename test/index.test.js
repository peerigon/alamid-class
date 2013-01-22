"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    Class = require("../");

var fnNameSupport = typeof Function.prototype.name === "string";

function checkFor(Error) {
    return function (e) {
        expect(e).to.be.an(Error);
    };
}

describe("Class", function () {
    describe("class names", function () {
        it("should return a function named 'AnonymousClass' when passing no class name", function () {
            var MyClass = new Class();
            expect(MyClass).to.be.a(Function);
            if (fnNameSupport) {
                expect(MyClass.name).to.be("AnonymousClass");
            }
        });
        it("should return a function named 'MyClass' when passing 'MyClass' as class name (in dev mode)", function () {
            var MyClass;

            Class.dev = true;
            MyClass = new Class("MyClass");
            expect(MyClass).to.be.a(Function);
            if (fnNameSupport) {
                expect(MyClass.name).to.be("MyClass");
            }
            Class.dev = false;
        });
        it("should return a function named 'AnonymousClass' in any case when not in dev mode", function () {
            if (fnNameSupport) {
                expect(new Class("MyClass", {}).name).to.be("AnonymousClass");
            }
        });
    });
    describe("mixins", function () {
        it("should accept several objects as mixins", function () {
            var MyClass = new Class({
                    foo: "foo",
                    constructor: function () {
                        this.constructorOrder = "1";
                    },
                    getFoo: function () { return this.foo; }
                }, {
                    bar: "bar",
                    getBar: function () { return this.bar; },
                    constructor: function () {
                        this.constructorOrder += "2";
                    }
                }),
                myClass = new MyClass();

            expect(myClass.foo).to.be("foo");
            expect(myClass.bar).to.be("bar");
            expect(myClass.constructorOrder).to.be("12");
            expect(myClass.getFoo()).to.be("foo");
            expect(myClass.getBar()).to.be("bar");
        });
        it("should also accept functions as mixin", function () {
            var MyClass,
                myClass;

            function MyMixin() {
                this.constructorOrder = "1";
            }
            MyMixin.prototype.foo = "foo";
            MyMixin.prototype.getFoo = function () {
                return this.foo;
            };
            MyMixin.hello = "hello";

            MyClass = new Class(MyMixin, {
                bar: "bar",
                constructor: function () {
                    this.constructorOrder += "2";
                }
            });
            myClass = new MyClass();

            expect(myClass.foo).to.be("foo");
            expect(myClass.bar).to.be("bar");
            expect(myClass.constructorOrder).to.be("12");
            expect(myClass.getFoo()).to.be("foo");
            expect(myClass.hello).to.be(undefined);
        });
        it("should accept other classes as mixin", function () {
            var MySuperMixin = new Class({
                    constructor: function () {
                        this.constructorOrder += "2";
                    },
                    getFoo: function () {
                        return this.foo;
                    }
                }),
                MyMixin = MySuperMixin.extend({
                    foo: "foo",
                    constructor: function () {
                        this.constructorOrder = "1";
                    }
                }),
                MyClass = new Class(MyMixin, {
                    bar: "bar",
                    constructor: function () {
                        this.constructorOrder += "3";
                    }
                }),
                myClass = new MyClass();

            expect(myClass.foo).to.be("foo");
            expect(myClass.bar).to.be("bar");
            expect(myClass.constructorOrder).to.be("123");
            expect(myClass.getFoo()).to.be("foo");
        });
        it("should execute all constructors", function () {
            var MyMixin = new Class({
                    constructor: function () {
                        this.foo = "foo";
                    }
                }),
                MyClass = new Class(MyMixin, {
                    constructor: function () {
                        this.bar = "bar";
                    }
                }),
                myClass = new MyClass();

            expect(myClass.foo).to.be("foo");
            expect(myClass.bar).to.be("bar");
        });
        it("should throw an exception when passing non-objects", function () {
            var instance;

            expect(function () {
                instance = new Class(undefined);
            }).to.throwException(/Cannot apply properties of undefined/);
            expect(function () {
                instance = new Class(2);
            }).to.throwException(/Cannot apply properties of 2/);
        });
    });
    describe("constructors", function () {
        it("should be possible to define a constructor", function () {
            var MyClass = new Class({
                    foo: null,
                    constructor: function (foo) {
                        this.foo = foo;
                    }
                }),
                myClass = new MyClass("foo");

            expect(myClass.foo).to.be("foo");
        });
        it("should return a function with the constructor's length attribute", function () {
            var MyClass = new Class({
                    constructor: function (foo, bar) {}
                });

            expect(MyClass.length).to.be(2);
        });
    });
    describe("inheritance", function () {
        it("should return a function which provides the possibility to inherit from this function", function () {
            var MyClass = new Class({
                    foo: function () {}
                }),
                MySubClass = MyClass.extend({
                    bar: function () {}
                }),
                mySubClass = new MySubClass();

            expect(mySubClass.foo).to.be(MyClass.prototype.foo);
            expect(mySubClass.bar).to.be(MySubClass.prototype.bar);
        });
        it("should call the super constructor automatically if it hasn't been called", function () {
            var MyClass = new Class({
                    foo: null,
                    constructor: function (foo) {
                        expect(arguments.length).to.be(2);
                        this.foo = foo;
                    }
                }),
                MySubClass = MyClass.extend({
                    bar: null,
                    constructor: function (foo, bar) {
                        this.bar = bar;
                    }
                }),
                mySubClass = new MySubClass("foo", "bar");

            expect(mySubClass.foo).to.be("foo");
            expect(mySubClass.bar).to.be("bar");
        });
        it("should be possible to call the overridden method via this._super()", function () {
            var MyClass = new Class({
                    foo: null,
                    constructor: function (foo) {
                        this.foo = foo;
                    },
                    moo: function (prefix) {
                        return prefix + "Moo";
                    }
                }),
                MySubClass = MyClass.extend({
                    bar: null,
                    constructor: function (foo, bar) {
                        this.bar = bar;
                        this._super(foo.toUpperCase());
                    },
                    moo: function (prefix) {
                        return this._super(prefix) + "Moo";
                    }
                }),
                mySubClass = new MySubClass("foo", "bar");

            expect(mySubClass.foo).to.be("FOO");
            expect(mySubClass.bar).to.be("bar");
            expect(mySubClass.moo("The cow says: ")).to.be("The cow says: MooMoo");
        });
        it("should return this when calling this._super() within a constructor", function () {
            var MyClass = new Class({}),
                MySubClass = MyClass.extend({
                    constructor: function () {
                        expect(this._super()).to.be(this);
                    }
                }),
                mySubClass;

            mySubClass = new MySubClass();
        });
        it("should not alter the length-attribute of overridden methods", function () {
            var MyClass = new Class({
                    foo: function () {}
                }),
                MySubClass = MyClass.extend({
                    foo: function (a, b, c) {}
                }),
                mySubClass = new MySubClass();

            expect(mySubClass.foo.length).to.be(3);
        });
        it("should return a function with the constructor property set to the class", function () {
            var MyClass = new Class({}),
                MySubClass = MyClass.extend({}),
                mySubClass = new MySubClass();

            expect(mySubClass.constructor).to.be(MySubClass);
        });
        it("should be possible to extend existing functions", function () {
            var MyClass,
                myClass;

            function SomeOtherClass() {
                this.foo = "foo";
            }
            SomeOtherClass.prototype.getFoo = function () {
                return this.foo;
            };

            MyClass = new Class(SomeOtherClass).extend({
                bar: "bar",
                getBar: function () {
                    return this.bar;
                }
            });
            myClass = new MyClass();
            expect(myClass.foo).to.be("foo");
            expect(myClass.bar).to.be("bar");
            expect(myClass.getFoo()).to.be("foo");
            expect(myClass.getBar()).to.be("bar");
        });
        it("should not influence the behaviour of the instanceof operator", function () {
            var MyClass = new Class(MySuperClass).extend({}),
                MySubClass = MyClass.extend({}),
                mySubClass = new MySubClass();

            function MySuperClass() {}

            expect(mySubClass instanceof MySubClass).to.be(true);
            expect(mySubClass instanceof MyClass).to.be(true);
            expect(mySubClass instanceof MySuperClass).to.be(true);
            expect(MySubClass instanceof Function).to.be(true);
        });
    });
});