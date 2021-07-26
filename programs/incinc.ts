import * as Stg from '../src/stg';
import * as Prelude from '../src/prelude';

export default Stg.Let(
  {
    compose: Prelude.compose,
    add: Prelude.add,
    one: Prelude.Int(1),
    inc: Stg.LF(['add', 'one'], false, [], Stg.VarApp('add', ['one'])),
    incinc: Stg.LF(
      ['compose', 'inc'],
      false,
      [],
      Stg.VarApp('compose', ['inc', 'inc'])
    ),
  },
  Stg.VarApp('incinc', ['one'])
);
