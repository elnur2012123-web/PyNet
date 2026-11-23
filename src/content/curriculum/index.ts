import type { Module } from "../types";
import { m01 } from "./m01-intro";
import { m02 } from "./m02-variables";
import { m03 } from "./m03-operators";
import { m04 } from "./m04-strings";
import { m05 } from "./m05-io";
import { m06 } from "./m06-conditions";
import { m07 } from "./m07-loops";
import { m08 } from "./m08-data-structures";
import { m09 } from "./m09-functions";
import { m10 } from "./m10-errors";
import { m11 } from "./m11-files";
import { m12 } from "./m12-modules";
import { m13 } from "./m13-oop";
import { m14 } from "./m14-intermediate";
import { m15 } from "./m15-projects";

/** Full course content. Import only from server code (see content/server.ts). */
export const MODULES: Module[] = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15];
