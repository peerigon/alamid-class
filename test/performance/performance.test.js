"use strict"; // run code in ES5 strict mode

var path = require("path"),
    fs = require("fs"),
    util = require("util"),
    clc = require("cli-color"),
    Class = require("../../");

var outputDir = __dirname + "/results",
    now = new Date(),
    title = process.argv[2],
    numOfIterations = 10000,
    outputFile = outputDir + "/" +
        title + " " + numOfIterations +
        ".json",
    result = {
        setup: {
            title: title,
            date: now.toUTCString(),
            numOfIterations: numOfIterations,
            unit: "nanoseconds"
        },
        tests: {
            nodeclass: {},
            classic: {},
            classicBinding: {}
        }
    },
    examplePath = path.resolve(__dirname, "../../examples/OctoCat.class.js");

var operations = {
    compilation: function compilation(path) {
        delete require.cache[path];
        require(path);
    },
    instantiation: function instantiation(Class) {
        new Class();
    },
    execution: function execution(instance) {
        instance.strollAround();
    }
};

function perform(action, arg) {
    var start,
        duration,
        i,
        progress = 0,
        previousProgress = 0;

    process.stdout.write(clc.blackBright(action.name + clc.move(20 - action.name.length, 0) + " ["));

    start = process.hrtime();
    for (i = 0; i < numOfIterations; i++) {
        action(arg);
        progress = Math.floor((i / numOfIterations) * 50);
        if (progress !== previousProgress) {
            process.stdout.write(clc.blackBright("="));
        }
        previousProgress = progress;
    }
    duration = process.hrtime(start);
    duration = duration[0] * Math.pow(10, 9) + duration[1];

    process.stdout.write(clc.blackBright("] ") +
        clc.greenBright(Math.floor(duration/numOfIterations) + " ns/op") + "\n");

    return duration;
}

Class.dev = false;

// PRINT SETUP
console.log("\nTest: ", title);
console.log("Number of iterations: " + numOfIterations);
console.log("\n" + clc.blackBright("-------------------------------------------------------------------------------"));

// NODECLASS
result.tests.nodeclass.compilation = perform(operations.compilation, examplePath);
Class = require(examplePath);
result.tests.nodeclass.instantiation = perform(operations.instantiation, Class);
result.tests.nodeclass.execution = perform(operations.execution, new Class());

console.log("\n" + clc.blackBright("-------------------------------------------------------------------------------"));

if (!title) {
    return; // no output without title
}

// OUTPUT
if (fs.existsSync(outputDir) === false) {
    fs.mkdirSync(outputDir);
}

fs.writeFileSync(
    outputFile,
    util.inspect(result, true, 5, false),
    "utf8"
);