all:
	npm install
	time -p node generate.js 1 8 >terms.txt
	time -p node compute.js abstract 250 1 5 >abstract.tsv

clean:
	-rm -fr node_modules
	-rm -f abstract.tsv terms.txt
