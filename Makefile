JISON = node_modules/.bin/jison

all: $(JISON)

$(JISON):
	npm install jison

clean:
	-rm -fr node_modules
