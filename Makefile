CTX = (w: w M w) (x: x x)

all:
	npm install
	node generate.js "$(CTX)" 1 6 >terms.txt
	node compute.js abstract 150 "$(CTX)" 1 6 >abstract.tsv
	grep N/A abstract.tsv

clean:
	-rm -fr node_modules
	-rm -f abstract.tsv terms.txt
