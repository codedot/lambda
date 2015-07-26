JISON = node_modules/.bin/jison

all: $(JISON)
	$(JISON) inet.jison

$(JISON):
	npm install jison

clean:
	-rm -fr node_modules
	-rm -f inet.js
