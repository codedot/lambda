"use strict";

const mlc = require(".");

const argv = process.argv;
const max = parseInt(argv.pop());
const min = parseInt(argv.pop());
const ctx = argv.pop();
const lim = parseInt(argv.pop());

function* sub(len, nv)
{
	if (len) {
		--len;

		for (const t of sub(len, nv + 1))
			yield `(v${nv}: ${t})`;

		for (let l = 0; l <= len; l++)
			for (const t of sub(len - l, nv))
				for (const u of sub(l, nv))
					yield `(${t} ${u})`;
	} else {
		for (let i = 0; i < nv; i++)
			yield `v${i}`;
	}
}

function* wrap(ctx, len)
{
	for (const m of sub(len, 0))
		yield ctx.replace("M", m);
}

function* exhaust(ctx, min, max)
{
	for (let len = min; len <= max; len++)
		yield* wrap(ctx, len);
}

function compute(term, algo)
{
	const abd = [];
	const cb = {
		a: () => abd.push("a"),
		b: () => abd.push("b"),
		d: () => abd.push("d")
	};
	let result;

	try {
		result = mlc(term, algo, lim, cb);
		result.abd = abd.join("");
	} catch (error) {
		result = {};
	}

	return result;
}

function diff(term)
{
	const abstract = compute(term, "abstract");
	const optimal = compute(term, "optimal");

	if (!optimal.nf)
		return;

	if (abstract.nf != optimal.nf)
		return true;

	if (abstract.abd != optimal.abd)
		return true;
}

for (const term of exhaust(ctx, min, max))
	if (diff(term))
		console.info(term);
