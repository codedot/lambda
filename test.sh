TERMF="%-9s"
CELLF="%15s"
SED="s/(\([0-9]*\)),.*$/\/\1/"
OUT=`mktemp`
ERR=`mktemp`

run()
{
	node lambda -p -f samples/$1.mlc -a $2 >|$OUT 2>|$ERR

	if [ $? -eq 0 -a "$(cat $OUT)" = "$3" ]; then
		printf $CELLF "$(sed "$SED" $ERR)"
	else
		printf $CELLF "N/A"
	fi
}

compare()
{
	term=$1
	nf=$2
	shift 2

	printf $TERMF $term

	for algo; do
		run $term $algo "$nf"
	done

	printf "\n"
}

printf "$TERMF$CELLF$CELLF$CELLF\n" SAMPLE \
	CLOSED OPTIMAL ABSTRACT

compare counter "v1: v1 (v2: v2 v2) (v3: v3 v3)" \
	closed optimal abstract

compare w2eta "v1, v2: v1 (v1 (v1 (v1 v2)))" \
	closed optimal abstract

compare 22210ii "v1: v1" \
	closed optimal abstract

compare 3222ii "v1: v1" \
	closed optimal abstract

compare 1022ii "v1: v1" \
	closed optimal abstract

compare 4222ii "v1: v1" \
	closed OPTIMAL abstract

compare 222210ii "v1: v1" \
	closed OPTIMAL abstract

compare cfact4 "v1, v2: v1 (v1 (v1 v2))" \
	closed optimal abstract

compare yfact4 "v1, v2: v1 (v1 (v1 v2))" \
	closed optimal abstract

compare cfact5 "v1, v2: v1 (v1 (v1 (v1 (v1 v2))))" \
	closed optimal abstract

compare yfact5 "v1, v2: v1 (v1 (v1 (v1 (v1 v2))))" \
	closed OPTIMAL abstract
