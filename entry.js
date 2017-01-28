"use strict";

const mlcjs = require("@alexo/lambda");
const fs = require("fs");
const example = fs.readFileSync("fact.mlc", "utf8");

mlcjs.example = example.replace(/\n$/, "");

global.mlcjs = mlcjs;
