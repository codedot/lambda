JISON = node_modules/.bin/jison

all: parsers
	$(MAKE) fact.in
	time -p node cli.js fact.in

parsers: $(JISON)
	$(MAKE) lambda.js
	$(MAKE) system.js

$(JISON):
	npm install jison

clean:
	-rm -f lambda.js system.js fact.in

.POSIX:

.SUFFIXES: .js .jison .mlc .in

.jison.js:
	$(JISON) $<

.mlc.in:
	node encode.js $<
