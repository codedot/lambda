"use strict";

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

module.exports = exhaust;
