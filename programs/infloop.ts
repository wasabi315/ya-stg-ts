import { Stg } from "../src/stg/mod.ts";

/*

letrec
  x = {x} \u {} -> x {}
in
  x {}

 */

export default Stg.Let(
  {
    inf: Stg.LF(["inf"], true, [], Stg.VarApp("inf", [])),
  },
  Stg.VarApp("inf", []),
);
