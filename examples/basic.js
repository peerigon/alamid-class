"use strict";

var Class = require("../");

console.log("\nbasics\n==================================================\n");

var Cat = new Class("Cat", {
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
console.log(cat.Class === Cat); // true

module.exports = Cat;