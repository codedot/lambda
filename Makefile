CTX = (x: x x) M

all:
	npm install
	node generate.js "$(CTX)" 1 8 >terms.txt
	node compute.js abstract 250 "$(CTX)" 1 5 >abstract.tsv

clean:
	-rm -fr node_modules
	-rm -f abstract.tsv terms.txt
