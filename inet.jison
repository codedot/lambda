%lex

%{
#include "y.tab.h"

#include "compiler.h"

static int tail;
%}

%X TAIL

%%

[ \t\n]+ ;

\{[^}]+\} {
	char *text = &yytext[1];
	int leng = yyleng - 2;

	yylval.text = chkptr(strndup(text, leng), "strndup");
	return CODE;
}

<TAIL>(.|\n)* {
	yylval.text = STRDUP(yytext);
	return CODE;
}

\$\$[ \t\n]* {
	if (tail)
		BEGIN TAIL;

	++tail;
	return MARK;
}

[A-Za-z][A-Za-z0-9]* {
	yylval.text = STRDUP(yytext);
	return NAME;
}

. return yytext[0];

/lex

%{
#include "compiler.h"
%}

%union {
	char *text;
	struct tree *tree;
	struct list *list;
	struct node *node;
}

%token MARK NAME CODE

%type <text> head NAME CODE
%type <tree> side tree
%type <list> list init
%type <node> leaf cell

%%

prog : head rset MARK init tail {putinit($4); puthead($1);}
     ;
head : /* empty */ {$$ = STRDUP("");}
     | '$' CODE '$' {$$ = $2;}
     ;
rset : /* empty */
     | rset side CODE side ';' {putrule($2, $4, $3);}
     ;
side : cell {$$ = mktree($1, NULL);}
     | cell '[' list ']' {$$ = mktree($1, $3);}
     ;
tree : leaf {$$ = mktree($1, NULL);}
     | cell '(' list ')' {$$ = mktree($1, $3);}
     ;
list : tree {$$ = mklist($1, NULL);}
     | tree ',' list {$$ = mklist($1, $3);}
     ;
leaf : cell
     | NAME {$$ = mknode(NULL, NULL, $1);}
     | CODE {$$ = mknode(NULL, $1, NULL);}
     ;
cell : '\\' NAME {$$ = mknode($2, NULL, NULL);}
     | '\\' NAME '_' CODE {$$ = mknode($2, $4, NULL);}
     ;
init : /* empty */ {$$ = NULL;}
     | tree '=' tree ';' init {$$ = mklist($1, mklist($3, $5));}
     ;
tail : /* empty */
     | MARK
     | MARK CODE {fprintf(inc, "%s\n", $2); free($2);}
     ;

%%

int yyerror(const char *msg)
{
	fprintf(stderr, "%s\n", msg);
	return 0;
}
