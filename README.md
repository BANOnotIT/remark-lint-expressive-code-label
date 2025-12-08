# Remark lint for Expressive Code labelled line markers

Warns about labels that are rendered over code in production.

Expressive Code asks to [manually add empty lines](https://expressive-code.com/key-features/text-markers/#adding-labels-to-line-markers) in places where long labels will be rendered

## Usage

### CLI

Using [remark-cli](https://github.com/remarkjs/remark/tree/main/packages/remark-cli):

```bash
npm install --save-dev remark-cli remark-lint-expressive-code-label
remark --use remark-lint-expressive-code-label
```

### API

```js
import { remark } from "remark";
import remarkLintExpressiveCodeLabel from "remark-lint-expressive-code-label";

remark().use(remarkLintExpressiveCodeLabel, [
  "warn",
  {
    maxShortLabelLength: 1,
    keys: ["", "ins", "add", "rem", "del"],
  },
]);
```

## Options

You can pass arguments with API
```js
// Directly pass config with implicit "warn" severity
.use(remarkLintExpressiveCodeLabel, { /* ... */ })
// ESLint-style with severity name
.use(remarkLintExpressiveCodeLabel, "error")
// OR with level
.use(remarkLintExpressiveCodeLabel, 2)
// OR with additional config
.use(remarkLintExpressiveCodeLabel, ["error", { /* ... */ }])
```

Or with `.remarkrc.json` or `remarkConfig` in `package.json`:
```
{
  "plugins": [
    ...
    // implicit "warn" level    
    "remark-lint-expressive-code-label",
    // or with severity
    ["remark-lint-expressive-code-label", "warn"],
    // or with severity and config
    ["remark-lint-expressive-code-label", ["warn", { ... }]],
    // or just config
    ["remark-lint-expressive-code-label", { ... }],
  ]
}
```

### `keys`
- Type: `string[]`
- Default: `["", "ins", "add", "rem", "del"]`

Which keys to look for labeled hunks such as `ins` or `del`

~~~md
```code ins={"label": 1-2} del={"another": 2-4}
~~~


### `maxShortLabelLength`
- Type: `number`, non-negative
- Default: `1`

Short labels (usually just a letter) are allowed on any line.

~~~md
```code {"A": 1-2} {"Long label": 3-4}
~~~


## Development

- Install dependencies:

```bash
npm install
```

- Run the unit tests:

```bash
npm run test
```

- Build the library:

```bash
npm run build
```
