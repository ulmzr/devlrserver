# Simple Node HTTP Server with livereload
For development only, do not use in production.

### Install

```bash
npm i -D devlrserver
```
### Usage
```bash
node app.js [options]
```
```js
// app.js
require('devlrserver');
...
```

### Options

```
--port [...]   = Default 8080.
--watch [...]  = Separate by comma. Default "*.js". 
--outdir [...] = Default "public".
```

