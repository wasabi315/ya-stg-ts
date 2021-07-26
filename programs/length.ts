import * as Stg from '../src/stg';
import * as Prelude from '../src/prelude';

export default Stg.Let(
  {
    add: Prelude.add,
    sub: Prelude.sub,
    length: Prelude.length,
    unit: Prelude.Unit,
    repeat: Prelude.repeat,
    take: Prelude.take,
    xs: Stg.LF(['unit', 'repeat'], true, [], Stg.VarApp('repeat', ['unit'])),
    ten: Prelude.Int(10),
    ys: Stg.LF(
      ['take', 'ten', 'xs'],
      true,
      [],
      Stg.VarApp('take', ['ten', 'xs'])
    ),
  },
  Stg.VarApp('length', ['ys'])
);
