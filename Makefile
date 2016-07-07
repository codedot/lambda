BRFS = node_modules/.bin/brfs
BROWSERIFY = node_modules/.bin/browserify
JISON = node_modules/.bin/jison
INETLIB = node_modules/inet-lib/package.json

SRC = \
	$(INETLIB) \
	encode.js \
	fact.mlc \
	lambda.js \
	system.js \
	template.txt

all: bundle.js
	node check.js debug.mlc >debug.tmp
	tail debug.tmp
	time -p node check.js

bundle.js: $(BROWSERIFY) $(BRFS) $(SRC)
	node_modules/.bin/browserify -t brfs -o bundle.js system.js

$(INETLIB):
	npm install inet-lib

$(JISON):
	npm install jison@0.4.15

$(BROWSERIFY):
	npm install browserify

$(BRFS):
	npm install brfs

clean:
	-rm -f lambda.js profile.json *.tmp
	-rm -fr node_modules

.POSIX:

.SUFFIXES: .jison .js

.jison.js:
	$(MAKE) $(JISON)
	$(JISON) $< -o $*.tmp -m js
	printf '\nmodule.exports = parser;\n' >>$*.tmp
	mv $*.tmp $@
