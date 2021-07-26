import * as Stg from './stg';
import * as path from 'path';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Please input a path to STG program');
    return process.exit(1);
  }

  let expr: unknown;
  try {
    expr = (await import(path.resolve(file))).default;
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
    return process.exit(1);
  }

  if (!Stg.isExpr(expr)) {
    console.error('Invalid STG expression');
    return process.exit(1);
  }

  try {
    Stg.evaluate(expr);
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
  }
}

main();
