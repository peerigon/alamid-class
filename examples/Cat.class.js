"use strict"; // run code in ES5 strict mode

var Class = require("../");

module.exports = new Class("Cat", {
    name: "Jimmy",
    age: 3,
    constructor: function (name, age) {
        this.name = name || this.name;
        this.age = age || this.age;
    },
    strollAround: function () {

    },
    bla: function () {

    }
});