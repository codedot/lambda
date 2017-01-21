JISON = node_modules/.bin/jison
INETLIB = node_modules/inet-lib/package.json

all: $(INETLIB) lambda.js
	node check.js debug.mlc >|debug.tmp
	tail debug.tmp
	time -p node check.js

$(INETLIB):
	npm install inet-lib

lambda.js: $(JISON) lambda.jison
	$(JISON) lambda.jison -o lambda.tmp -m js
	printf '\nmodule.exports = parser;\n' >>lambda.tmp
	mv lambda.tmp $@

$(JISON):
	npm install jison@0.4.15

clean:
	-rm -f lambda.js profile.json *.tmp
	-rm -fr node_modules
