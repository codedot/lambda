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
abst : NAME ',' abst {$$ = {node: "abst", var: $1, body: $3};}
     | NAME ':' term {$$ = {node: "abst", var: $1, body: $3};}
     ;
appl :      atom
     | appl atom {$$ = {node: "appl", left: $1, right: $2};}
     ;
atom : '(' term ')' {$$ = $2;}
     |     NAME     {$$ = {node: "atom", name: yytext};}
     ;
