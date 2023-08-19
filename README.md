# Simple Node HTTP Server with livereload
For development only, do not use in production.

### Install

```bash
npm i -D devlrserver
```
### Usage
```js
// app.js
const serve = require('devlrserver');
serve(options)
...
```

### Options

```js
const options = {
   port:[port] // Default:8080
   watch:["*.js"] // Default "*.js". User comma to seperate file name.
   outdir:[public_folder] // Default "public"
}
```

