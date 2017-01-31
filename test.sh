CELLF="%-16s"
TERMF="%-9s"
HEADF="$TERMF$CELLF$CELLF$CELLF$CELLF$CELLF\n"
SED="s/,.*$//"
OUT=`mktemp`
ERR=`mktemp`

run()
{
	node lambda -p samples/$1.mlc -a $2 >|$OUT 2>|$ERR

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

printf $HEADF SAMPLE ABSTRACT CLOSED NORMAL OPTIMAL

compare counter "v1: v1 (v2: v2 v2) (v3: v3 v3)" \
	abstract closed normal optimal

compare w2eta "v1, v2: v1 (v1 (v1 (v1 v2)))" \
	abstract closed normal optimal

compare 22210ii "v1: v1" \
	abstract closed NORMAL optimal

compare 3222ii "v1: v1" \
	abstract closed NORMAL optimal

compare 1022ii "v1: v1" \
	abstract closed NORMAL optimal

compare 4222ii "v1: v1" \
	abstract closed NORMAL OPTIMAL

compare cfact4 "v1, v2: v1 (v1 (v1 v2))" \
	abstract closed normal optimal

compare yfact4 "v1, v2: v1 (v1 (v1 v2))" \
	abstract closed normal optimal

compare cfact5 "v1, v2: v1 (v1 (v1 (v1 (v1 v2))))" \
	abstract closed normal optimal

compare yfact5 "v1, v2: v1 (v1 (v1 (v1 (v1 v2))))" \
	abstract closed normal OPTIMAL
