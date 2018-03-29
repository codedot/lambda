set -x

alias lambda="node lambda -l 10000"

lambda "((v0: ((v0 v0) v0)) (v0: (v1: (v0 (v2: (v1 (v0 v2)))))))"
lambda "((v0: (v0 (v0 v0))) (v0: (v1: (v0 (v2: (v1 (v0 v2)))))))"
lambda "((v0: (v0 v0)) (v0: (v0 (v1: (v0 (v2: (v1 (v0 v2))))))))"
lambda "(2: (M: (y: M) M (x: x)) (h: 2 2 (z, t: h ((x: z) z t)))) (f, x: f (f x))"
lambda "(w: w (v0: (v1: (v0 (v2: (v1 (v0 v2)))))) w) (x: x x)"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v0 (v2: (v1 (v0 v2))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v2: (v3: (v1 (v1 (v0 v3)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v2: (v3: (v2 (v2 (v1 v3)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v2: ((v1 (v0 (v0 v2))) v1))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v2: (v0 (v3: (v1 (v0 v3)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v2: (v0 (v3: (v2 (v0 v3)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v2: (v1 (v3: (v2 (v1 v3)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v2: (v1 ((v0 (v0 v2)) v1)))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v0 (v2: (v1 (v3: (v0 v2)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v0 (v0 (v2: (v1 (v0 v2)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v1: (v1 (v0 (v2: (v1 (v0 v2)))))))))"
lambda "(x: x x) ((x: x x) ((x: x x) (v0: (v0 (v1: (v0 (v2: (v1 (v0 v2)))))))))"
lambda "(x: x x x x x x) (g, j, y: g (f, x: j f (y f x)))"
lambda "(v1: v1 v1 v1 v1) (g, j, y: g (f, x: j f (y f x)))"
lambda "(I: (2: (M: 2 M 2 I I) (f, x: 2 f (h, u: x h (h u)))) (f, x: f (f x))) (x: x)"
lambda "(2: (M: M M) (h: 2 2 (z, t: h (z z t)))) (f, x: f (f x))"
lambda "(v0: ((v1: (v1 v1)) (v1: (v0 (v2: v1)))))"

exit
