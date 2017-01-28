all: compile.js
	npm install
	node lambda -e "S hello bye world"
	node lambda -d samples/debug.mlc
	node lambda -p samples/fact.mlc -a normal
	node lambda -p samples/fact.mlc -a closed
	node lambda -p samples/fact.mlc -a optimal

compile.js: grammar.jison
	npm install jison@0.4.15
	node_modules/.bin/jison $< -o $@.tmp -m js
	printf '\nmodule.exports = parser;\n' >>$@.tmp
	mv $@.tmp $@

clean:
	-rm -f *.tmp
	-rm -fr node_modules
