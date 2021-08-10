import * as Stg from "./stg.ts";
import { path } from "./deps.ts";

async function main() {
  const file = Deno.args[0];
  if (!file) {
    console.error("Please input a path to STG program");
    return Deno.exit(1);
  }

  let expr: unknown;
  try {
    expr = (await import(path.resolve(file))).default;
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
    return Deno.exit(1);
  }

  if (!Stg.isExpr(expr)) {
    console.error("Invalid STG expression");
    return Deno.exit(1);
  }

  try {
    Stg.evaluate(expr);
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
  }
}

main();
