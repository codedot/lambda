all: compile.js
	npm install
	node lambda -h
	node lambda -d debug.mlc
	node lambda fact.mlc

compile.js: grammar.jison
	npm install jison@0.4.15
	node_modules/.bin/jison $< -o $@.tmp -m js
	printf '\nmodule.exports = parser;\n' >>$@.tmp
	mv $@.tmp $@

clean:
	-rm -f *.tmp
	-rm -fr node_modules
