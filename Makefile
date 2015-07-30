JISON = node_modules/.bin/jison

all: $(JISON)
	$(MAKE) parsers
	$(MAKE) example
	./example

example.c: example.in

parsers: mlc.js inet.js

$(JISON):
	npm install jison

clean:
	-rm -fr node_modules
	-rm -f inet.js mlc.js
	-rm -f example.in example.c example
	-rm -f in.tab.c in.tab.h

.POSIX:

.SUFFIXES: .js .jison .mlc .in

.jison.js:
	$(JISON) $<

.mlc.in:
	node parse.js $< >$@

.in.c:
	inc <$<
	mv in.tab.c $@
