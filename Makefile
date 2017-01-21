TEST = node lambda
JISON = node_modules/.bin/jison

all: compile.js
	npm install
	$(TEST) debug.mlc >|output.tmp
	tail output.tmp
	time -p $(TEST)

compile.js: $(JISON) grammar.jison
	$(JISON) grammar.jison -o compile.tmp -m js
	printf '\nmodule.exports = parser;\n' >>compile.tmp
	mv compile.tmp $@

$(JISON):
	npm install jison@0.4.15

clean:
	-rm -f compile.js stats.json *.tmp
	-rm -fr node_modules
