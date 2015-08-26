JISON = node_modules/jison/package.json

all: $(JISON)
	time -p node cli.js fact.mlc

$(JISON):
	npm install jison

clean:
	-rm -fr node_modules
