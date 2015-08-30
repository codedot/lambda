var run = require("./system");

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
	var example = run.example;
	var cols = 0;
	var i, rows;

	textarea = $("textarea");

	rows = example.split("\n");
	for (i = 0; i < rows.length; i++)
		if (cols < rows[i].length)
			cols = rows[i].length;

	rows = rows.length;

	textarea.attr("rows", rows);
	textarea.attr("cols", cols);
	textarea.text(example);

	button = $("button");
	button.click(find);

	$("input").click(allow);
}

$(setup);
