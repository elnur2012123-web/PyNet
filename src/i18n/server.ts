import "server-only";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "./locales";
import { makeT } from "./translate";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : "en";
}
/** For server components: `const tx = await getT();` */
export async function getT() {
  return makeT(await getLocale());
}
