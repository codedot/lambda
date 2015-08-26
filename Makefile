JISON = node_modules/.bin/jison

all: parsers
	$(MAKE) example.in
	time -p node interact.js example.in

parsers: $(JISON)
	$(MAKE) mlc.js
	$(MAKE) inet.js

$(JISON):
	npm install jison

clean:
	-rm -f inet.js mlc.js example.in

.POSIX:

.SUFFIXES: .js .jison .mlc .in

.jison.js:
	$(JISON) $<

.mlc.in:
	node parse.js $<
