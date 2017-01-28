BROWSERIFY = node_modules/.bin/browserify

all:
	npm install
	$(BROWSERIFY) -g brfs -o bundle.js entry.js

clean:
	-rm -fr node_modules
