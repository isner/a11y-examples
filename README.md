
# a11y-examples

Examples of accessible design patterns as prescribed by [WAI-ARIA 1.0 Authoring Practices](http://www.w3.org/TR/wai-aria-practices/#aria_ex). Other examples that I find interesting or important will be included as well.

**NOTE:** Not all the patterns outlined in the ARIA Authoring Practices guide are represented here - it's a work in progress.

## Viewing the Examples

```bash
$ git clone git@github.com:isner/a11y-examples.git
```

Open `dist/index.html` in your browser.

## Modifying the Examples

**NOTE:** Modifying the examples requires [nodejs](https://nodejs.org/en/).

```bash
$ git clone git@github.com:isner/a11y-examples.git
$ cd a11y-examples
$ npm install
```

Make changes to the examples in the `examples/` directory, then rebuild using

```bash
$ npm run build
```

## TODO

- Add a password-strength indicator, like [this one](https://css-tricks.com/password-strength-meter/).
- Finish the Autocomplete example.
