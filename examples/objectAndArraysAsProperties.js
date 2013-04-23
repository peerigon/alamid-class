"use strict";

var Class = require("../");

var MyClass = new Class({
    myObj: {}
});

var a = new MyClass();
var b = new MyClass();
console.log(a.myObj === b.myObj); // true



MyClass = new Class({
    myObj: null,
    constructor: function () {
        this.myObj = {};
    }
});
a = new MyClass();
b = new MyClass();
console.log(a.myObj === b.myObj); // false