import * as Stg from './stg';
import * as Prelude from './prelude';

const infloop = Stg.Let(
  {
    inf: Stg.LF(['inf'], true, [], Stg.VarApp('inf', [])),
  },
  Stg.VarApp('inf', [])
);

const fact10 = Stg.Let(
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
    fact10: Stg.Trace(
      'fact {10}',
      Stg.LF(['fact', 'ten'], true, [], Stg.VarApp('fact', ['ten']))
    ),
  },
  Stg.VarApp('fact10', [])
);

const length10 = Stg.Let(
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
    n: Stg.Trace(
      'n',
      Stg.LF(['length', 'ys'], true, [], Stg.VarApp('length', ['ys']))
    ),
  },
  Stg.VarApp('n', [])
);

const incinc = Stg.Let(
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
    three: Stg.Trace(
      'three',
      Stg.LF(['one', 'incinc'], true, [], Stg.VarApp('incinc', ['one']))
    ),
  },
  Stg.VarApp('three', [])
);

function main() {
  try {
    Stg.evaluate(fact10);
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
  }
}

main();
