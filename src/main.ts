import { Stg } from "./stg/mod.ts";
import { path } from "./deps.ts";

async function main() {
  const file = Deno.args[0];
  if (!file) {
    throw new Error("Please input a path to STG program");
  }

  const expr = (await import(path.resolve(file))).default;
  if (!Stg.isExpr(expr)) {
    throw new Error("Invalid STG expression");
  }

  try {
    Stg.evaluate(expr);
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : err);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  Deno.exit(1);
});
