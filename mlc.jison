%lex

%%

\s+ /* skip whitespace */

\w+\b return "NAME";

"=" return "=";
";" return ";";
"," return ",";
":" return ":";
"(" return "(";
")" return ")";

/lex

%token NAME

%%

text : defs term {return {macros: $1, term: $2};}
     ;
defs : /* empty */ {$$ = [];}
     | defs NAME '=' term ';' {$1.unshift({id: $2, def: $4}); $$ = $1;}
     ;
term : appl
     | abst
     ;
abst : NAME ',' abst {$$ = {}; $$[$1] = $3;}
     | NAME ':' term {$$ = {}; $$[$1] = $3;}
     ;
appl :      atom
     | appl atom {$$ = [$1, $2];}
     ;
atom : '(' term ')' {$$ = $2;}
     |     NAME     {$$ = yytext;}
     ;
