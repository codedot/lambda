"use strict";

const exhaust = require("./exhaust");
const fs = require("fs");

const argv = process.argv;
const max = parseInt(argv.pop());
const min = parseInt(argv.pop());
const ctx = argv.pop();

for (const term of exhaust(ctx, min, max))
	fs.writeSync(1, `${term}\n`);