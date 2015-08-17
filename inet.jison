%lex

%%

\s+ /* skip whitespace */

\{[^}]+\} return "CODE";

[A-Za-z][A-Za-z0-9]* return "NAME";

"$$" return "MARK";
";" return ";";
"[" return "[";
"]" return "]";
"(" return "(";
")" return ")";
"," return ",";
"\\" return "\\";
"_" return "_";
"=" return "=";

/lex

%token MARK NAME CODE

%%

prog : rset MARK init {return {rules: $1, conf: $3};}
     ;
rset : /* empty */ {$$ = [];}
     | rset side CODE side ';' {$1.push({left: $2, right: $4}); $$ = $1;}
     ;
side : cell {$$ = {node: $1, pax: []};}
     | cell '[' list ']' {$$ = {node: $1, pax: $3};}
     ;
tree : leaf {$$ = {node: $1, pax: []};}
     | cell '(' list ')' {$$ = {node: $1, pax: $3};}
     ;
list : tree {$$ = [$1];}
     | tree ',' list {$3.unshift($1); $$ = $3;}
     ;
leaf : cell
     | NAME {$$ = {agent: "wire", name: $1};}
     ;
cell : '\' NAME {$$ = {agent: $2, code: ""};}
     | '\' NAME '_' CODE {$$ = {agent: $2, code: $4};}
     ;
init : /* empty */ {$$ = [];}
     | tree '=' tree ';' init {$5.push({left: $1, right: $3}); $$ = $5;}
     ;
