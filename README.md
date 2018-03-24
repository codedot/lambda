This package implements the lambda calculus using
interaction nets, providing CLI and API.

Its browserified version is available as [an online demo][1].

[1]: https://codedot.github.io/lambda/

# Algorithms

The following encodings of the lambda calculus are included:

* `abstract`, an impure solution to the problem of matching fans
in [Lamping's abstract algorithm][7],
described in [arXiv:1710.07516][6],
this is the default algorithm;

* `closed`, the approach of [arXiv:1304.2290][2] applied to
[_An Interaction Net Implementation of Closed Reduction_][3]
by Ian Mackie;

* `optimal`, an implementation of
[_Lambdascope_][5] by Vincent van Oostrom et al;

* `standard`, an implementation of optimal reduction as in
[_The Optimal Implementation of Functional Programming Languages_][8],
pp. 40-41.

The embedded read-back mechanism is described
in Section 7 of [10.4204/EPTCS.225.7][4].

[2]: https://arxiv.org/abs/1304.2290
[3]: http://dx.doi.org/10.1007/978-3-642-24452-0_3
[4]: http://dx.doi.org/10.4204/EPTCS.225.7
[5]: http://www.phil.uu.nl/~oostrom/publication/pdf/lambdascope.pdf
[6]: https://arxiv.org/abs/1710.07516
[7]: https://doi.org/10.1145/96709.96711
[8]: https://books.google.com/books?id=Bod5HbPh-WwC

# Benchmarks

The following is output of the `test.sh` script provided in the package:

```
SAMPLE          ABSTRACT         CLOSED        OPTIMAL       STANDARD
counter             27/4           58/6          161/4          121/4
w2eta               37/7         137/16          207/7          374/7
1021              199/55     11871/1088     1599877/55     4307803/55
22210i            494/68       2539/254       58603/68            N/A
3222i            1206/50       8638/819      804530/50            N/A
1022i            4317/69     33369/3139            N/A            N/A
2222101   2621862/327818            N/A            N/A            N/A
facty6nt        1112/210     80562/2436    2790152/210    3013433/210
facty9i         1629/287 3746232/130949            N/A            N/A
33-fact4        3770/704      16114/912      80708/704     234075/704
fibo16nt      24931/3042    134135/5673   5462375/3042   8959455/3042
fact100i      28502/3752   121854/10565            N/A            N/A
35-fact5     72944/13480   805218/16206  4702711/13480            N/A
fibo20i       93534/6863   536843/24626   1961508/6863   4023117/6863
fact1knt 6215039/1353692            N/A            N/A            N/A
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
  --exec, -e     Process m4(1) macros    [boolean]
  --file, -f     Read term from file     [boolean]
  --inet, -i     Show interaction net    [boolean]
  --limit, -l    Limit interactions       [number]
  --macros, -m   Read macros from file    [string]
  --perf, -p     Print benchmarks        [boolean]
  --stats, -s    Save statistics to file  [string]
  --term, -t     Output expanded term    [boolean]
  --help, -h     Show help               [boolean]
  --version, -v  Show version number     [boolean]

```

# Combinators

CLI predefines a number of commonly used combinators:

```
# Common combinators
I = x: x;
K = x, y: x;
S = x, y, z: x z (y z);
Y = (a: a a) (a, f: f (a a f));

# Booleans
T = K;
F = K I;
Not = p, a, b: p b a;
And = p, q: p q F;
Or = p, q: p T q;
Xor = p, q: p Not I q;

# Pairs/lists
[] = K T;
[]? = l: l (h, t: F);
Cons = h, t, x: x h t;
Head = l: l T;
Tail = l: l F;

# Church arithmetic
+1 = n, f, x: f (n f x);
+ = m, n, f, x: m f (n f x);
* = m, n, f: m (n f);
^ = m, n: n m;
-1 = n, f, x: n (g, h: h (g f)) (K x) I;
- = m, n: n -1 m;
0? = n: n (K F) T;

# Church numerals
0 = f, x: x;
1 = f, x: f x;
2 = +1 1;
3 = +1 2;
4 = ^ 2 2;
5 = + 2 3;
6 = * 2 3;
7 = +1 6;
8 = ^ 2 3;
9 = ^ 3 2;
10 = * 2 5;
16 = ^ 2 4;
20 = * 2 10;
30 = * 3 10;
32 = ^ 2 5;
64 = ^ 2 6;
100 = ^ 10 2;
128 = ^ 2 7;
256 = ^ 2 8;
512 = ^ 2 9;
1k = ^ 10 3;
1ki = ^ 2 10;
1m = ^ 10 6;
1mi = ^ 2 20;
1g = ^ 10 9;
1gi = ^ 2 30;

# Recursive functions
FactY = Y (f, n: (0? n) 1 (* (f (-1 n)) n));
Fact = n: n (f, i: * (f (+1 i)) i) (K 1) 1;
Fibo = n: n (f, a, b: f (+ a b) a) F 1 0;
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
%token NAME

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
