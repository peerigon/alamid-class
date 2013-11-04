"use strict";

var Class = require("../lib/Class.js"),
    instance;

var timeA = process.hrtime();

var SuperClass1 = function () {};

var Class1 = function () {
    SuperClass1.apply(this, arguments);
};
Class1.prototype = Object.create(SuperClass1);

var SubClass1 = function () {
    Class1.apply(this, arguments);
};
SubClass1.prototype = Object.create(Class1);

var timeB = process.hrtime(),
    diffB = process.hrtime(timeB);

var SuperClass2 = new Class({});
var Class2 = SuperClass2.extend({});
var SubClass2 = Class2.extend({
    constructor: function () {
        this._super();
    }
});

var timeC = process.hrtime(),
    diffC = process.hrtime(timeC);

instance = new SubClass1();

var timeD = process.hrtime(),
    diffD = process.hrtime(timeD);

instance = new SubClass2();

var timeE = process.hrtime(),
    diffE = process.hrtime(timeE);

var resultB =  diffB[0] * 1e9 + diffB[1],
    resultC =  diffC[0] * 1e9 + diffC[1],
    resultD =  diffD[0] * 1e9 + diffD[1],
    resultE =  diffE[0] * 1e9 + diffE[1];

console.log("\n");
console.log("compile");
console.log("===================================================================");
console.log("native", resultB, "nanoseconds");
console.log("alamid-class", resultC, "nanoseconds", "(", Math.floor((resultC - resultB) / resultC * 100), "% slower)");
console.log("\n");
console.log("instantiation");
console.log("===================================================================");
console.log("native", resultD, "nanoseconds");
console.log("alamid-class", resultE, "nanoseconds", "(", Math.floor((resultE - resultD) / resultE * 100), "% slower)");
console.log("\n");