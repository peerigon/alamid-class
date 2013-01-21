"use strict"; // run code in ES5 strict mode

module.exports = function runTest() {
    function Cat(name, age) {
        this.name = name || this.name;
        this.age = age || this.age;
    }
    Cat.prototype.name = "Jimmy";
    Cat.prototype.age = 3;
    Cat.prototype.strollAround = function () {};

    function Orphan() {}
    Orphan.prototype.seekParents = function () {
        return "No parents found. " + this.name + " is feeling " + this.mood + " now..." ;
    };

    function Octocat() {
        Orphan.apply(this, arguments);
        Cat.apply(this, arguments);
    }
    Octocat.prototype = createObj(Cat.prototype);
    extendObj(Octocat.prototype, Orphan.prototype);
    Octocat.prototype.mood = "sad";
    Octocat.strollAround = function () {
        this.seekParents();
        Cat.prototype.strollAround.apply(this);
    };

    return Octocat;
};

function extendObj(target, source) {
    var key;

    for (key in source) {
        target[key] = source[key];
    }
}

/**
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 * @param {Object} o
 * @return {Object}
 */
function createObj(o) {
    function F() {}
    F.prototype = o;
    return new F();
}