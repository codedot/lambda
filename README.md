This package implements the pure untyped lambda calculus using
interaction nets, providing both CLI and API.

# CLI

This package provides a `lambda` command with the following interface:

```
Usage: lambda [options] (<file> | -e <expr>)

Options:
  --algo, -a     Choose an algorithm                          [string]
  --inet, -i     Show interaction net                        [boolean]
  --term, -t     Output the term being evaluated             [boolean]
  --perf, -p     Print benchmarks                            [boolean]
  --expr, -e     Process the argument as expression          [boolean]
  --debug, -d    Enable step-by-step evaluation              [boolean]
  --stats, -s    Write statistics to a file                   [string]
  --help, -h     Show help                                   [boolean]
  --version, -v  Show version number                         [boolean]

```

# Combinators

The command-line interface predefines commonly used combinators:

```
I = x: x;
K = x, y: x;
S = x, y, z: x z (y z);
T = K;
F = K I;
AND = p, q: p q F;
OR = p, q: p T q;
NOT = p: (a, b: p b a);
C0 = f, x: x;
C1 = f, x: f x;
C2 = f, x: f (f x);
C3 = f, x: f (f (f x));
C4 = f, x: f (f (f (f x)));
C5 = f, x: f (f (f (f (f x))));
C6 = f, x: f (f (f (f (f (f x)))));
C7 = f, x: f (f (f (f (f (f (f x))))));
C8 = f, x: f (f (f (f (f (f (f (f x)))))));
C9 = f, x: f (f (f (f (f (f (f (f (f x))))))));
C10 = f, x: f (f (f (f (f (f (f (f (f (f x)))))))));
SUCC = n: (f, x: f (n f x));
PLUS = m, n: (f, x: m f (n f x));
MULT = m, n: (f: m (n f));
EXP = m, n: n m;
PRED = n: (f, x: n (g, h: h (g f)) (K x) I);
MINUS = m, n: n PRED m;
ZERO = n: n (K F) T;
Y = (a: a a) (self, f: f (self self f));
```

# API

`require("@alexo/lambda")` returns a function of a lambda term defined
in a variant of the lambda calculus called Macro Lambda Calculus (MLC)
that allows macro definitions in order to input complex expressions.
The last term in the input is the term whose normal form is to be found.

For developing and testing purposes, the package also exports
two additional functions `.prepare(term)` and `.debug()`.
The `.debug()` function applies a single reduction step to
the interaction net compiled by the previous `.prepare()`
call and returns a human-readable string representation of
the current interaction net state.

# Grammar

Input consists of an optional list of macro definitions and a term.

```
%token NAME /* [A-Za-z][A-Za-z0-9]* */

%%

text : defs term
     ;
defs : /* empty */
     | defs NAME '=' term ';'
     ;
term : appl
     | abst
     ;
abst : NAME ',' abst
     | NAME ':' term
     ;
appl :      atom
     | appl atom
     ;
atom : '(' term ')'
     |     NAME
     ;
```

# License

Copyright (c) 2017 Anton Salikhmetov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
