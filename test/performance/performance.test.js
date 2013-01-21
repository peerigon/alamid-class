"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    util = require("util"),
    clc = require("cli-color"),
    Class = require("../../");

var outputDir = __dirname + "/results",
    now = new Date(),
    title = process.argv[2],
    numOfIterations = 30000,
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
        tests: {}
    };

function stopTimer(timer) {
    timer = process.hrtime(timer);
    return timer[0] * Math.pow(10, 9) + timer[1];
}

function perform(name, compiler) {
    var duration,
        Class,
        instance,
        compilation = 0,
        instantiation = 0,
        execution = 0,
        i,
        progress = 0,
        previousProgress = 0;

    console.log(name);

    for (i = 0; i < numOfIterations; i++) {
        duration = process.hrtime();
        Class = compiler();
        compilation += stopTimer(duration);

        duration = process.hrtime();
        instance = new Class();
        instantiation += stopTimer(duration);

        duration = process.hrtime();
        instance.strollAround();
        execution += stopTimer(duration);

        progress = Math.floor((i / numOfIterations) * 50);
        if (progress !== previousProgress) {
            process.stdout.write(clc.blackBright("="));
        }
        previousProgress = progress;
    }

    compilation = Math.floor(compilation / numOfIterations);
    instantiation = Math.floor(instantiation / numOfIterations);
    execution = Math.floor(execution / numOfIterations);

    process.stdout.write("\n");
    process.stdout.write("compilation       " + clc.greenBright(compilation + " " + result.setup.unit + "/op\n"));
    process.stdout.write("instantiation     " + clc.greenBright(instantiation + " " + result.setup.unit + "/op\n"));
    process.stdout.write("execution         " + clc.greenBright(execution + " " + result.setup.unit + "/op\n"));
    process.stdout.write("\n");

    return {
        compilation: compilation,
        instantiation: instantiation,
        execution: execution
    };
}

// PRINT SETUP
console.log("\nTest: ", title);
console.log("Number of iterations: " + numOfIterations + "\n");

// ALAMID-CLASS
result.tests.alamidClass = perform("alamid-class", require("./tests/alamid-class"));

// ALAMID-CLASS (DEV)
result.tests.alamidClass = perform("alamid-class (dev)", require("./tests/alamid-class-dev"));

// CLASSIC
result.tests.alamidClass = perform("classic", require("./tests/classic"));

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