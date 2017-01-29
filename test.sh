CELLF="%-14s"
TERMF="%-9s"
HEADF="$TERMF$CELLF$CELLF$CELLF$CELLF$CELLF\n"
SED="s/(\(.*\)),.*$/\/\1/"
OUT=`mktemp`
ERR=`mktemp`

run()
{
	node lambda -p samples/$1.mlc -a $2 >|$OUT 2>|$ERR

	if [ $? -eq 0 ]; then
		printf $CELLF "$(sed "$SED" $ERR)"
	else
		printf $CELLF "N/A"
	fi
}

compare()
{
	term=$1
	printf $TERMF $term
	shift

	for a; do
		run $term $a
	done

	printf "\n"
}

printf $HEADF SAMPLE ABSTRACT CLOSED NORMAL OPTIMAL TURNING

compare test    abstract closed normal optimal turning
compare exp     ABSTRACT closed NORMAL OPTIMAL TURNING
compare asperti abstract closed normal optimal turning
compare fact    abstract closed normal optimal turning
compare larger  abstract closed normal OPTIMAL turning
