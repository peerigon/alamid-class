"use strict"; // run code in ES5 strict mode

var Class = require("../");

module.exports = new Class("Orphan", {
    seekParents: function () {
        return "No parents found. " + this.name + " is feeling " + this.mood + " now..." ;
    }
});