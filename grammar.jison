%lex

%%

"#".* /* skip comment */
\s+ /* skip whitespace */

[^#=;,:()\s]+ return "NAME";

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
     | defs name '=' term ';' {$1.unshift({id: $2, def: $4}); $$ = $1;}
     ;
term : appl
     | abst
     ;
abst : name ',' abst {$$ = {node: "abst", var: $1, body: $3};}
     | name ':' term {$$ = {node: "abst", var: $1, body: $3};}
     ;
appl :      atom
     | appl atom {$$ = {node: "appl", left: $1, right: $2};}
     ;
atom : '(' term ')' {$$ = $2;}
     |     name     {$$ = {node: "atom", name: $1};}
     ;
name : NAME {$$ = JSON.stringify($1);}
     ;
