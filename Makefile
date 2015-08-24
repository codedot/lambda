JISON = node_modules/.bin/jison

all: $(JISON)
	$(MAKE) parsers
	$(MAKE) example
	time -p ./example
	$(MAKE) example.p2p
	time -p node interact.js example.p2p

example.c: example.in

parsers: mlc.js inet.js

$(JISON):
	npm install jison

clean:
	-rm -f inet.js mlc.js
	-rm -f example.in example.c example
	-rm -f example.p2p
	-rm -f in.tab.c in.tab.h

.POSIX:

.SUFFIXES: .js .jison .mlc .in .p2p

.jison.js:
	$(JISON) $<

.mlc.in:
	node parse.js $< >$@

.mlc.p2p:
	node parse.js $< p2p >$@

.in.c:
	inc <$<
	mv in.tab.c $@
