# react-code-input

A lightweight component that turns `<input type="text" />` into a mini code editor.

Provides basic tokenisation, parsing, syntax highlighting, validation and code completion for simple code expressions.

There are zero dependencies and you can style the input in any way that you want.

## Quick start

```tsx
import { CodeInput } from "@mertdogar/react-code-input";

export default () => (
  <CodeInput
    placeholder="price - vat"
    schema={...JSON7...}
    customInputComponent={MyInput}
    style={{ width: "300px" }}
    onChange={event => {
      console.log(event.tokens);
      console.log(event.currentTarget.value);
    }}
  />
);
```
