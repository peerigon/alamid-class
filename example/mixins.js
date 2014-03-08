"use strict";

var Class = require("../");
var Cat = require("./basic.js");
var EventEmitter = require("events").EventEmitter;

console.log("\nmixins\n==================================================\n");

var Orphan = {
    seekParents: function () {
        console.log("No parents found. " + this.name + " is feeling " + this.mood + " now...");
    }
};

var Octocat = Cat.extend("Octocat", Orphan, {
    mood: "sad",
    constructor: function () {
        this._super("Octocat", 5);
    }
});

var octocat = new Octocat();
octocat.seekParents(); // "No parents found. Octocat is feeling sad now..."



Octocat = Cat.extend("Octocat", EventEmitter, Orphan, {
    mood: "sad",
    constructor: function () {
        this._super("Octocat", 5);
    }
});
octocat = new Octocat();
octocat.emit("seekingParents");



var someObj = {};
Octocat.mixin(someObj);
someObj.seekParents(); // "No parents found. Jimmy is feeling sad now..."

// The constructor of Octocat hasn't been called, the name is still Jimmy inherited from the Cat-class.
// We need to apply the constructor manually.
Octocat.call(someObj);
someObj.seekParents(); // "No parents found. Octocat is feeling sad now..."