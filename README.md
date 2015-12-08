
# a11y-examples (incomplete)

Examples of accessible design patterns as prescribed by [WAI-ARIA 1.0 Authoring Practices](http://www.w3.org/TR/wai-aria-practices/#aria_ex)

## Viewing the Examples

You can either clone the repository or download an archive of the repository.

### Option 1: ZIP Archive

[Download the archive](https://github.com/isner/a11y-examples/archive/master.zip), then open `dist/index.html` in your browser.

### Option 2: Cloning with Git

Clone the repository using

```bash
$ git clone git@github.com:isner/a11y-examples.git
```

Open `dist/index.html` in your browser.

## Modifying the Examples

**NOTE:** Modifying the examples requires [nodejs](https://nodejs.org/en/) and [git](https://git-scm.com/).

Clone and install the dependencies using

```bash
$ git clone git@github.com:isner/a11y-examples.git
$ cd a11y-examples
$ npm install
$ bower install
```

Make changes to the examples in the `examples/` directory, then rebuild using

```bash
$ npm run build
```

## TODO

Add a password-strength indicator, like [this one](https://css-tricks.com/password-strength-meter/).
