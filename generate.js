"use strict";

const exhaust = require("./exhaust");
const fs = require("fs");

const argv = process.argv;
const max = parseInt(argv.pop());
const min = parseInt(argv.pop());

for (const term of exhaust(min, max))
	fs.writeSync(1, `${term}\n`);
