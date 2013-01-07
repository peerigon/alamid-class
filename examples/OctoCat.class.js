"use strict"; // run code in ES5 strict mode

var Cat = require("./Cat.class.js"),
    Orphan = require("./Orphan.class.js");

module.exports = Cat.extend("Octocat", Orphan, {
    mood: "sad",
    constructor: function () {
        this._super("Octocat", 5);
    },
    strollAround: function () {
        this.seekParents();
    }
});