import { nonNull, counter } from './utils';

// Evaluate a STG expression
export const evaluate = (expr: Expr): void => {
  const stacks = {
    args: [],
    returns: [],
    updates: [],
  };
  let code: Code | null = Eval(expr, {});

  while ((code = code.step(stacks)));
};

//
// Types
//

interface Code {
  step(stacks: Stacks): Code | null;
}

type Stacks = {
  args: Value[];
  returns: { env: Env; alts: Alt[] }[];
  updates: {
    args: Value[];
    returns: { env: Env; alts: Alt[] }[];
    target: Closure;
  }[];
};

type Env = Record<string, Value>;

type Value = number | Closure;

type Closure = {
  lf: LF;
  refs: Value[];
  updating: boolean;
};

export type LF = {
  key?: string;
  free: string[];
  updatable: boolean;
  args: string[];
  expr: Expr;
};

export interface Expr {
  eval(env: Env, stacks: Stacks): Code | null;
}

// return continuation if matching succeed
interface Alt {
  matchCon(con: string): ((env: Env, args: Value[]) => Code | null) | null;
  matchLit(lit: number): ((env: Env) => Code | null) | null;
}

export type Binds = Record<string, LF>;

export type Atom = string | number;

//
// Helper functions
//

const val = (atom: Atom, env: Env): Value => {
  if (typeof atom === 'number') {
    return atom;
  }

  const val = env[atom];
  if (typeof val === 'undefined') {
    throw new Error(`Unbound variable: ${atom}`);
  }

  return val;
};

const vals = (atoms: Atom[], env: Env): Value[] => {
  return atoms.map((atom) => val(atom, env));
};

const stdcon = (con: string, refs: Value[]): Closure => {
  const free = Array.from({ length: refs.length }, () => `$fresh_${counter()}`);
  return {
    lf: {
      free,
      updatable: false,
      args: [],
      expr: ConApp(con, free),
    },
    refs,
    updating: false,
  };
};

export const LF = (
  free: string[],
  updatable: boolean,
  args: string[],
  expr: Expr
): LF => ({
  free,
  updatable,
  args,
  expr,
});

export const Trace = (key: string, lf: LF): LF => ({
  ...lf,
  key,
});

//
// Semantics
//

const Eval = (expr: Expr, env: Env): Code => ({
  step(stacks) {
    return expr.eval(env, stacks);
  },
});

const Enter = (closure: Closure): Code => ({
  step(stacks) {
    if (closure.updating) {
      throw new Error('<<loop>>');
    }

    // Partial application
    if (stacks.args.length < closure.lf.args.length) {
      const updFrame = stacks.updates.shift();
      if (!updFrame) {
        return null;
      }

      const [args1, args2] = closure.lf.args.splitAt(stacks.args.length);
      updFrame.target.lf.free = [...closure.lf.free, ...args1];
      updFrame.target.refs = [...closure.refs, ...stacks.args];
      updFrame.target.lf.updatable = false;
      updFrame.target.lf.args = args2;
      updFrame.target.lf.expr = closure.lf.expr;
      updFrame.target.updating = false;

      stacks.args = [...stacks.args, ...updFrame.args];
      stacks.returns = updFrame.returns;

      return Enter(closure);
    }

    const env: Env = {};
    closure.lf.free.zip(closure.refs).forEach(([name, value]) => {
      env[name] = value;
    });
    closure.lf.args.forEach((name) => {
      env[name] = stacks.args.shift()!;
    });

    if (closure.lf.updatable) {
      stacks.updates.unshift({
        args: stacks.args,
        returns: stacks.returns,
        target: closure,
      });
      stacks.args = [];
      stacks.returns = [];
      closure.updating = true;
    }

    return Eval(closure.lf.expr, env);
  },
});

const ReturnCon = (con: string, args: Value[]): Code => ({
  step(stacks) {
    const retFrame = stacks.returns.shift();
    if (retFrame) {
      const cont = retFrame.alts.map((alt) => alt.matchCon(con)).find(nonNull);
      if (!cont) {
        throw new Error('No alternative matched');
      }

      return cont(retFrame.env, args);
    }

    const updFrame = stacks.updates.shift();
    if (updFrame) {
      // restore stacks
      stacks.args = updFrame.args;
      stacks.returns = updFrame.returns;

      // trace
      if (updFrame.target.lf.key) {
        console.log(`${updFrame.target.lf.key}: ${con} {${args.join(', ')}}`);
      }

      // update closure
      const repl = stdcon(con, args);
      updFrame.target.lf = repl.lf;
      updFrame.target.refs = repl.refs;
      updFrame.target.updating = false;

      return ReturnCon(con, args);
    }

    return null;
  },
});

const ReturnInt = (n: number): Code => ({
  step(stacks) {
    const frame = stacks.returns.shift();
    if (!frame) {
      throw new Error('ReturnInt with empty stack');
    }

    const cont = frame.alts.map((alt) => alt.matchLit(n)).find(nonNull);
    if (!cont) {
      throw new Error('No alternative matched');
    }

    return cont(frame.env);
  },
});

export const Let = (binds: Binds, expr: Expr): Expr => ({
  eval(env) {
    const closures: Closure[] = [...Object.entries(binds)].map(([v, lf]) => {
      return (env[v] = { lf, refs: [], updating: false });
    });
    closures.forEach((closure) => {
      closure.refs = vals(closure.lf.free, env);
    });

    return Eval(expr, env);
  },
});

export const Case = (expr: Expr, alts: Alt[]): Expr => ({
  eval(env, stacks) {
    stacks.returns.unshift({ env: { ...env }, alts });
    return Eval(expr, env);
  },
});

export const VarApp = (f: string, xs: Atom[]): Expr => ({
  eval(env, stacks) {
    const value = val(f, env);
    const args = vals(xs, env);

    if (typeof value === 'number') {
      return ReturnInt(value);
    }

    stacks.args = [...args, ...stacks.args];
    return Enter(value);
  },
});

export const ConApp = (con: string, xs: Atom[]): Expr => ({
  eval(env) {
    return ReturnCon(con, vals(xs, env));
  },
});

export const PrimApp = (prim: string, xs: Atom[]): Expr => ({
  eval(env) {
    const args = vals(xs, env);
    if (!args.every((v): v is number => typeof v === 'number')) {
      throw new Error('Apply primitive function to non-primitive value');
    }
    if (args.length !== 2) {
      throw new Error('Bad primitive function arity');
    }

    let n: number;
    switch (prim) {
      case '+#':
        n = args[0]! + args[1]!;
        break;
      case '-#':
        n = args[0]! - args[1]!;
        break;
      case '*#':
        n = args[0]! * args[1]!;
        break;
      case '/#':
        n = args[0]! / args[1]!;
        break;
      default:
        throw new Error(`Unknown prim op: ${prim}`);
    }

    return ReturnInt(n);
  },
});

export const Lit = (n: number): Expr => ({
  eval() {
    return ReturnInt(n);
  },
});

export const Undefined: Expr = {
  eval() {
    throw new Error('Undefined evaluated');
  },
};

export const AlgAlt = (con1: string, vars: string[], expr: Expr): Alt => ({
  matchCon(con2) {
    if (con1 !== con2) {
      return null;
    }

    return (env, args) => {
      if (args.length !== vars.length) {
        throw new Error('Bad constructor arity');
      }

      vars.zip(args).forEach(([v, a]) => {
        env[v] = a;
      });

      return Eval(expr, env);
    };
  },
  matchLit() {
    throw new Error('Bad alternative');
  },
});

export const PrimAlt = (lit1: number, expr: Expr): Alt => ({
  matchCon() {
    throw new Error('Bad alternative');
  },
  matchLit(lit2) {
    if (lit1 !== lit2) {
      return null;
    }
    return (env) => Eval(expr, env);
  },
});

export const VarAlt = (v: string, expr: Expr): Alt => ({
  matchCon(con) {
    return (env, args) => {
      env[v] = stdcon(con, args);
      return Eval(expr, env);
    };
  },
  matchLit(lit) {
    return (env) => {
      env[v] = lit;
      return Eval(expr, env);
    };
  },
});

export const DefAlt = (expr: Expr): Alt => ({
  matchCon() {
    return (env) => Eval(expr, env);
  },
  matchLit() {
    return (env) => Eval(expr, env);
  },
});
