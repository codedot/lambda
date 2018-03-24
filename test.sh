TERMF="%-9s"
CELLF="%15s"
SED="s/(\([0-9]*\)),.*$/\/\1/"
OUT=`mktemp`
ERR=`mktemp`

run()
{
	node lambda -f $1 -a $2 -p >|$OUT 2>|$ERR

	if [ $? -eq 0 -a "$(cat $OUT)" = "$3" ]; then
		printf $CELLF "$(sed "$SED" $ERR)"
	else
		printf $CELLF "N/A"
	fi
}

compare()
{
	term=$1
	file=samples/$term.mlc
	nf="$(sed -n 's/^# *//p' $file)"
	shift 1

	printf $TERMF $term

	for algo; do
		run $file $algo "$nf"
	done

	printf "\n"
}

printf "$TERMF$CELLF$CELLF$CELLF$CELLF\n" SAMPLE \
	ABSTRACT CLOSED OPTIMAL STANDARD

compare counter  abstract closed optimal standard
compare w2eta    abstract closed optimal standard
compare 1021     abstract closed optimal standard
compare 22210i   abstract closed optimal STANDARD
compare 3222i    abstract closed optimal STANDARD
compare 1022i    abstract closed OPTIMAL STANDARD
compare 2222101  abstract CLOSED OPTIMAL STANDARD
compare facty6nt abstract closed optimal standard
compare facty9i  abstract closed OPTIMAL STANDARD
compare 33-fact4 abstract closed optimal standard
compare fibo16nt abstract closed optimal standard
compare fact100i abstract closed OPTIMAL STANDARD
compare 35-fact5 abstract closed optimal STANDARD
compare fibo20i  abstract closed optimal standard
compare fact1knt abstract CLOSED OPTIMAL STANDARD
