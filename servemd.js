#!/usr/bin/env node

var url = require('url'),
    path = require('path'),
    fs = require('fs'),
    marked = require('marked'),
    send = require('send'),
    http = require('http'),
    nomnom = require('nomnom');

var options;

function serve(req, resp) {
    var file = url.parse(req.url).pathname;
    if (path.extname(file) === '.md') {
        serveMarkdown(file, req, resp);
    } else {
        serveStatic(file, req, resp);
    }
}

function error(err, resp) {
    resp.statusCode = err.code === 'ENOENT' ? 404 : 500;
    resp.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    resp.end('Error:\r\n' + err.toString());
}

function serveMarkdown(file, req, resp) {
    fs.readFile(path.join(options.dir, file), 'utf8', function(err, src) {
        if (err) { return error(err, resp); }
        resp.setHeader('Content-Type', 'text/html; charset=UTF-8');
        resp.end(markdown(src, file));
    });
}

function serveStatic(file, req, resp) {
    send(req, file)
        .root(options.dir)
        .on('directory', function() { serveDir(file, req, resp); })
        .on('error', function(err) { error(err, resp); })
        .index(false)
        .pipe(resp);
}

function serveDir(file, req, resp) {
    if (!/(?:\/|\\)$/.test(file)) {
        resp.statusCode = 301;
        resp.setHeader('Location', file + '/');
        resp.end('Redirecting to directory');
        return;
    }

    function findReadme() {
        var readme = path.join(file, 'README.md');
        fs.exists(path.join(options.dir, readme), function(exists) {
            if (exists) {
                serveMarkdown(readme, req, resp);
            } else {
                findIndex();
            }
        });
    }

    function findIndex() {
        var index = path.join(file, 'index.html');
        fs.exists(path.join(options.dir, index), function(exists) {
            if (exists) {
                serveStatic(index, req, resp);
            } else {
                notFound();
            }
        });
    }

    function notFound() {
        resp.statusCode = 404;
        resp.end('Could not find ' + file);
    }

    findReadme();
}

function markdown(src, file) {
    var title,
        tokens = marked.lexer(src);

    if (tokens.length > 0 && tokens[0].type === 'heading') {
        title = tokens[0].text;
    } else {
        title = path.basename(file);
    }

    return makeDocument(title, options.style, marked.parser(tokens));
}

function makeDocument(title, style, fragment) {
    return [
        '<!DOCTYPE html>',
        '<html><head>',
        '<title>', title, '</title>',
        style ? '<link rel="stylesheet" href="' + style + '">' : '',
        '</head><body>',
        '<div class="container">', fragment, '</div>',
        '</body></html>'
    ].join('');
}

options = nomnom
    .script('servemd')
    .help('Serve Markdown files over HTTP')
    .options({
        style: {
            abbr: 's',
            metavar: 'CSS',
            help: 'CSS file to link',
            default: 'http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.1/css/bootstrap.min.css'
        },
        port: {
            abbr: 'p',
            metavar: 'PORT',
            help: 'Port to for the HTTP server',
            default: 3000
        },
        dir: {
            abbr: 'd',
            metavar: 'DIR',
            help: 'The directory to serve files from',
            default: process.cwd()
        }
    })
    .nom();

http.createServer(serve).listen(options.port, function() {
    console.log('Listening on port', options.port);
});
