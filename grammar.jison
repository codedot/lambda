%lex

%%

"{"[^}]*"}" /* skip comment */
"#".* /* skip comment */
\s+ /* skip whitespace */

[^{}#=;,:()\s]+ return "NAME";

"=" return "=";
";" return ";";
"," return ",";
":" return ":";
"(" return "(";
")" return ")";
<<EOF>> return "EOF";

/lex

%token NAME

%%

text : defs term EOF {return {macros: $1, term: $2};}
     ;
defs : /* empty */ {$$ = [];}
     | defs NAME '=' term ';' {$1.unshift({id: $2, def: $4}); $$ = $1;}
     ;
term : appl
     | abst
     ;
abst : NAME ',' abst {$$ = {node: "abst", bound: $1, body: $3};}
     | NAME ':' term {$$ = {node: "abst", bound: $1, body: $3};}
     ;
appl :      atom
     | appl atom {$$ = {node: "appl", left: $1, right: $2};}
     ;
atom : '(' term ')' {$$ = $2;}
     |     NAME     {$$ = {node: "atom", name: yytext};}
     ;
