var run = require("./system");
var fs = require("fs");

var textarea, button;

function find()
{
	var mlc = textarea.val();

	mlc = run(mlc);

	$("#result").text(mlc);
}

function allow()
{
	button.attr("disabled", !this.checked);
}

function setup()
{
	var fact = fs.readFileSync("fact.mlc", "utf8");
	var cols = 0;
	var i, rows;

	textarea = $("textarea");

	fact = fact.replace(/\n*$/, "");

	rows = fact.split("\n");
	for (i = 0; i < rows.length; i++)
		if (cols < rows[i].length)
			cols = rows[i].length;

	rows = rows.length;

	textarea.attr("rows", rows);
	textarea.attr("cols", cols);
	textarea.text(fact);

	button = $("button");
	button.click(find);

	$("input").click(allow);
}

$(setup);