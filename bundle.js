(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var mlc = require("./lambda");


var parser = new mlc.Parser();
var system = "\\print {\n\t/* Output results of read-back. */\n\tthis.nf = M;\n\t++this.total;\n} \\atom_{M};\n\n\\read_{C}[a] {\n\t/* Unshare variable. */\n\t++this.total;\n} \\share[\\copy(b, \\read_{C}(a)), b];\n\n\\read_{C}[a] {\n\t/* Initiate application. */\n\t++this.total;\n} \\apply[\\lambda(b, \\read_{C}(a)), b];\n\n\\read_{C}[a] {\n\t/* Read back abstraction. */\n\t++this.total;\n} \\lambda[\\atom_{this.mkid()}, \\read_{this.abst(C)}(a)];\n\n\\lambda[\\read_{this.appl(M)}(a), a] {\n\t/* Read back application. */\n\t++this.total;\n} \\atom_{M};\n\n\\read_{C}[\\atom_{this.atom(C, M)}] {\n\t/* Read back an atom. */\n\t++this.total;\n} \\atom_{M};\n\n\\copy[\\atom_{M}, \\atom_{M}] {\n\t/* Copy an atom. */\n\t++this.total;\n} \\atom_{M};\n\n\\dup[\\atom_{M}, \\atom_{M}] {\n\t/* Duplicate an atom. */\n\t++this.total;\n} \\atom_{M};\n\n\\lambda[a, b] {\n\t/* Unshare variable. */\n\t++this.total;\n} \\share[\\copy(c, \\lambda(a, b)), c];\n\n\\lambda[a, b] {\n\t/* Initiate application. */\n\t++this.total;\n} \\apply[\\lambda(c, \\lambda(a, b)), c];\n\n\\lambda[a, b] {\n\t/* Apply a closed term. */\n\t++this.beta;\n\t++this.total;\n} \\lambda[a, b];\n\n\\copy[a, b] {\n\t/* Unshare variable. */\n\t++this.total;\n} \\share[\\copy(c, \\copy(a, b)), c];\n\n\\copy[a, b] {\n\t/* Initiate application. */\n\t++this.total;\n} \\apply[\\lambda(c, \\copy(a, b)), c];\n\n\\copy[\\lambda(a, b), \\lambda(c, d)] {\n\t/* Initiate copy of a closed term. */\n\t++this.total;\n} \\lambda[\\dup(a, c), \\dup(b, d)];\n\n\\dup[a, b] {\n\t/* Unshare variable. */\n\t++this.total;\n} \\share[\\copy(c, \\dup(a, b)), c];\n\n\\dup[a, b] {\n\t/* Duplicate sharing. */\n\t++this.total;\n} \\copy[\\dup(\\amb(c, \\share(a, d), d), \\amb(e, \\share(b, f), f)),\n\t\\dup(c, e)];\n\n\\dup[\\apply(a, b), \\apply(c, d)] {\n\t/* Duplicate application. */\n\t++this.total;\n} \\apply[\\dup(a, c), \\dup(b, d)];\n\n\\dup[\\lambda(a, b), \\lambda(c, d)] {\n\t/* Duplicate abstraction. */\n\t++this.total;\n} \\lambda[\\dup(a, c), \\dup(b, d)];\n\n\\dup[a, b] {\n\t/* Finish duplication. */\n\t++this.total;\n} \\dup[a, b];\n\n\\erase {\n\t/* Erase an atom. */\n\t++this.total;\n} \\atom_{M};\n\n\\erase {\n\t/* Erase sharing. */\n\t++this.total;\n} \\share[a, a];\n\n\\erase {\n\t/* Erase application. */\n\t++this.total;\n} \\apply[\\erase, \\erase];\n\n\\erase {\n\t/* Erase abstraction. */\n\t++this.total;\n} \\lambda[\\erase, \\erase];\n\n\\erase {\n\t/* Erase copy initiator. */\n\t++this.total;\n} \\copy[\\erase, \\erase];\n\n\\erase {\n\t/* Erase duplicator. */\n\t++this.total;\n} \\dup[\\erase, \\erase];\n\n\\erase {\n\t/* Finish erasing. */\n\t++this.total;\n} \\erase;\n\n$$\n\nINCONFIG\n\n$$\n\nvar id = 0;\n\nfunction mkvar(fresh)\n{\n\tif (fresh)\n\t\t++id;\n\n\treturn \"v\" + id.toFixed(0);\n}\n\nfunction mkid(name)\n{\n\tvar obj = {\n\t\tnode: \"atom\",\n\t\tname: name ? name : mkvar(true)\n\t};\n\n\treturn obj;\n}\n\nfunction mkhole()\n{\n\tvar obj = {};\n\n\tobj.hole = obj;\n\treturn obj;\n}\n\nfunction atom(context, obj)\n{\n\tvar hole = context.hole;\n\tvar key;\n\n\tfor (key in obj)\n\t\thole[key] = obj[key];\n\n\tcontext.hole = obj.hole;\n\treturn context;\n}\n\nfunction abst(context)\n{\n\tvar hole = mkhole();\n\tvar obj = {\n\t\tnode: \"abst\",\n\t\tvar: mkvar(),\n\t\tbody: hole,\n\t\thole: hole\n\t};\n\n\treturn atom(context, obj);\n}\n\nfunction appl(left)\n{\n\tvar context = mkhole();\n\tvar hole = mkhole();\n\tvar obj = {\n\t\tnode: \"appl\",\n\t\tleft: left,\n\t\tright: hole,\n\t\thole: hole\n\t};\n\n\treturn atom(context, obj);\n}\n\nthis.mkid = mkid;\nthis.mkvar = mkvar;\nthis.mkhole = mkhole;\nthis.abst = abst;\nthis.appl = appl;\nthis.atom = atom;\nthis.beta = 0;\nthis.total = 0;\n";
var lastwire;

function getcap(left, right)
{
	var dict = {};
	var prop;

	for (prop in left)
		if (prop in right)
			dict[prop] = left[prop];

	return dict;
}

function merge(left, right)
{
	var dict = {};
	var prop;

	for (prop in left)
		dict[prop] = left[prop];

	for (prop in right)
		dict[prop] = right[prop];

	return dict;
}

function getfv(obj, fv)
{
	var node = obj.node;

	if ("atom" == node) {
		var fv = {};

		if (!obj.free)
			fv[obj.name] = true;

		return fv;
	} else if ("abst" == node) {
		var fv = getfv(obj.body);

		delete fv[obj.var];
		return fv;
	} else if ("appl" == node) {
		var left = getfv(obj.left);
		var right = getfv(obj.right);
		var fv = merge(left, right);

		return fv;
	}
}

function obj2mlc(obj)
{
	var node = obj.node;

	if ("atom" == node)
		return obj.name;

	if ("abst" == node) {
		var body = obj2mlc(obj.body);
		var sep;

		if ("abst" == obj.body.node)
			sep = ", ";
		else
			sep = ": ";

		return obj.var + sep + body;
	}

	if ("appl" == node) {
		var left = obj2mlc(obj.left);
		var right = obj2mlc(obj.right);

		if ("abst" == obj.left.node)
			left = "(" + left + ")";

		if ("abst" == obj.right.node)
			right = "(" + right + ")";

		if ("appl" == obj.right.node)
			right = "(" + right + ")";

		return left + " " + right;
	}

	return "[ ]";
}

function mkwire()
{
	++lastwire;
	return "w" + lastwire.toFixed(0);
}

function subst(obj, shared, side)
{
	var node = obj.node;

	if ("atom" == node) {
		var name = obj.name;

		if (name in shared) {
			var entry = shared[name];

			obj.name = entry[side];
		}
	} else if ("abst" == node) {
		var body = obj.body;

		subst(body, shared, side);
	} else if ("appl" == node) {
		subst(obj.left, shared, side);
		subst(obj.right, shared, side);
	}
}

function mktwins(left, right)
{
	var fvleft = getfv(left);
	var fvright = getfv(right);
	var shared = getcap(fvleft, fvright);
	var atom;

	for (atom in shared) {
		var wleft = mkwire();
		var wright = mkwire();

		shared[atom] = {
			left: wleft,
			right: wright
		};
	}

	subst(left, shared, "left");
	subst(right, shared, "right");

	return shared;
}

function psi(shared)
{
	var list = [];
	var template = "%s = \\amb(%s, \\share(%s, %s), %s)";
	var atom;

	for (atom in shared) {
		var twins = shared[atom];
		var wleft = twins.left;
		var wright = twins.right;
		var wire = mkwire();
		var eqn = template;

		eqn = eqn.replace("%s", wleft);
		eqn = eqn.replace("%s", wright);
		eqn = eqn.replace("%s", atom);
		eqn = eqn.replace("%s", wire);
		eqn = eqn.replace("%s", wire);

		list.push(eqn);
	}

	return list;
}

function gamma(obj, root)
{
	var list = [];
	var node = obj.node;
	var eqn = root + " = %s";

	if ("atom" == node) {
		var agent = "\\atom_{this.mkid(\"%s\")}";

		if (obj.free)
			agent = agent.replace("%s", obj.name);
		else
			agent = obj.name;

		eqn = eqn.replace("%s", agent);
		list.push(eqn);
	} else if ("abst" == node) {
		var tree = "\\lambda(%s, %s)";
		var body = obj.body;
		var fv = getfv(body);
		var id = obj.var;
		var wire = mkwire();

		if (id in fv)
			agent = id;
		else
			agent = "\\erase";

		tree = tree.replace("%s", agent);
		tree = tree.replace("%s", wire);
		eqn = eqn.replace("%s", tree);
		list.push(eqn);

		body = gamma(body, wire);
		list = list.concat(body);
	} else if ("appl" == node) {
		var wleft = mkwire();
		var wright = mkwire();
		var agent = "\\apply(%s, %s)";
		var left = obj.left;
		var right = obj.right;
		var shared = mktwins(left, right);

		agent = agent.replace("%s", wleft);
		agent = agent.replace("%s", wright);
		eqn = eqn.replace("%s", agent);
		list.push(eqn);

		left = gamma(left, wleft);
		right = gamma(right, wright);
		shared = psi(shared);
		list = list.concat(left, right, shared);
	}

	return list;
}

function alpha(obj, bv)
{
	var node = obj.node;

	if (!bv)
		bv = {};

	if ("atom" == node) {
		var name = obj.name;

		if (name in bv) {
			obj = {
				node: "atom",
				name: bv[name],
				free: false
			};
		} else {
			obj = {
				node: "atom",
				name: name,
				free: true
			};
		}
	} else if ("abst" == node) {
		var id = obj.var;
		var wire = mkwire();
		var old = bv[id];
		var body;

		bv[id] = wire;
		body = alpha(obj.body, bv);
		delete bv[id];

		if (old)
			bv[id] = old;

		obj = {
			node: "abst",
			var: wire,
			body: body
		};
	} else if ("appl" == node) {
		var left = alpha(obj.left, bv);
		var right = alpha(obj.right, bv);

		obj = {
			node: "appl",
			left: left,
			right: right
		};
	}

	return obj;
}

function getconf(obj)
{
	var conf;

	lastwire = 0;

	obj = alpha(obj);
	conf = gamma(obj, "root");
	conf.push("\\read_{this.mkhole()}(\\print) = root");
	return conf;
}

function encode(mlc)
{
	var dict = parser.parse(mlc);
	var macros = dict.macros;
	var term = dict.term;
	var inconfig = "";
	var eqns, i;

	for (i = 0; i < macros.length; i++) {
		var macro = macros[i];
		var id = macro.id;
		var def = macro.def;

		term = {
			node: "appl",
			left: {
				node: "abst",
				var: id,
				body: term
			},
			right: def
		};
	}

	encode.term = obj2mlc(term);

	eqns = getconf(term);

	for (i = 0; i < eqns.length; i++)
		inconfig = inconfig.concat(eqns[i] + ";\n");

	return system.replace("INCONFIG\n", inconfig);
}

encode.obj2mlc = obj2mlc;

module.exports = encode;

},{"./lambda":2}],2:[function(require,module,exports){
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[6,14],$V1=[1,8],$V2=[2,11],$V3=[1,10],$V4=[1,11],$V5=[1,8,15],$V6=[1,6,8,14,15],$V7=[1,15];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"text":3,"defs":4,"term":5,"NAME":6,"=":7,";":8,"appl":9,"abst":10,",":11,":":12,"atom":13,"(":14,")":15,"$accept":0,"$end":1},
terminals_: {2:"error",6:"NAME",7:"=",8:";",11:",",12:":",14:"(",15:")"},
productions_: [0,[3,2],[4,0],[4,5],[5,1],[5,1],[10,3],[10,3],[9,1],[9,2],[13,3],[13,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return {macros: $$[$0-1], term: $$[$0]};
break;
case 2:
this.$ = [];
break;
case 3:
$$[$0-4].unshift({id: $$[$0-3], def: $$[$0-1]}); this.$ = $$[$0-4];
break;
case 6: case 7:
this.$ = {node: "abst", var: $$[$0-2], body: $$[$0]};
break;
case 9:
this.$ = {node: "appl", left: $$[$0-1], right: $$[$0]};
break;
case 10:
this.$ = $$[$0-1];
break;
case 11:
this.$ = {node: "atom", name: yytext};
break;
}
},
table: [o($V0,[2,2],{3:1,4:2}),{1:[3]},{5:3,6:[1,4],9:5,10:6,13:7,14:$V1},{1:[2,1]},o([1,6,14],$V2,{7:[1,9],11:$V3,12:$V4}),o($V5,[2,4],{13:12,6:[1,13],14:$V1}),o($V5,[2,5]),o($V6,[2,8]),{5:14,6:$V7,9:5,10:6,13:7,14:$V1},{5:16,6:$V7,9:5,10:6,13:7,14:$V1},{6:[1,18],10:17},{5:19,6:$V7,9:5,10:6,13:7,14:$V1},o($V6,[2,9]),o($V6,$V2),{15:[1,20]},o($V6,$V2,{11:$V3,12:$V4}),{8:[1,21]},o($V5,[2,6]),{11:$V3,12:$V4},o($V5,[2,7]),o($V6,[2,10]),o($V0,[2,3])],
defaultActions: {3:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return "NAME";
break;
case 2:return "=";
break;
case 3:return ";";
break;
case 4:return ",";
break;
case 5:return ":";
break;
case 6:return "(";
break;
case 7:return ")";
break;
}
},
rules: [/^(?:\s+)/,/^(?:[A-Za-z][A-Za-z0-9]*)/,/^(?:=)/,/^(?:;)/,/^(?:,)/,/^(?::)/,/^(?:\()/,/^(?:\))/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
module.exports = parser;

},{}],3:[function(require,module,exports){
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[5,21],$V1=[1,6],$V2=[1,5,20,21],$V3=[9,10],$V4=[1,16],$V5=[9,10,12,14,17,18,19,23],$V6=[10,14,18,19,23],$V7=[1,26],$V8=[14,18,19];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"prog":3,"rset":4,"MARK":5,"init":6,"tail":7,"side":8,"CODE":9,";":10,"cell":11,"[":12,"list":13,"]":14,"tree":15,"leaf":16,"(":17,")":18,",":19,"NAME":20,"\\":21,"_":22,"=":23,"$accept":0,"$end":1},
terminals_: {2:"error",5:"MARK",9:"CODE",10:";",12:"[",14:"]",17:"(",18:")",19:",",20:"NAME",21:"\\",22:"_",23:"="},
productions_: [0,[3,4],[4,0],[4,5],[8,1],[8,4],[15,1],[15,4],[13,1],[13,3],[16,1],[16,1],[11,2],[11,4],[6,0],[6,5],[7,0],[7,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return {rules: $$[$0-3], conf: $$[$0-1], code: $$[$0]};
break;
case 2: case 14:
this.$ = [];
break;
case 3:
$$[$0-4].push({left: $$[$0-3], right: $$[$0-1], code: $$[$0-2]}); this.$ = $$[$0-4];
break;
case 4: case 6:
this.$ = {node: $$[$0], pax: []};
break;
case 5: case 7:
this.$ = {node: $$[$0-3], pax: $$[$0-1]};
break;
case 8:
this.$ = [$$[$0]];
break;
case 9:
$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 11:
this.$ = {agent: "wire", name: $$[$0]};
break;
case 12:
this.$ = {agent: $$[$0], code: ""};
break;
case 13:
this.$ = {agent: $$[$0-2], code: $$[$0].slice(1, -1)};
break;
case 15:
$$[$0-4].push({left: $$[$0-3], right: $$[$0-1]}); this.$ = $$[$0-4];
break;
case 16:
this.$ = "";
break;
case 17:
this.$ = $$[$0];
break;
}
},
table: [o($V0,[2,2],{3:1,4:2}),{1:[3]},{5:[1,3],8:4,11:5,21:$V1},o($V2,[2,14],{6:7}),{9:[1,8]},o($V3,[2,4],{12:[1,9]}),{20:[1,10]},{1:[2,16],5:[1,13],7:11,11:15,15:12,16:14,20:$V4,21:$V1},{8:17,11:5,21:$V1},{11:15,13:18,15:19,16:14,20:$V4,21:$V1},o($V5,[2,12],{22:[1,20]}),{1:[2,1]},{23:[1,21]},{9:[1,22]},o($V6,[2,6]),o($V6,[2,10],{17:[1,23]}),o($V6,[2,11]),{10:[1,24]},{14:[1,25],19:$V7},o($V8,[2,8]),{9:[1,27]},{11:15,15:28,16:14,20:$V4,21:$V1},{1:[2,17]},{11:15,13:29,15:19,16:14,20:$V4,21:$V1},o($V0,[2,3]),o($V3,[2,5]),{11:15,15:30,16:14,20:$V4,21:$V1},o($V5,[2,13]),{10:[1,31]},{18:[1,32],19:$V7},o($V8,[2,9]),o($V2,[2,15]),o($V6,[2,7])],
defaultActions: {11:[2,1],22:[2,17]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return "CODE";
break;
case 1:/* skip whitespace */
break;
case 2:return "CODE";
break;
case 3:return "NAME";
break;
case 4: this.begin("TAIL"); return "MARK"; 
break;
case 5: this.begin("CONF"); return "MARK"; 
break;
case 6:return ";";
break;
case 7:return "[";
break;
case 8:return "]";
break;
case 9:return "(";
break;
case 10:return ")";
break;
case 11:return ",";
break;
case 12:return "\\";
break;
case 13:return "_";
break;
case 14:return "=";
break;
}
},
rules: [/^(?:(.|\n)*$)/,/^(?:\s+)/,/^(?:\{[^}]+\})/,/^(?:[A-Za-z][A-Za-z0-9]*)/,/^(?:\$\$)/,/^(?:\$\$)/,/^(?:;)/,/^(?:\[)/,/^(?:\])/,/^(?:\()/,/^(?:\))/,/^(?:,)/,/^(?:\\)/,/^(?:_\b)/,/^(?:=)/],
conditions: {"CONF":{"rules":[1,2,3,4,5,6,9,10,11,12,13,14],"inclusive":true},"TAIL":{"rules":[0,1,2,3,5,6,9,10,11,12,13],"inclusive":true},"INITIAL":{"rules":[1,2,3,5,6,7,8,9,10,11,12,13],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
module.exports = parser;

},{}],4:[function(require,module,exports){
var compile = require("./compile");

var parser = new compile.Parser();
var inverb, inrules, inconf, inenv, inqueue, nwires, nambs;
var typelist, types, ntypes, wiretype, ambtype, table;
var lpaxtype, rpaxtype, format;

function addtypes(tree)
{
	var node = tree.node;
	var pax = tree.pax;
	var agent = node.agent;
	var type = types[agent];
	var i;

	if ("wire" == agent)
		return;

	if (!type) {
		types[agent] = ntypes;
		++ntypes;
	}

	for (i = 0; i < pax.length; i++)
		addtypes(pax[i]);
}

function norule(lagent, ragent)
{
	var ltype = typelist[lagent.type];
	var rtype = typelist[ragent.type];
	var pair = ltype + "><" + rtype;

	console.error("%s: No applicable rule", pair);
	inqueue = [];
}

function indwire(wire, agent)
{
	var dst = wire.twin;
	var twin = agent.twin;

	dst.twin = twin;
	twin.twin = dst;
}

function inderiw(agent, wire)
{
	indwire(wire, agent);
}

function indamb(wire, agent)
{
	var dst = wire.twin;
	var twin = agent.twin;

	dst.twin = twin;
	twin.twin = dst;

	dst.type = ambtype;
	dst.main = agent.main;
	dst.aux = agent.aux;
}

function indbma(agent, wire)
{
	indamb(wire, agent);
}

function indagent(wire, agent)
{
	var dst = wire.twin;

	dst.type = agent.type;
	dst.pax = agent.pax;
	dst.data = agent.data;
}

function indtnega(agent, wire)
{
	indagent(wire, agent);
}

function getindir(type)
{
	if ("wire" == type)
		return indwire;
	else if ("amb" == type)
		return indamb;
	else
		return indagent;
}

function getridni(type)
{
	if ("wire" == type)
		return inderiw;
	else if ("amb" == type)
		return indbma;
	else
		return indtnega;
}

function determ(amb, agent)
{
	var dst = amb.twin;
	var aux = amb.aux;
	var type = aux.type;

	if (wiretype == type) {
		var twin = aux.twin;

		dst.twin = twin;
		twin.twin = dst;

		dst.type = type;
	} else if (ambtype == type) {
		var twin = aux.twin;

		dst.twin = twin;
		twin.twin = dst;

		dst.main = aux.main;
		dst.aux = aux.aux;
	} else {
		dst.type = type;
		dst.pax = aux.pax;
		dst.data = aux.data;
	}

	flush([{
		left: amb.main,
		right: agent
	}]);
}

function mreted(agent, amb)
{
	determ(amb, agent);
}

function mkeffect(lval, rval, code, expr)
{
	var body = expr ? "return (%s);" : "%s\n\treturn true;";

	if (!lval)
		lval = "LVAL";
	if (!rval)
		rval = "RVAL";
	if (!code && expr)
		code = "void(0)";

	body = body.replace("%s", code);
	return new Function(lval, rval, body);
}

function prequeue(queue, side, lval, rval, pax, wires)
{
	var i;

	for (i = 0; i < pax.length; i++) {
		var img = encode(lval, rval, pax[i], wires);

		queue.push({
			left: {
				type: side,
				id: i
			},
			right: img
		});
	}
}

function optimize(queue)
{
	var needed = [];
	var i;

	for (i = 0; i < queue.length; i++) {
		var pair = queue[i];
		var pax = pair.left;
		var wire = pair.right;
		var twin = wire.twin;

		if (wiretype != wire.type) {
			needed.push(pair);
			continue;
		}

		twin.type = pax.type;
		twin.id = pax.id;

		wire.junk = true;
		twin.junk = true;
	}

	return needed;
}

function geneff(effect)
{
	effect = "(" + effect.toString() + ")";
	return effect + ".call(this, lval, rval)";
}

function gentwins(wlist, alist)
{
	var head = "";
	var tail = "";
	var i;

	if (!wlist.length)
		return "";

	for (i = 0; i < wlist.length; i++) {
		var wire = wlist[i];
		var type = wire.type;
		var twin = wire.twin.id;

		head = head.concat("\
	var wire" + i + " = {type: " + type + "};\n");

		tail = tail.concat("\
	wire" + i + ".twin = wire" + twin + ";\n");
	}

	for (i = 0; i < alist.length; i++) {
		var tree = alist[i];

		head = head.concat("\
	var tree" + i + " = " + genclone(tree) + ";\n");
	}

	for (i = 0; i < wlist.length; i++) {
		var wire = wlist[i];

		if (ambtype == wire.type) {
			var main = wire.main;
			var aux = wire.aux;

			tail = tail.concat("\
	wire" + i + ".main = tree" + main + ";\n\
	wire" + i + ".aux = tree" + aux + ";\n");
		}
	}

	return head.concat("\n", tail, "\n");
}

function genclone(img)
{
	var type = img.type;
	var imgpax = img.pax;
	var pax = [];
	var i;

	if (lpaxtype == type)
		return "lpax[" + img.id + "]";

	if (rpaxtype == type)
		return "rpax[" + img.id + "]";

	if (wiretype == type)
		return "wire" + img.id;

	if (ambtype == type)
		return "wire" + img.id;

	for (i = 0; i < imgpax.length; i++)
		pax[i] = genclone(imgpax[i]);

	return "{\n\
			type: " + type + ",\n\
			pax: [" + pax.join(", ") + "],\n\
			data: " + geneff(img.effect) + "\n\
		}";
}

function genqueue(img)
{
	var queue = [];
	var i;

	for (i = 0; i < img.length; i++) {
		var pair = img[i];
		var left = pair.left;
		var right = pair.right;

		queue.push("{\n\
		left: " + genclone(left) + ",\n\
		right: " + genclone(right) + "\n\
	}");
	}

	return "[" + queue.join(", ") + "]";
}

function generate(img, wlist, alist, effect, rl)
{
	var left = rl ? "right" : "left";
	var right = rl ? "left" : "right";
	var body = "\
	var lval = " + left + ".data;\n\
	var rval = " + right + ".data;\n\n\
	if (!(" + geneff(effect) + "))\n\
		return;\n\n\
	var lpax = left.pax;\n\
	var rpax = right.pax;\n\n" + gentwins(wlist, alist) + "\
	return " + genqueue(img) + ";";

	return new Function("left", "right", body);
}

function apply(left, right, code, rl)
{
	var lnode = left.node;
	var rnode = right.node;
	var human = lnode.agent + "><" + rnode.agent;
	var lval = rl ? rnode.code : lnode.code;
	var rval = rl ? lnode.code : rnode.code;
	var effect = mkeffect(lval, rval, code);
	var img = [];
	var wires = {};
	var wlist = [];
	var alist = [];
	var i, name, interact;

	prequeue(img, lpaxtype, lval, rval, left.pax, wires);
	prequeue(img, rpaxtype, lval, rval, right.pax, wires);

	img = optimize(img);

	for (name in wires) {
		var wire = wires[name];
		var twin = wire.twin;

		if (wire.junk)
			continue;

		wire.id = wlist.length;
		wlist.push(wire);

		twin.id = wlist.length;
		wlist.push(twin);

		if (ambtype == wire.type) {
			var main = wire.main;
			var aux = wire.aux;

			wire.main = alist.length;
			twin.main = alist.length;
			alist.push(main);

			wire.aux = alist.length;
			twin.aux = alist.length;
			alist.push(aux);
		}
	}

	interact = generate(img, wlist, alist, effect, rl);
	interact.human = human;
	interact.count = 0;
	return interact;
}

function addrule(dict, rule)
{
	var human = rule.human;
	var entry = dict[human];

	if (!entry) {
		entry = [];
		dict[human] = entry;
	}

	entry.push(rule);
}

function gettable()
{
	var tab = [];
	var custom = {};
	var left, right, type;

	for (i = 0; i < inrules.length; i++) {
		var rule = inrules[i];
		var left = rule.left;
		var right = rule.right;
		var code = rule.code;
		var lrfunc, rlfunc;

		addtypes(left);
		addtypes(right);

		lrfunc = apply(left, right, code);
		addrule(custom, lrfunc);

		rlfunc = apply(right, left, code, true);
		addrule(custom, rlfunc);
	}

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		addtypes(left);
		addtypes(right);
	}

	for (left in types) {
		var row = [];

		for (right in types) {
			var rules = custom[left + "><" + right];

			if (!rules) {
				if ("wire" == left)
					rules = getindir(right);
				else if ("wire" == right)
					rules = getridni(left);
				else if ("amb" == left)
					rules = determ;
				else if ("amb" == right)
					rules = mreted;
				else
					rules = norule;
			}

			row[types[right]] = rules;
		}

		tab[types[left]] = row;

		typelist[types[left]] = left;
	}

	return tab;
}

function traverse(pair)
{
	var left = pair.left;
	var right = pair.right;
	var rules = pair.rules;
	var i;

	for (i = 0; i < rules.length; i++) {
		var rule = rules[i];
		var queue = rule.call(inenv, left, right);

		if (queue) {
			++rule.count;
			flush(queue);
			return;
		}
	}

	norule(left, right);
}

function reduce()
{
	var pair;

	while (pair = inqueue.shift())
		traverse(pair);
}

function flush(queue)
{
	var i;

	for (i = 0; i < queue.length; i++) {
		var pair = queue[i];
		var left = pair.left;
		var right = pair.right;
		var row = table[left.type];
		var rules = row[right.type];

		pair.rules = rules;

		if (rules.pseudo)
			rules(left, right);
		else
			inqueue.push(pair);
	}
}

function encode(lval, rval, tree, wires, rt)
{
	var node = tree.node;
	var code = node.code;
	var agent = node.agent;
	var type = types[agent];
	var pax = tree.pax;
	var imgpax = [];
	var i;

	for (i = 0; i < pax.length; i++) {
		var sub = pax[i];

		imgpax[i] = encode(lval, rval, sub, wires, rt);
	}

	pax = imgpax;
	tree = {
		type: type,
		pax: imgpax
	};

	if (wiretype == type) {
		var name = node.name;
		var wire = wires[name];

		if (wire) {
			wire.twin = tree;
			tree.twin = wire;

			tree.type = wire.type;
			tree.main = wire.main;
			tree.aux = wire.aux;
		}

		delete tree.pax;

		wires[name] = tree;
	} else if (ambtype == type) {
		var wire = pax.shift();
		var twin = wire.twin;
		var main = pax.shift();
		var aux = pax.shift();

		wire.type = type;
		wire.main = main;
		wire.aux = aux;

		if (twin) {
			twin.type = type;
			twin.main = main;
			twin.aux = aux;
		}

		return wire;
	} else {
		var effect = mkeffect(lval, rval, code, true);

		if (rt)
			tree.data = effect.call(inenv);
		else
			tree.effect = effect;
	}

	return tree;
}

function init()
{
	var wires = {};
	var queue = [];
	var effect = mkeffect(0, 0, inverb);
	var i;

	effect.call(inenv);

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		queue.push({
			left: encode(0, 0, left, wires, true),
			right: encode(0, 0, right, wires, true)
		});
	}

	flush(queue);
}

function prepare(src, fmt)
{
	var system = parser.parse(src);

	if (fmt)
		format = fmt;
	else
		format = noformat;

	inverb = system.code;
	inrules = system.rules;
	inconf = system.conf;
	inenv = {};
	inqueue = [];
	typelist = [];
	types = {
		wire: 0,
		amb: 1
	};
	ntypes = 2;
	nwires = 0;
	nambs = 0;

	norule.pseudo = true;
	determ.pseudo = true;
	mreted.pseudo = true;
	indwire.pseudo = true;
	inderiw.pseudo = true;
	indamb.pseudo = true;
	indbma.pseudo = true;
	indagent.pseudo = true;
	indtnega.pseudo = true;

	wiretype = types["wire"];
	ambtype = types["amb"];
	lpaxtype = -1;
	rpaxtype = -2;

	table = gettable();

	init();
}

function getlist(pax)
{
	var list = [];
	var i;

	for (i = 0; i < pax.length; i++)
		list[i] = gettree(pax[i]);

	if (list.length)
		return "(" + list.join(", ") + ")";
	else
		return "";
}

function noformat(data)
{
	return data;
}

function gettree(agent)
{
	var type = agent.type;
	var human;

	if (wiretype == type) {
		human = agent.human;

		if (!human) {
			++nwires;
			human = "w" + nwires;
			agent.human = human;
		}

		agent.twin.human = human;
	} else if (ambtype == type) {
		var index = agent.index;
		var list = "";

		if (!index || (nambs < index)) {
			++nambs;
			index = nambs;
			agent.twin.index = nambs;

			list = getlist([
				agent.main,
				agent.aux
			]);
		}

		human = "\\amb#" + index + list;
	} else {
		var data = format(agent.data);

		if (void(0) == data)
			data = "";
		else
			data = "_{" + data + "}";

		type = typelist[type] + data;

		human = "\\" + type + getlist(agent.pax);
	}

	return human;
}

function geteqn(pair)
{
	var left = gettree(pair.left);
	var right = gettree(pair.right);

	return left + " = " + right + ";";
}

function getconf()
{
	var list = [];
	var i;

	nambs = 0;

	for (i = 0; i < inqueue.length; i++)
		list[i] = geteqn(inqueue[i]);

	return list.join("\n");
}

function debug()
{
	var conf = getconf();
	var pair;

	pair = inqueue.shift();
	if (pair)
		traverse(pair);

	return conf;
}

function debug1()
{
	var pair = inqueue.shift();
	var eqn;

	if (pair) {
		eqn = geteqn(pair);
		traverse(pair);
	}

	return eqn;
}

function getstats()
{
	var stats = {};
	var i;

	for (i = 0; i < table.length; i++) {
		var row = table[i];
		var j;

		for (j = 0; j < row.length; j++) {
			var cell = row[j];
			var k;

			if (cell.pseudo)
				continue;

			for (k = 0; k < cell.length; k++) {
				var rule = cell[k];
				var count = rule.count;
				var human = rule.human;

				if (!count)
					continue;

				human = human.split("><");
				human = human.sort();
				human = human.join("><");

				if (stats[human])
					stats[human] += count;
				else
					stats[human] = count;
			}
		}
	}

	return stats;
}

function run(mlc)
{
	prepare(mlc);

	reduce();

	inenv.stats = getstats();
	return inenv;
}

run.prepare = prepare;
run.debug = debug;
run.debug1 = debug1;
module.exports = run;

},{"./compile":3}],5:[function(require,module,exports){
(function (global){
var mlc2in = require("./encode");
var inet = require("inet-lib");


var obj2mlc = mlc2in.obj2mlc;
var example = "I = x: x;\nK = x, y: x;\nS = x, y, z: x z (y z);\n\nT = K;\nF = x, y: y;\nAND = p, q: p q F;\nOR = p, q: p T q;\nNOT = p: (a, b: p b a);\n\nC0 = f, x: x;\nC1 = f, x: f x;\nC2 = f, x: f (f x);\nC3 = f, x: f (f (f x));\nSUCC = n: (f, x: f (n f x));\nPLUS = m, n: (f, x: m f (n f x));\nMULT = m, n: (f: m (n f));\nEXP = m, n: n m;\nPRED = n: (f, x: n (g, h: h (g f)) (K x) I);\nMINUS = m, n: n PRED m;\nZERO = n: n (K F) T;\n\nA = self, f: f (self self f);\nY = A A;\nFACTR = self, n: (ZERO n) C1 (MULT n (self (PRED n)));\nFACT = Y FACTR;\n\nC24 = FACT (PLUS C2 C2);\nC27 = EXP C3 C3;\nMINUS C27 C24\n";

function format(data)
{
	if ("object" == typeof data)
		return obj2mlc(data);
	else if ("number" == typeof data)
		return data.toString();
	else
		return data;
}

function prepare(mlc)
{
	var src = mlc2in(mlc);

	inet.prepare(src, format);
}

function debug()
{
	return inet.debug();
}

function debug1()
{
	return inet.debug1();
}

function run(mlc)
{
	var src = mlc2in(mlc);
	var output = inet(src);

	output.term = mlc2in.term;

	if (output.nf)
		output.nf = obj2mlc(output.nf);
	else
		output.nf = output.term;

	return output;
}

run.prepare = prepare;
run.debug = debug;
run.debug1 = debug1;
run.mlc2in = mlc2in;
run.example = example.replace(/\n*$/, "");
global.mlcjs = run;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./encode":1,"inet-lib":4}]},{},[5]);
