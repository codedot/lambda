BEGIN {
	FS = "\t";
	OFS = "\t";

	total = 0;

	fail = 0;
	hard = 0;
	good = 0;
}

{
	++total;

	if ("N/A" == $2)
		++fail;
	else if ("?" == $3)
		++hard;
	else
		++good;

	if (!(total % 10000))
		print total, good, hard, fail;
}

END {
	print total, good, hard, fail;
}
