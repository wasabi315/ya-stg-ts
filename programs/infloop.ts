import * as Stg from '../src/stg';

export default Stg.Let(
  {
    inf: Stg.LF(['inf'], true, [], Stg.VarApp('inf', [])),
  },
  Stg.VarApp('inf', [])
);
