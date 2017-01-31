This package implements the pure untyped lambda calculus using
interaction nets, providing both CLI and API.

Its browserified version is available as an online demo:

[https://codedot.github.io/lambda/](https://codedot.github.io/lambda/)

# Algorithms

The following encodings of the lambda calculus are included:

* `normal`, a domino-effect-based version of
[_Token-Passing Nets: Call-by-Need for Free_][1]
(François-Régis Sinot), described in [arXiv:1304.2290v8][2]
(this is the default algorithm);

* `closed`, a version of `normal` based on
[_An Interaction Net Implementation of Closed Reduction_][3]
(Ian Mackie);

* `optimal`, the approach of [10.4204/EPTCS.225.7][4]
applied to [_Lambdascope_][5] (Vincent van Oostrom et al);

* `abstract`, an experimental version of
Lamping's abstract algorithm, described in [arXiv:1701.04691v2][6].

All versions include the embedded read-back mechanism described
in Section 7 of [10.4204/EPTCS.225.7][4].

[1]: http://dx.doi.org/10.1016/j.entcs.2005.09.027
[2]: https://arxiv.org/abs/1304.2290v8
[3]: http://dx.doi.org/10.1007/978-3-642-24452-0_3
[4]: http://dx.doi.org/10.4204/EPTCS.225.7
[5]: http://www.phil.uu.nl/~oostrom/publication/pdf/lambdascope.pdf
[6]: https://arxiv.org/abs/1701.04691v2

# CLI

This package provides the `lambda` command with the following interface:

```
Usage: lambda [options] (<file> | -e <expr>)

Options:
  --algo, -a     Select algorithm                             [string]
  --debug, -d    Enable step-by-step evaluation              [boolean]
  --expr, -e     Process argument as expression              [boolean]
  --inet, -i     Show interaction net                        [boolean]
  --perf, -p     Print benchmarks                            [boolean]
  --stats, -s    Write statistics to file                     [string]
  --term, -t     Output expanded term                        [boolean]
  --help, -h     Show help                                   [boolean]
  --version, -v  Show version number                         [boolean]

```

# Combinators

CLI predefines a number of commonly used combinators:

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

Input consists of an optional list of macro definitions and a term:

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
