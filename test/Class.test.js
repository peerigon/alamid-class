(function (expect, Class) {
    "use strict"; // run code in ES5 strict mode

    var fnNameSupport = typeof Function.prototype.name === "string";

    function checkFor(Error) {
        return function (e) {
            expect(e).to.be.an(Error);
        };
    }

    describe("Class", function () {
        describe("name", function () {
            it("should be 'AnonymousClass' when passing no class name", function () {
                var MyClass = new Class();
                expect(MyClass).to.be.a(Function);
                if (fnNameSupport) {
                    expect(MyClass.name).to.be("AnonymousClass");
                }
            });
            it("should be 'MyClass' if specified (in dev mode)", function () {
                var MyClass;

                Class.dev = true;
                MyClass = new Class("MyClass");
                expect(MyClass).to.be.a(Function);
                if (fnNameSupport) {
                    expect(MyClass.name).to.be("MyClass");
                }
                Class.dev = false;
            });
            it("always be 'AnonymousClass' when not in dev mode", function () {
                if (fnNameSupport) {
                    expect(new Class("MyClass", {}).name).to.be("AnonymousClass");
                }
            });
        });
        describe("prototype", function () {
            it("should accept several objects as prototypes", function () {
                var called = "",
                    MyClass = new Class({
                        foo: "foo",
                        getFoo: function () { return this.foo; }
                    }, {
                        bar: "bar",
                        getBar: function () { return this.bar; }
                    }),
                    myClass = new MyClass();

                expect(myClass.foo).to.be("foo");
                expect(myClass.bar).to.be("bar");
                expect(myClass.getFoo()).to.be("foo");
                expect(myClass.getBar()).to.be("bar");
            });
            it("should also accept functions as prototypes", function () {
                var MyClass,
                    myClass;

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

                expect(myClass.foo).to.be("foo");
                expect(myClass.bar).to.be("bar");
                expect(myClass.getFoo()).to.be("foo");
                expect(myClass.hello).to.be(undefined);
            });
            it("should accept other classes as prototypes", function () {
                var MyMixin = new Class({
                        foo: "foo",
                        getFoo: function () {
                            return this.foo;
                        }
                    }),
                    MyClass = new Class(MyMixin, {
                        bar: "bar"
                    }),
                    myClass = new MyClass();

                expect(myClass.foo).to.be("foo");
                expect(myClass.bar).to.be("bar");
                expect(myClass.getFoo()).to.be("foo");
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
            it("should have a read-only reference called 'Class' to the Class-function", function () {
                var MyClass = new Class({}),
                    myClass = new MyClass();

                expect(myClass.Class).to.be(MyClass);
                MyClass = new Class({
                    Class: "some other value"
                });
                myClass = new MyClass();
                expect(myClass.Class).to.be(MyClass);
            });
        });
        describe("constructors", function () {
            it("should be possible to define a constructor", function () {
                var MyClass = new Class({
                        foo: null,
                        constructor: function (foo) {
                            this.foo = foo;
                            timesCalled++;
                        }
                    }),
                    timesCalled = 0,
                    myClass = new MyClass("foo");

                expect(myClass.foo).to.be("foo");
                expect(timesCalled).to.be(1);
            });
            it("should not be a problem to have a constructor with several arguments", function () {
                var MyClass = new Class({
                        constructor: function (foo, bar, baz, a, b, c) {
                            this.args = [foo, bar, baz, a, b, c];
                            timesCalled++;
                        }
                    }),
                    timesCalled = 0,
                    myClass = new MyClass("foo", "bar", "baz", "a", "b", "c");

                expect(myClass.args).to.eql(["foo", "bar", "baz", "a", "b", "c"]);
                expect(timesCalled).to.be(1);
            });
            it("should return a function with the constructor's length attribute", function () {
                var MyClass = new Class({
                        constructor: function (foo, bar) {}
                    });

                expect(MyClass.length).to.be(2);
            });
            it("should execute only the last specified constructor", function () {
                var called = "",
                    MyMixin = new Class({
                        constructor: function () {
                            called += "1";
                        }
                    }),
                    MyClass = new Class(MyMixin, {
                        constructor: function () {
                            called += "2";
                        }
                    }, {
                        constructor: function () {
                            called += "3";
                        }
                    }),
                    myClass = new MyClass();

                expect(called).to.be("3");
            });
            it("should expose the constructor function", function () {
                var MyClass = new Class({
                        constructor: constructor
                    });

                function constructor() {}

                expect(new MyClass().constructor).to.be(constructor);
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
                var MySuperClass = new Class("MySuperClass", {
                        constructor: function () {
                            mySuperClassArgs = arguments;
                            mySuperClassTimesCalled++;
                        }
                    }),
                    mySuperClassArgs,
                    mySuperClassTimesCalled = 0,
                    MyClass = MySuperClass.extend("MyClass", {
                        constructor: function (foo) {
                            myClassArgs = arguments;
                            myClassTimesCalled++;
                        }
                    }),
                    myClassArgs,
                    myClassTimesCalled = 0,
                    MySubClass = MyClass.extend("MySubClass", {
                        constructor: function (foo, bar) {
                            mySubClassArgs = arguments;
                            mySubClassTimesCalled++;
                        }
                    }),
                    mySubClassArgs,
                    mySubClassTimesCalled = 0,
                    mySubClass = new MySubClass("foo", "bar");

                expect(mySubClassArgs).to.eql(["foo", "bar"]);
                expect(mySubClassTimesCalled).to.be(1);
                expect(myClassArgs).to.eql(["foo", "bar"]);
                expect(myClassTimesCalled).to.be(1);
                expect(mySuperClassArgs).to.eql(["foo", "bar"]);
                expect(mySuperClassTimesCalled).to.be(1);
            });
            it("should call the super constructor automatically if the child class has no constructor", function () {
                var MyClass = new Class({
                        constructor: function () {
                            myClassArgs = arguments;
                            timesCalled++;
                        }
                    }),
                    myClassArgs,
                    timesCalled = 0,
                    MySubClass = MyClass.extend({}),
                    mySubClass = new MySubClass("foo", "bar");

                expect(myClassArgs).to.eql(["foo", "bar"]);
                expect(timesCalled).to.be(1);
            });
            it("should be possible to call the overridden method via this._super()", function () {
                var MyClass = new Class({
                        foo: null,
                        constructor: function () {
                            this.foo = arguments[0];
                        },
                        moo: function () {
                            return  arguments[0] + "Moo";
                        }
                    }),
                    MySubClass = MyClass.extend({
                        bar: null,
                        constructor: function () {
                            this.bar =  arguments[1];
                            this._super(arguments[0].toUpperCase());
                        },
                        moo: function () {
                            return this._super(arguments[0]) + "Moo";
                        }
                    }),
                    mySubClass = new MySubClass("foo", "bar");

                expect(mySubClass.foo).to.be("FOO");
                expect(mySubClass.bar).to.be("bar");
                expect(mySubClass.moo("The cow says: ")).to.be("The cow says: MooMoo");
            });
            it("should execute the superior method of the mixin when the mixin calls this._super()", function () {
                var superOfMixinCalled = false,
                    superCalled = false,
                    MySuperMixin = new Class({
                        foo: function () {
                            superOfMixinCalled = true;
                        }
                    }),
                    MyMixin = MySuperMixin.extend({
                        foo: function () {
                            this._super();
                        }
                    }),
                    MySuperClass = new Class({
                        foo: function () {
                            superCalled = true;
                        }
                    }),
                    MyClass = MySuperClass.extend(MyMixin),
                    myClass = new MyClass();

                myClass.foo();

                expect(superOfMixinCalled).to.be(true);
                expect(superCalled).to.be(false);
            });
            it("should be possible to exchange the overridden method on runtime", function () {
                var MyClass = new Class({
                        foo: function () {
                            throw new Error("This function should not be called");
                        }
                    }),
                    MySubClass = MyClass.extend({
                        foo: function () {
                            this._super();
                        }
                    }),
                    mySubClass = new MySubClass();

                MyClass.prototype.foo = function () {};
                mySubClass.foo();
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
            it("should be possible to replace a super method on runtime", function (done) {
                var MyClass = new Class({
                        test: function () {
                            throw new Error("Oh snap! This function should not be called!");
                        }
                    }),
                    MySubClass = MyClass.extend({
                        test: function () {
                            this._super();
                        }
                    }),
                    mySubClass = new MySubClass();

                MyClass.prototype.test = done;
                mySubClass.test();
            });
            it("should apply the ChildClass as read-only 'Child'-reference", function () {
                var MyClass = new Class({}),
                    MySubClass = MyClass.extend({
                        Class: "some other value"
                    }),
                    mySubClass = new MySubClass();

                expect(mySubClass.Class).to.be(MySubClass);
            });
        });
        describe("mixins", function () {
            it("should be possible to mixin a Class into an existing object", function () {
                var MyClass = new Class({
                        foo: function () {
                            this.foo = "foo";
                        }
                    }),
                    someObj = {
                        getFoo: function () {
                            return this.foo;
                        }
                    };

                MyClass.mixin(someObj);
                expect(someObj.foo).to.be.a(Function);
                someObj.foo();
                expect(someObj.getFoo()).to.be("foo");
            });
            it("should overwrite existing keys", function () {
                var MyClass = new Class({
                        foo: "FOO"
                    }),
                    someObj = {
                        foo: "foo"
                    };

                MyClass.mixin(someObj);
                expect(someObj.foo).to.be("FOO");
            });
            it("should be chainable", function () {
                var MyClass = new Class({});

                expect(MyClass.mixin({})).to.be(MyClass);
            });
            it("should augment the function object, not the function's prototype", function () {
                var MyClass = new Class({
                    foo: "FOO"
                });

                function SomeFunc() {}

                MyClass.mixin(SomeFunc);
                expect(SomeFunc.foo).to.be("FOO");
            });
            it("should not call the constructor on the given object", function () {
                var called = false,
                    MyClass = new Class({
                        constructor: function () {
                            called = true;
                        }
                    });

                MyClass.mixin({});
                expect(called).to.be(false);
            });
            it("should also mixin all inherited properties", function () {
                var MySuperClass = new Class({
                        a: "a"
                    }),
                    MyClass = MySuperClass.extend({}),
                    someObj = {};

                MyClass.mixin(someObj);
                expect(someObj.a).to.be("a");
            });
            it("should also be possible to mixin foreign functions", function () {
                var someObj = {};

                function A() {}
                A.prototype.a = "a";
                function B() {}
                B.prototype = new A();
                B.prototype.b = "b";

                Class(B).mixin(someObj);
                expect(someObj.a).to.be("a");
                expect(someObj.b).to.be("b");
            });
        });
        describe("plugins", function () {
            it("should be possible to add plugins to classes via the .use()-method", function () {
                var MyClass = new Class({}),
                    pluginCalled = 0;
                
                MyClass.use(function plugin(Class) {
                    pluginCalled++;
                    expect(Class).to.be(MyClass);
                });
                expect(pluginCalled).to.be(1);
            });
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

                expect(myClassConstructorCalled).to.be(1);
                expect(pluginConstructorCalled).to.be(1);
                expect(myClassMethodCalled).to.be(1);
                expect(pluginMethodCalled).to.be(1);
            });
            it("should be chainable", function () {
                var MyClass = new Class({});

                function plugin() {}

                expect(MyClass.use(plugin)).to.be(MyClass);
            });
        });
    });
})(
    typeof window === "object"? expect : require("expect.js"),
    typeof window === "object"? window.peerigon.Class : require("../")
);