JISON = node_modules/jison/package.json

SRC = \
	cli.js \
	encode.js \
	fact.in \
	lambda.jison \
	system.jison \
	template.txt

all: $(JISON) $(SRC)
	time -p node cli.js fact.in

$(JISON):
	npm install jison

clean:
	-rm -f fact.in

.POSIX:

.SUFFIXES: .mlc .in

.mlc.in:
	node encode.js $<
