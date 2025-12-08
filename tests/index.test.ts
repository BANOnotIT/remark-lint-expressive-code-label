import dedent from "dedent";
import { remark } from "remark";
import remarkLint from "remark-lint";
import { describe, expect, test } from "vitest";
import lintExpressiveCode, {
  type LintExpressiveCodeLabelOptions,
} from "../src";

describe("basic", () => {
  test("should warn if label is not on empty line", async () => {
    const file = await lintFile(dedent`
            ~~~code {"label":2-3}
            before
            clash-with-label
            after
            ~~~
            `);

    expect(file.messages.map(String)).toEqual([
      `virtual.md:3:1: Code clashes with label "label"`,
    ]);
  });

  test("should allow if label is on empty line", async () => {
    const file = await lintFile(dedent`
            ~~~code {"label":2-3}
            before

            after
            ~~~
            `);

    expect(file.messages).toHaveLength(0);
  });
});

describe("short labels", () => {
  test("should allow placing short labels on non-empty lines", async () => {
    const file = await lintFile(dedent`
            ~~~code {"A":2-3}
            before
              clash-with-label
              after
            ~~~
            `);

    expect(file.messages).toHaveLength(0);
  });

  test("should allow labels less than maxShortLabelLength", async () => {
    const file = await lintFile(
      dedent`
        ~~~code {"snip":2-3}
        before
          clash-with-label
          after
        ~~~
        `,
      { maxShortLabelLength: 4 },
    );

    expect(file.messages).toHaveLength(0);
  });

  test("should warn on labels longer than maxShortLabelLength", async () => {
    const file = await lintFile(
      dedent`
        ~~~code {"snippet":2-3}
        before
          clash-with-label
          after
        ~~~
        `,
      { maxShortLabelLength: 4 },
    );

    expect(file.messages.map(String)).toEqual([
      `virtual.md:3:1: Code clashes with label "snippet"`,
    ]);
  });
});

async function lintFile(
  content: string,
  options?: LintExpressiveCodeLabelOptions,
  path = "virtual.md",
) {
  return await remark()
    .use(remarkLint)
    .use(lintExpressiveCode, ["error", options])
    .process({
      path,
      value: content,
    });
}
