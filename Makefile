all: compile.js
	npm install
	node lambda -e 'eval(1 << 3) f x'
	node lambda -t 'S hello bye world'
	node lambda -d 'x: (x: x) v1 x'
	node debug.js 1000 M 1 5
	sh bad.sh
	sh test.sh

compile.js: grammar.jison
	npm install --no-save jison@0.4.18
	node_modules/.bin/jison $< -o $@

clean:
	-rm -fr node_modules
