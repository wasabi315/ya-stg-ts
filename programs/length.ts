import * as Stg from "../src/stg.ts";
import * as Prelude from "../src/prelude.ts";

/*

letrec
  add = <...omit>
  sub = <...omit>
  length = <...omit>
  unit = ()
  repeat = <...omit>
  take = <...omit>
  xs = {repeat, unit} \u {} -> repeat {unit}
  ten = 10
  ys = {take, ten, xs} \u {} -> take {ten, xs}
in
  length {ys}

 */

export default Stg.Let(
  {
    add: Prelude.add,
    sub: Prelude.sub,
    length: Prelude.length,
    unit: Prelude.Unit,
    repeat: Prelude.repeat,
    take: Prelude.take,
    xs: Stg.LF(["unit", "repeat"], true, [], Stg.VarApp("repeat", ["unit"])),
    ten: Prelude.Int(10),
    ys: Stg.LF(
      ["take", "ten", "xs"],
      true,
      [],
      Stg.VarApp("take", ["ten", "xs"]),
    ),
  },
  Stg.VarApp("length", ["ys"]),
);
