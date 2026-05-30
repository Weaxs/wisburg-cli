import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json");

export const VERSION: string = JSON.parse(readFileSync(pkgPath, "utf8")).version;
