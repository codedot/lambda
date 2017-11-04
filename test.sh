TERMF="%-9s"
CELLF="%15s"
SED="s/(\([0-9]*\)),.*$/\/\1/"
OUT=`mktemp`
ERR=`mktemp`

run()
{
	node lambda -p -f $1 -a $2 >|$OUT 2>|$ERR

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

printf "$TERMF$CELLF$CELLF$CELLF\n" SAMPLE \
	ABSTRACT CLOSED OPTIMAL

compare counter abstract closed optimal
compare w2eta   abstract closed optimal
compare 1021    abstract closed optimal
compare 22210i  abstract closed optimal
compare 3222i   abstract closed optimal
compare 1022i   abstract closed optimal
compare 4222i   abstract closed OPTIMAL
compare 222210i abstract closed OPTIMAL
compare 2222101 abstract CLOSED OPTIMAL
compare cfact4  abstract closed optimal
compare yfact4  abstract closed optimal
compare cfact5  abstract closed optimal
compare yfact5  abstract closed OPTIMAL
