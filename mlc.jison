%lex

%%

---.* ;

[ \t\n]+ ;

[A-Za-z][A-Za-z0-9]* return NAME;

. return yytext;

/lex

%token <name> NAME

%type <expr> term appl abst atom

%%

text : defs term {output($2);}
     ;
defs : /* empty */
     | defs NAME '=' term ';' {bind($2, $4);}
     ;
term : appl
     | abst
     ;
abst : NAME ',' abst {$$ = mkabst($1, $3);}
     | NAME ':' term {$$ = mkabst($1, $3);}
     ;
appl :      atom
     | appl atom {$$ = mkappl($1, $2);}
     ;
atom : '(' term ')' {$$ = $2;}
     |     NAME     {$$ = mkname($1);}
     ;
