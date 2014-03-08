"use strict";

var Class = require("../lib/Class.js");

var Cat = new Class("Cat", {
    name: "Jimmy",
    age: 3,
    constructor: function (name, age) {
        this.name = name || this.name;
        this.age = age || this.age;
    }
});

function victimsPlugin(Class) {
    var constructor = Class.prototype.constructor;

    Class.prototype.constructor = function () {
        constructor.apply(this, arguments);
        this.victims = [];
    };

    Class.prototype.attack = function (target) {
        this.victims.push(target);
    };
}

Cat.use(victimsPlugin);


var cat = new Cat();
console.log(cat.victims); // []


cat.attack("dog");
console.log(cat.victims); // ["dog"]