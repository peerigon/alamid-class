"use strict";

var Class = require("../");

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

var cat = new Cat();
console.log(cat instanceof Cat); // true
console.log(cat.name); // "Jimmy"
console.log(cat.hasOwnProperty("strollAround")); // false, it is inherited from the prototype

module.exports = Cat;