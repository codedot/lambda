JISON = node_modules/.bin/jison

all: $(JISON)
	$(MAKE) parsers
	node mlc.js example.mlc

parsers: mlc.js inet.js

$(JISON):
	npm install jison

clean:
	-rm -fr node_modules
	-rm -f inet.js mlc.js

.POSIX:

.SUFFIXES: .js .jison

.jison.js:
	$(JISON) $<
