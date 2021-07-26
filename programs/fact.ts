import * as Stg from '../src/stg';
import * as Prelude from '../src/prelude';

export default Stg.Let(
  {
    sub: Prelude.sub,
    mul: Prelude.mul,
    fact: Stg.LF(
      ['sub', 'mul', 'fact'],
      false,
      ['n'],
      Stg.Case(Stg.VarApp('n', []), [
        Stg.AlgAlt(
          'Int#',
          ['n#'],
          Stg.Case(Stg.VarApp('n#', []), [
            Stg.PrimAlt(0, Stg.ConApp('Int#', [1])),
            Stg.DefAlt(
              Stg.Let(
                {
                  one: Prelude.Int(1),
                  m: Stg.Trace(
                    'fact.m',
                    Stg.LF(
                      ['n', 'sub', 'one'],
                      true,
                      [],
                      Stg.VarApp('sub', ['n', 'one'])
                    )
                  ),
                  fm: Stg.Trace(
                    'fact.fm',
                    Stg.LF(['m', 'fact'], true, [], Stg.VarApp('fact', ['m']))
                  ),
                },
                Stg.VarApp('mul', ['n', 'fm'])
              )
            ),
          ])
        ),
      ])
    ),
    ten: Prelude.Int(10),
  },
  Stg.VarApp('fact', ['ten'])
);