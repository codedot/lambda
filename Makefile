BRFS = node_modules/.bin/brfs
BROWSERIFY = node_modules/.bin/browserify
JISON = node_modules/.bin/jison

SRC = \
	agents.jison \
	encode.js \
	fact.mlc \
	lambda.jison \
	system.js \
	template.txt \
	web.js

all: bundle.js
	time -p node cli.js fact.mlc

bundle.js: $(JISON) $(BROWSERIFY) $(BRFS) $(SRC)
	node_modules/.bin/browserify -t brfs -o bundle.js web.js

$(JISON):
	npm install jison

$(BROWSERIFY):
	npm install browserify

$(BRFS):
	npm install brfs

clean:
	-rm -fr node_modules
