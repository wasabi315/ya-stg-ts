import * as Stg from '../src/stg';
import * as Prelude from '../src/prelude';

/*

letrec
  compose = <..omit>
  add = <..omit>
  one = 1
  inc = {add, one} \n {} -> add {one}
  incinc = {compose, inc} \n {} -> compose {inc, inc}
in
  incinc {one}

 */

export default Stg.Let(
  {
    compose: Prelude.compose,
    add: Prelude.add,
    one: Prelude.Int(1),
    inc: Stg.LF(['add', 'one'], true, [], Stg.VarApp('add', ['one'])),
    incinc: Stg.LF(
      ['compose', 'inc'],
      true,
      [],
      Stg.VarApp('compose', ['inc', 'inc'])
    ),
  },
  Stg.VarApp('incinc', ['one'])
);
