TEST = node lambda
JISON = node_modules/.bin/jison
INETLIB = node_modules/inet-lib/package.json

all: $(INETLIB) compile.js
	$(TEST) debug.mlc >|output.tmp
	tail output.tmp
	time -p $(TEST)

$(INETLIB):
	npm install inet-lib

compile.js: $(JISON) grammar.jison
	$(JISON) grammar.jison -o compile.tmp -m js
	printf '\nmodule.exports = parser;\n' >>compile.tmp
	mv compile.tmp $@

$(JISON):
	npm install jison@0.4.15

clean:
	-rm -f compile.js stats.json *.tmp
	-rm -fr node_modules
