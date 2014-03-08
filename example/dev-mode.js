"use strict";

var Class = require("../");

var prototype = {
    ohSnap: function () {
        throw new Error("Take a look at the nice stack trace");
    }
};
var cat;

var Cat = new Class("Cat", prototype);
try {
    cat = new Cat();
    cat.ohSnap();
} catch (err) {
    console.log(err.stack);
}

Class.dev = true;
Cat = new Class("Cat", prototype);
try {
    cat = new Cat();
    cat.ohSnap();
} catch (err) {
    console.log(err.stack);
}