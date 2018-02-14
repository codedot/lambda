"use strict";

const generic = require("./generic");
const abstract = require("./abstract");
const closed = require("./closed");
const optimal = require("./optimal");
const standard = require("./standard");

const expand = generic.expand;
const readback = generic.readback;

function addalgo(name, algo)
{
	function encode(term)
	{
		let conf, inet;

		term = expand(term);
		conf = algo(generic, term);
		inet = conf.inet;

		conf = conf.join(";\n")  + ";";
		inet = inet.replace("INCONFIG", conf);
		inet = inet.replace("READBACK\n", readback);
		return inet;
	}

	exports[name] = encode;
}

addalgo("abstract", abstract);
addalgo("closed", closed);
addalgo("optimal", optimal);
addalgo("standard", standard);
