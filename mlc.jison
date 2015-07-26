%lex

%{
#include "y.tab.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
%}

%%

---.* |
[ \t\n]+ ;

[A-Za-z][A-Za-z0-9]* {
	char *name = strdup(yytext);

	if (!name) {
		perror("strdup");
		exit(EXIT_FAILURE);
	}

	yylval.name = name;
	return NAME;
}

. return yytext[0];

/lex

%{
#include "def.h"

#include <stdlib.h>
%}

%union {
	char *name;
	struct expr *expr;
}

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

%%

#include <locale.h>
#include <search.h>
#include <stdio.h>

#ifndef HASHNEL
#define HASHNEL 10000
#endif

int main(int argc, char *argv[])
{
	if (!hcreate(HASHNEL)) {
		perror("hcreate");
		exit(EXIT_FAILURE);
	}

	setlocale(LC_ALL, "");
	return yyparse();
}

int yyerror(const char *msg)
{
	fprintf(stderr, "%s\n", msg);
	return 0;
}
