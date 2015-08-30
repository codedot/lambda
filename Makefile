BRFS = node_modules/.bin/brfs
BROWSERIFY = node_modules/.bin/browserify
JISON = node_modules/.bin/jison

SRC = \
	agents.js \
	encode.js \
	fact.mlc \
	lambda.js \
	system.js \
	template.txt \
	web.js

all: bundle.js
	time -p node check.js

bundle.js: $(BROWSERIFY) $(BRFS) $(SRC)
	node_modules/.bin/browserify -t brfs -o bundle.js web.js

$(JISON):
	npm install jison

$(BROWSERIFY):
	npm install browserify

$(BRFS):
	npm install brfs

clean:
	-rm -f agents.js lambda.js *.tmp
	-rm -fr node_modules

.POSIX:

.SUFFIXES: .jison .js

.jison.js:
	$(MAKE) $(JISON)
	$(JISON) $< -o $*.tmp -m js
	printf '\nmodule.exports = parser;\n' >>$*.tmp
	mv $*.tmp $@
