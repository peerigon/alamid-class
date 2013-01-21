"use strict"; // run code in ES5 strict mode

var Class = require("../../../../");

module.exports = function runTest() {
    var Cat = new Class("Cat", {
        name: "Jimmy",
        age: 3,
        constructor: function (name, age) {
            this.name = name || this.name;
            this.age = age || this.age;
        },
        strollAround: function () {}
    });

    var Orphan = new Class("Orphan", {
        seekParents: function () {
            return "No parents found. " + this.name + " is feeling " + this.mood + " now..." ;
        }
    });

    var Octocat = Cat.extend("Octocat", Orphan, {
        mood: "sad",
        constructor: function () {
            this._super("Octocat", 5);
        },
        strollAround: function () {
            this.seekParents();
            this._super();
        }
    });

    return Octocat;
};