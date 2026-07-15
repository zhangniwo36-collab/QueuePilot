import assert from "node:assert/strict";
import test from "node:test";

import { htmlLanguage, resolveLocale } from "../app/lib/locale.ts";

test("chooses and exposes the correct document language", () => {
  assert.equal(resolveLocale(null, "zh-CN"), "zh");
  assert.equal(resolveLocale("en", "zh-CN"), "en");
  assert.equal(resolveLocale("invalid", "en-US"), "en");
  assert.equal(htmlLanguage("zh"), "zh-CN");
  assert.equal(htmlLanguage("en"), "en");
});
