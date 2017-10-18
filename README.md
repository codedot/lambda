This package implements the lambda calculus using
interaction nets, providing CLI and API.

Its browserified version is available as [an online demo][1].

[1]: https://codedot.github.io/lambda/

# Algorithms

The following encodings of the lambda calculus are included:

* `abstract`, an experimental algorithm based on
the ideas from [arXiv:1701.04691v2][6],
this is the default algorithm;

* `closed`, the approach of [arXiv:1304.2290v8][2] applied to
[_An Interaction Net Implementation of Closed Reduction_][3]
by Ian Mackie;

* `optimal`, an implementation of
[_Lambdascope_][5] by Vincent van Oostrom et al;

The embedded read-back mechanism is described
in Section 7 of [10.4204/EPTCS.225.7][4].

[2]: https://arxiv.org/abs/1304.2290v8
[3]: http://dx.doi.org/10.1007/978-3-642-24452-0_3
[4]: http://dx.doi.org/10.4204/EPTCS.225.7
[5]: http://www.phil.uu.nl/~oostrom/publication/pdf/lambdascope.pdf
[6]: https://arxiv.org/abs/1701.04691v2

# Benchmarks

The following is output of the `test.sh` script provided in the package:

```
SAMPLE          ABSTRACT         CLOSED        OPTIMAL
counter             27/4           58/6          143/4
w2eta               37/7         137/16          205/7
22210ii           731/70       1740/182        7886/70
3222ii           1182/43       5896/545      164197/43
1022ii           4298/59     23026/2085     2489461/59
4222ii         262401/64 1442259/131124            N/A
222210ii     2359812/201 6685119/655415            N/A
cfact4          3711/691      15506/887      56890/691
yfact4          4168/760     24150/1741     526971/760
cfact5       69147/13462   799868/16170  3074471/13462
yfact5       69780/13550   857864/22267            N/A
```

`T/B` should be read as total of `T` interactions,
of which `B` were β-reductions.

# CLI

This package provides the `lambda` command with the following interface:

```
Usage: lambda [options] (<term> | -f <file>)

Options:
  --algo, -a     Select algorithm         [string]
  --debug, -d    Evaluate step by step   [boolean]
  --file, -f     Read term from file     [boolean]
  --inet, -i     Show interaction net    [boolean]
  --limit, -l    Limit interactions       [number]
  --perf, -p     Print benchmarks        [boolean]
  --stats, -s    Save statistics to file  [string]
  --term, -t     Output expanded term    [boolean]
  --help, -h     Show help               [boolean]
  --version, -v  Show version number     [boolean]

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
