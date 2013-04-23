"use strict";

var Class = require("../");
var Cat = require("./basic.js");

var Octocat = Cat.extend("Octocat", {
    mood: "sad",
    constructor: function () {
        this._super("Octocat", 5);
    },
    strollAround: function () {
        console.log("Seeking parents ... but in the meantime:");
        this._super();
    }
});

var octocat = new Octocat();
console.log(octocat instanceof Cat); // true
console.log(octocat.name); // "Octocat"
console.log(octocat.mood); // "sad"
octocat.strollAround(); // "Seeking parents ... but in the meantime:
                        // MEEEOOOWWW!!! Need food! Now!"



var EventEmitter = require("events").EventEmitter;
var MyEventEmitter = Class(EventEmitter).extend({
    mute: false,
    emit: function () {
        if (this.mute) return;
        return this._super.apply(this, arguments);
    }
});

var myEventEmitter = new MyEventEmitter();
myEventEmitter.on("test", function () {
    console.log("emitted");
});
myEventEmitter.mute = false;
myEventEmitter.emit("test");