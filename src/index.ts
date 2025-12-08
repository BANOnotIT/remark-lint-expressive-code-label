import { MetaOptions } from "@expressive-code/core";
import type { Root } from "mdast";
import { phrasing } from "mdast-util-phrasing";
import { lintRule } from "unified-lint-rule";
import { pointStart } from "unist-util-position";
import { SKIP, visitParents } from "unist-util-visit-parents";

export type LintExpressiveCodeLabelOptions = {
  keys?: string[];
  maxShortLabelLength?: number;
};

const remarkLintExpressiveCodeLabel = lintRule(
  {
    origin: "expressive-code-label:clashes-with-code",
  },
  (tree: Root, file, options?: LintExpressiveCodeLabelOptions) => {
    if (
      typeof options?.maxShortLabelLength === "number" &&
      options.maxShortLabelLength < 0
    ) {
      file.fail("maxShortLabelLength must be a positive number");
    }

    visitParents(tree, (node, parents) => {
      if (phrasing(node)) {
        return SKIP;
      }
      const start = pointStart(node);

      if (!start) {
        return;
      }

      if (node.type !== "code") return;

      if (typeof node.meta !== "string") return;

      const meta = new MetaOptions(node.meta);
      if (meta.errors) {
        for (const cause of meta.errors) {
          file.message(cause, {
            ancestors: [...parents, node],
            place: start,
          });
        }
        return;
      }

      const labeledHunks = meta
        .list(options?.keys ?? ["", "ins", "add", "rem", "del"], "range")
        .flatMap((meta) => {
          let label: string | undefined;
          const range = meta.value.replace(
            /^\s*?(["'])((?:(?!\1).)+?)\1:\s*?/,
            (_match, _quote, labelValue: string) => {
              label = labelValue;
              return "";
            },
          );

          if (!label || label.length <= (options?.maxShortLabelLength ?? 1))
            return [];

          return range.split(/\s*,\s*/).map((range) => ({
            label: label as string,
            range,
          }));
        });
      if (!labeledHunks.length) return;

      const codeLines = node.value.split("\n");
      for (const { label, range } of labeledHunks) {
        // we only get first line of the hunk because labels can't be multiline
        const hunkFirstLine = parseInt(range.trimStart(), 10);

        const codeLine = codeLines[hunkFirstLine - 1];

        if (!isEmptyLine(codeLine)) {
          file.message(`Code clashes with label "${label}"`, {
            ancestors: [...parents, node],

            place: {
              line: start.line + hunkFirstLine,
              column: 0,
            },
          });
        }
      }
    });
  },
);

export default remarkLintExpressiveCodeLabel;

function isEmptyLine(line: string) {
  return /^\s*$/.test(line);
}
