# servemd

Serves Markdown files over HTTP.

No magic, just serves static files out of a directory. If a file is a `.md`
file, it will render the Markdown into HTML. It will serve `README.md` or
`index.html` when a directory is requested if either exist.

By default the [Bootstrap](http://twitter.github.com/bootstrap/) (v2.3.1) CSS
file is linked to the generated HTML documents. Markdown is parsed by the
[marked](https://github.com/chjj/marked) library.

I made this project because I wanted the easiest way to preview documentation
files that would be uploaded to Github. Many existing utilities change the file
name (e.g. request `test.html` for the `test.md` file) or are too hard to
setup. Note that this is probably *not* secure, it is *not* meant for
development purposes.

## Installation

Install using NPM: `npm install servemd -g`

## Usage

```sh
servemd &                   # Starts the server on port 3000
curl http://localhost:3000/ # Get the contents of the README.md file rendered
```

Options:

```sh
servemd -d ~/           # Serves files from specified directory
servemd -p 1234         # Listens on the specified port
servemd -s mystyles.css # Link the specified CSS file to the HTML
servemd --help          # Get more help
```

## Notes

It currently does *not* do any syntax highlighting.

