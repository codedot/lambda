function beta(s)
{
	return substr(s, index(s, "/"));
}

function detect(b1, b2, nf1, nf2)
{
	if (("N/A" == b1) && ("N/A" == b2))
		return "BERR";

	if ("N/A" == b1)
		return "LERR";

	if ("N/A" == b2)
		return "RERR";

	if (("?" == nf1) && ("?" == nf2))
		return;

	if ("?" == nf1)
		return "LLIM";

	if ("?" == nf2)
		return "RLIM";

	if (nf1 != nf2)
		return "NENF";

	if (beta(b1) != beta(b2))
		return "BETA";
}

BEGIN {
	FS = "\t";
	OFS = "\t";
}

{
	status = detect($2, $5, $3, $6);
	if (status)
		print status, $1, $2, $5, $3, $6;
}
