Exhaustive search through MLC inputs

# Usage

```
node generate.js min max >file.txt
node compute.js algo limit min max >file.tsv
tail -f -n +1 file.tsv | awk -f stats.awk
paste left.tsv right.tsv | awk -f diff.awk
```

where

* `algo` is the MLC algorithm to use;
* `limit` is the maximum number of interactions per term;
* `min`/`max` is the minimum/maximum size for terms,

and

```
size(x) = 0;
size(x: M) = 1 + size(M);
size(M N) = 1 + size(M) + size(N).
```

* * *

The idea was suggested by Gabriel Scherer:
http://lambda-the-ultimate.org/node/5487

Number of closed lambda-terms of size n with size 0 for the variables:
http://oeis.org/A220894
