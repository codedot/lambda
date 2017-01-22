This package implements the pure untyped lambda calculus using
interaction nets, providing both CLI and API described below.

# CLI

This package provides a `lambda` command with the following interface:

```
Usage: lambda [file]

Options:
  --help, -h     Show help                                   [boolean]
  --version, -v  Show version number                         [boolean]

```

# API

`require("@alexo/lambda")` returns a function of a lambda term defined
in a variant of the lambda calculus called Macro Lambda Calculus (MLC)
that allows macro definitions in order to input complex expressions.
The last term in the input is the term whose normal form is to be found.

For developing and testing purposes, the package also exports
two additional functions `.prepare(term)` and `.debug()`.
The `.debug()` function applies a single reduction step to
the interaction net compiled by the previous `.prepare(src, fmt)`
call and returns a human-readable string representation of
the current interaction net state.

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
