all: compile.js
	npm install
	node lambda 'S hello bye world'
	node lambda -d 'x: (x: x) v1 x'
	sh test.sh

compile.js: grammar.jison
	npm install jison@0.4.15
	node_modules/.bin/jison $< -o $@.tmp -m js
	printf '\nmodule.exports = parser;\n' >>$@.tmp
	mv $@.tmp $@

clean:
	-rm -f *.tmp
	-rm -fr node_modules
