var chai = require("chai"),
    sinon = require("sinon"),
    expect = chai.expect,
    Class = require("../lib/Class.js"),
    tests = require("alamid-interface-tests");

var fnNameSupport = ("name" in Function.prototype);

chai.Assertion.includeStack = true;
chai.use(require("sinon-chai"));

describe("Class", function () {

    describe("name", function () {
        var _it = it,
            MyClass;

        if (!fnNameSupport) {
            _it = it.skip;
        }

        _it("should be 'AnonymousClass' when passing no class name", function () {
            MyClass = new Class();

            expect(MyClass).to.be.a("function");
            expect(MyClass.name).to.equal("AnonymousClass");
        });

        _it("should be 'MyClass' if specified (in dev mode)", function () {
            Class.dev = true;

            MyClass = new Class("MyClass");

            expect(MyClass).to.be.a("function");
            expect(MyClass.name).to.equal("MyClass");

            Class.dev = false;
        });

        _it("should always be 'AnonymousClass' when not in dev mode", function () {
            expect(new Class("MyClass", {}).name).to.equal("AnonymousClass");
        });
    });

    describe("prototype", function () {
        var MyClass,
            myClass;

        it("should accept several objects as prototypes", function () {
            MyClass = new Class(
                {
                    foo: "foo",
                    getFoo: function () { return this.foo; }
                },
                {
                    bar: "bar",
                    getBar: function () { return this.bar; }
                }
            );

            myClass = new MyClass();

            expect(myClass.foo).to.equal("foo");
            expect(myClass.bar).to.equal("bar");
            expect(myClass.getFoo()).to.equal("foo");
            expect(myClass.getBar()).to.equal("bar");
        });

        it("should also accept functions as prototypes", function () {
            function MyMixin() {}
            MyMixin.prototype.foo = "foo";
            MyMixin.prototype.getFoo = function () {
                return this.foo;
            };
            MyMixin.hello = "hello";

            MyClass = new Class(MyMixin, {
                bar: "bar"
            });
            myClass = new MyClass();

            expect(myClass.foo).to.equal("foo");
            expect(myClass.bar).to.equal("bar");
            expect(myClass.getFoo()).to.equal("foo");
            expect(myClass.hello).to.equal(undefined);
        });

        it("should accept other classes as prototypes", function () {
            var MyMixin = new Class({
                    foo: "foo",
                    getFoo: function () {
                        return this.foo;
                    }
                });

            MyClass = new Class(MyMixin, {
                bar: "bar"
            });

            myClass = new MyClass();

            expect(myClass.foo).to.equal("foo");
            expect(myClass.bar).to.equal("bar");
            expect(myClass.getFoo()).to.equal("foo");
        });

        it("should throw an exception when passing non-objects", function () {
            var instance;

            expect(function () {
                instance = new Class(undefined);
            }).to.throw(/Cannot apply properties of undefined/);
            expect(function () {
                instance = new Class(2);
            }).to.throw(/Cannot apply properties of 2/);
        });

        it("should have a read-only reference called 'Class' to the Class-function", function () {
            MyClass = new Class({});
            myClass = new MyClass();

            expect(myClass.Class).to.equal(MyClass);

            MyClass = new Class({
                Class: "some other value"
            });
            myClass = new MyClass();

            expect(myClass.Class).to.equal(MyClass);
        });
    });

    describe("constructors", function () {
        var MyClass,
            myClass,
            constructor;

        it("should be possible to define a constructor", function () {
            MyClass = new Class({
                foo: null,
                constructor: constructor = sinon.spy(function (foo) {
                    this.foo = foo;
                })
            });
            myClass = new MyClass("foo");

            expect(myClass.foo).to.equal("foo");
            expect(constructor).to.have.been.called.once;
        });

        it("should not be a problem to have a constructor with several arguments", function () {
            MyClass = new Class({
                constructor: constructor = sinon.spy()
            });
            myClass = new MyClass("foo", "bar", "baz", "a", "b", "c");

            expect(constructor).to.have.been.calledWith("foo", "bar", "baz", "a", "b", "c");
            expect(constructor).to.have.been.called.once;
        });

        it("should return a function with the constructor's length attribute", function () {
            MyClass = new Class({
                constructor: function (foo, bar) {}
            });

            expect(MyClass.length).to.equal(2);
        });

        it("should execute only the last specified constructor", function () {
            var constructor1,
                constructor2,
                constructor3,
                MyMixin = new Class({
                    constructor: constructor1 = sinon.spy()
                });

            MyClass = new Class(MyMixin,
                {
                    constructor: constructor2 = sinon.spy()
                },
                {
                    constructor: constructor3 = sinon.spy()
                }
            );

            myClass = new MyClass();
            expect(constructor1).to.not.have.been.called;
            expect(constructor2).to.not.have.been.called;
            expect(constructor3).to.have.been.called.once;
        });

        tests.run("constructor", new Class({}));

    });

    describe("inheritance", function () {
        var MySuperClass,
            superConstructor,
            MyClass,
            constructor,
            MySubClass,
            subConstructor,
            mySubClass;

        it("should return a function which provides the possibility to inherit from this function", function () {
            MyClass = new Class({
                foo: function () {}
            });
            MySubClass = MyClass.extend({
                bar: function () {}
            });
            mySubClass = new MySubClass();

            expect(mySubClass.foo).to.equal(MyClass.prototype.foo);
            expect(mySubClass.bar).to.equal(MySubClass.prototype.bar);
        });

        it("should call the super constructor automatically if it hasn't been called", function () {
            MySuperClass = new Class("MySuperClass", {
                constructor: superConstructor = sinon.spy()
            });
            MyClass = MySuperClass.extend("MyClass", {
                constructor: constructor = sinon.spy()
            });
            MySubClass = MyClass.extend("MySubClass", {
                constructor: subConstructor = sinon.spy()
            });

            mySubClass = new MySubClass("foo", "bar");

            expect(subConstructor).to.have.been.calledWith("foo", "bar");
            expect(subConstructor).to.have.been.called.once;
            expect(constructor).to.have.been.calledWith("foo", "bar");
            expect(constructor).to.have.been.called.once;
            expect(superConstructor).to.have.been.calledWith("foo", "bar");
            expect(superConstructor).to.have.been.called.once;
        });

        it("should call the super constructor automatically if the child class has no constructor", function () {
            MyClass = new Class({
                constructor: constructor = sinon.spy()
            });
            MySubClass = MyClass.extend({});
            mySubClass = new MySubClass("foo", "bar");

            expect(constructor).to.have.been.calledWith("foo", "bar");
            expect(constructor).to.have.been.called.once;
        });

        it("should be possible to call the overridden method via this._super()", function () {
            MyClass = new Class({
                foo: null,
                constructor: function () {
                    this.foo = arguments[0];
                },
                moo: function () {
                    return  arguments[0] + "Moo";
                }
            });
            MySubClass = MyClass.extend({
                bar: null,
                constructor: function () {
                    this.bar =  arguments[1];
                    this._super(arguments[0].toUpperCase());
                },
                moo: function () {
                    return this._super(arguments[0]) + "Moo";
                }
            });

            mySubClass = new MySubClass("foo", "bar");

            expect(mySubClass.foo).to.equal("FOO");
            expect(mySubClass.bar).to.equal("bar");
            expect(mySubClass.moo("The cow says: ")).to.equal("The cow says: MooMoo");
        });

        it("should execute the superior method of the mixin when the mixin calls this._super()", function () {
            var superMixinFoo,
                superFoo,
                MySuperMixin,
                MyMixin;

            MySuperMixin = new Class({
                foo: superMixinFoo = sinon.spy()
            });
            MyMixin = MySuperMixin.extend({
                foo: function () {
                    this._super();
                }
            });
            MySuperClass = new Class({
                foo: superFoo = sinon.spy()
            });

            MyClass = MySuperClass.extend(MyMixin);
            myClass = new MyClass();

            myClass.foo();

            expect(superMixinFoo).to.have.been.called.once;
            expect(superFoo).to.not.have.been.called;
        });

        it("should be possible to exchange the overridden method on runtime", function () {
            MyClass = new Class({
                foo: function () {
                    throw new Error("This function should not be called");
                }
            });
            MySubClass = MyClass.extend({
                foo: function () {
                    this._super();
                }
            });
            mySubClass = new MySubClass();

            MyClass.prototype.foo = function () {};

            expect(function () {
                mySubClass.foo();
            }).to.not.throw();
        });

        it("should return this when calling this._super() within a constructor", function () {
            MyClass = new Class({});
            MySubClass = MyClass.extend({
                constructor: function () {
                    expect(this._super()).to.equal(this);
                }
            });

            mySubClass = new MySubClass();
        });

        it("should not alter the length-attribute of overridden methods", function () {
            MyClass = new Class({
                foo: function () {}
            });
            MySubClass = MyClass.extend({
                foo: function (a, b, c) {}
            });

            mySubClass = new MySubClass();

            expect(mySubClass.foo.length).to.equal(3);
        });

        it("should be possible to extend existing functions", function () {
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

            expect(myClass.foo).to.equal("foo");
            expect(myClass.bar).to.equal("bar");
            expect(myClass.getFoo()).to.equal("foo");
            expect(myClass.getBar()).to.equal("bar");
        });

        it("should not influence the behaviour of the instanceof operator", function () {
            MyClass = new Class(MySuperClass).extend({});
            MySubClass = MyClass.extend({});
            mySubClass = new MySubClass();

            function MySuperClass() {}

            expect(mySubClass instanceof MySubClass).to.equal(true);
            expect(mySubClass instanceof MyClass).to.equal(true);
            expect(mySubClass instanceof MySuperClass).to.equal(true);
            expect(MySubClass instanceof Function).to.equal(true);
        });

        it("should apply the ChildClass as read-only 'Class'-reference", function () {
            MyClass = new Class({});
            MySubClass = MyClass.extend({
                Class: "some other value"
            });
            mySubClass = new MySubClass();

            expect(mySubClass.Class).to.equal(MySubClass);
        });

    });

    describe("mixins", function () {
        var MyClass,
            someObj,
            constructor;

        it("should be possible to mixin a Class into an existing object", function () {
            MyClass = new Class({
                foo: function () {
                    this.foo = "foo";
                }
            });
            someObj = {
                getFoo: function () {
                    return this.foo;
                }
            };

            MyClass.mixin(someObj);

            expect(someObj.foo).to.be.a("function");

            someObj.foo();

            expect(someObj.getFoo()).to.equal("foo");
        });

        it("should overwrite existing keys", function () {
            MyClass = new Class({
                foo: "FOO"
            });
            someObj = {
                foo: "foo"
            };

            MyClass.mixin(someObj);

            expect(someObj.foo).to.equal("FOO");
        });

        it("should be chainable", function () {
            var MyClass = new Class({});

            expect(MyClass.mixin({})).to.equal(MyClass);
        });

        it("should augment the function object, not the function's prototype", function () {
            MyClass = new Class({
                foo: "FOO"
            });

            function SomeFunc() {}

            MyClass.mixin(SomeFunc);

            expect(SomeFunc.foo).to.equal("FOO");
        });

        it("should not call the constructor on the given object", function () {
            MyClass = new Class({
                constructor: constructor = sinon.spy()
            });

            MyClass.mixin({});

            expect(constructor).to.not.have.been.called;
        });

        it("should also mixin all inherited properties", function () {
            MySuperClass = new Class({
                a: "a"
            });

            MyClass = MySuperClass.extend({});

            someObj = {};

            MyClass.mixin(someObj);

            expect(someObj.a).to.equal("a");
        });

        it("should also be possible to mixin foreign functions", function () {
            var someObj = {};

            function A() {}
            A.prototype.a = "a";
            function B() {}
            B.prototype = new A();
            B.prototype.b = "b";

            Class(B).mixin(someObj);
            expect(someObj.a).to.equal("a");
            expect(someObj.b).to.equal("b");
        });

    });

    describe("plugins", function () {
        var MySuperClass,
            superConstructor,
            MyClass,
            constructor,
            MySubClass,
            subConstructor,
            mySubClass,
            plugin;

        tests.run("use", new Class({}));

        it("should be possible to override every method of that class", function () {
            var myClassConstructorCalled = 0,
                pluginConstructorCalled = 0,
                myClassMethodCalled = 0,
                pluginMethodCalled = 0,
                MyClass = new Class({
                    constructor: function () {
                        myClassConstructorCalled++;
                    },
                    method: function () {
                        myClassMethodCalled++;
                    }
                }),
                myClass;

            MyClass.use(function plugin(Class) {
                var constructor = MyClass.prototype.constructor,
                    method = MyClass.prototype.method;

                Class.prototype.constructor = function () {
                    pluginConstructorCalled++;
                    constructor.call(this);
                };
                Class.prototype.method = function () {
                    pluginMethodCalled++;
                    method.call(this);
                };
            });
            myClass = new MyClass();
            myClass.method();

            expect(myClassConstructorCalled).to.equal(1);
            expect(pluginConstructorCalled).to.equal(1);
            expect(myClassMethodCalled).to.equal(1);
            expect(pluginMethodCalled).to.equal(1);
        });

        it("should be possible to override any constructor in the inheritance chain", function () {
            var called = [];

            MySuperClass = new Class("MySuperClass", {
                constructor: function () {
                    called.push(6);
                }
            });

            MyClass = MySuperClass.extend("MyClass", {}); // MyClass has no constructor, this should be no problem

            MySubClass = MyClass.extend("MySubClass", {
                constructor: function () {
                    called.push(2);
                    this._super();
                }
            });

            MySuperClass.use(function (Class) {
                var constructor = Class.prototype.constructor;

                Class.prototype.constructor = function () {
                    called.push(5);
                    constructor.call(this);
                };
            });

            // Second plugin
            MySuperClass.use(function (Class) {
                var constructor = Class.prototype.constructor;

                Class.prototype.constructor = function () {
                    called.push(4);
                    constructor.call(this);
                };
            });

            MyClass.use(function (Class) {
                var constructor = Class.prototype.constructor;

                Class.prototype.constructor = function () {
                    called.push(3);
                    constructor.call(this);
                };
            });

            MySubClass.use(function (Class) {
                var constructor = Class.prototype.constructor;

                Class.prototype.constructor = function () {
                    called.push(1);
                    constructor.call(this);
                };
            });

            mySubClass = new MySubClass();

            expect(called).to.eql([1, 2, 3, 4, 5, 6]);
        });

        it("should be chainable", function () {
            MyClass = new Class({});

            function plugin() {}

            expect(MyClass.use(plugin)).to.equal(MyClass);
        });

    });
});