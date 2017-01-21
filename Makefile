all: compile.js
	npm install
	node lambda debug.mlc >|output.tmp
	tail output.tmp
	time -p node lambda

compile.js: grammar.jison
	npm install jison@0.4.15
	node_modules/.bin/jison $< -o $@.tmp -m js
	printf '\nmodule.exports = parser;\n' >>$@.tmp
	mv $@.tmp $@

clean:
	-rm -f *.tmp stats.json
	-rm -fr node_modules
