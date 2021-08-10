import * as Stg from "./stg.ts";
import { unique } from "./utils.ts";

// general functions
export const seq = Stg.LF(
  [],
  false,
  ["x", "y"],
  Stg.Case(Stg.VarApp("x", []), [Stg.DefAlt(Stg.VarApp("y", []))]),
);

export const id = Stg.LF([], false, ["x"], Stg.VarApp("x", []));

export const const_ = Stg.LF([], false, ["x", "y"], Stg.VarApp("x", []));

export const fix = Stg.LF(
  [],
  false,
  ["f"],
  Stg.Let(
    {
      x: Stg.LF(["f", "x"], true, [], Stg.VarApp("f", ["x"])),
    },
    Stg.VarApp("x", []),
  ),
);

export const compose = Stg.LF(
  [],
  false,
  ["f", "g", "x"],
  Stg.Let(
    {
      gx: Stg.LF(["g", "x"], true, [], Stg.VarApp("g", ["x"])),
    },
    Stg.VarApp("f", ["gx"]),
  ),
);

// Unit
export const Unit = Stg.LF([], false, [], Stg.ConApp("Unit", []));

// Int
export const Int = (n: number) =>
  Stg.LF([], false, [], Stg.ConApp("Int#", [n]));

const arithOp = (op: string) =>
  Stg.LF(
    [],
    false,
    ["x", "y"],
    Stg.Case(Stg.VarApp("x", []), [
      Stg.AlgAlt(
        "Int#",
        ["x#"],
        Stg.Case(Stg.VarApp("y", []), [
          Stg.AlgAlt(
            "Int#",
            ["y#"],
            Stg.Case(Stg.PrimApp(op, ["x#", "y#"]), [
              Stg.VarAlt("z#", Stg.ConApp("Int#", ["z#"])),
            ]),
          ),
        ]),
      ),
    ]),
  );

export const add = arithOp("+#");
export const sub = arithOp("-#");
export const mul = arithOp("*#");
export const div = arithOp("/#");

// List
export const Nil = Stg.LF([], true, [], Stg.ConApp("Nil", []));
export const Cons = (x: Stg.Atom, xs: Stg.Atom) =>
  Stg.LF(
    [x, xs].filter((atom): atom is string => typeof atom === "string"),
    true,
    [],
    Stg.ConApp("Cons", [x, xs]),
  );

export const List = (...xs: Stg.Atom[]) => {
  const genFresh = () => `$List_${unique()}`;

  const binds: Stg.Binds = {};
  let fresh = genFresh();

  binds[fresh] = Nil;
  xs.reverse().forEach((atom) => {
    const cons = Cons(atom, fresh);
    fresh = genFresh();
    binds[fresh] = cons;
  });

  return Stg.LF(
    xs.filter((atom): atom is string => typeof atom === "string"),
    true,
    [],
    Stg.Let(binds, Stg.VarApp(fresh, [])),
  );
};

export const length = Stg.LF(
  ["length", "add"],
  false,
  ["xs"],
  Stg.Case(Stg.VarApp("xs", []), [
    Stg.AlgAlt("Nil", [], Stg.ConApp("Int#", [0])),
    Stg.AlgAlt(
      "Cons",
      ["y", "ys"],
      Stg.Let(
        {
          one: Int(1),
          n: Stg.LF(["length", "ys"], true, [], Stg.VarApp("length", ["ys"])),
        },
        Stg.VarApp("add", ["n", "one"]),
      ),
    ),
  ]),
);

export const repeat = Stg.LF(
  [],
  false,
  ["x"],
  Stg.Let(
    {
      xs: Cons("x", "xs"),
    },
    Stg.VarApp("xs", []),
  ),
);

export const take = Stg.LF(
  ["take", "sub"],
  false,
  ["n", "xs"],
  Stg.Case(Stg.VarApp("n", []), [
    Stg.AlgAlt(
      "Int#",
      ["n#"],
      Stg.Case(Stg.VarApp("n#", []), [
        Stg.PrimAlt(0, Stg.ConApp("Nil", [])),
        Stg.DefAlt(
          Stg.Case(Stg.VarApp("xs", []), [
            Stg.AlgAlt("Nil", [], Stg.ConApp("Nil", [])),
            Stg.AlgAlt(
              "Cons",
              ["y", "ys"],
              Stg.Let(
                {
                  one: Int(1),
                  m: Stg.LF(
                    ["sub", "n", "one"],
                    true,
                    [],
                    Stg.VarApp("sub", ["n", "one"]),
                  ),
                  zs: Stg.LF(
                    ["take", "m", "ys"],
                    true,
                    [],
                    Stg.VarApp("take", ["m", "ys"]),
                  ),
                },
                Stg.ConApp("Cons", ["y", "zs"]),
              ),
            ),
          ]),
        ),
      ]),
    ),
  ]),
);
