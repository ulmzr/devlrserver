const http = require("http");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { WebSocketServer } = require("ws");

let cwd = process.cwd();
let argv = process.argv;
let port = argv.indexOf("-p", 0) > 0 ? argv[argv.indexOf("-p", 0) + 1] : 8080;
let watch = argv.indexOf("-w", 0) > 0 ? argv[argv.indexOf("-w", 0) + 1] : "*.js";
let outdir = argv.indexOf("-o", 0) > 0 ? argv[argv.indexOf("-o", 0) + 1] : "public";

watch = watch.split("|");
let index = indexHTML();

const server = http.createServer((req, res) => {
   let content;
   let code = "200";
   let url = req.url.replace(/(.*\/|\?.*)$/g, "") || "/";
   let arr = url.split(".");

   if (arr[1]) {
      let filename = path.join(cwd, outdir, url);
      if (fs.existsSync(filename)) content = fs.readFileSync(filename);
      else code = "404";
      res.writeHead(code, { "Content-Type": mime(arr[1]) });
   } else {
      res.writeHead(code, { "Content-Type": "text/html" });
      content = index;
   }
   console.log(code == "200" ? code : 400, url);
   res.end(content);
});

server.listen(port);
console.log(`Listening on http://localhost${port === 80 ? `` : `:${port}`}`);

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
   let timer;

   const startTimer = () => {
      timer = setTimeout(() => {
         ws.send("reload");
      }, 250);
   };

   const reload = () => {
      clearTimeout(timer);
      startTimer();
   };

   ws.on("error", console.error);

   chokidar
      .watch(watch, {
         ignored: /(^|[\/\\])\../,
         persistent: true,
         cwd: outdir,
      })
      .on("change", reload);
});

function mime(ext) {
   const map = {
      bin: "application/octet-stream",
      pdf: "application/pdf",
      json: "application/json",
      webmanifest: "application/json",
      html: "text/html, charset=UTF-8",
      js: "text/javascript",
      css: "text/css",
      ico: "image/x-icon",
      png: "image/png",
      jpg: "image/jpeg",
      webp: "image/webp",
      svg: "image/svg+xml",
      wav: "audio/wav",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      webm: "video/webm",
   };
   return map[ext] || map.bin;
}

function indexHTML() {
   const readIndex = fs.readFileSync(outdir + "/index.html", "utf8");
   return readIndex.replace(`</head>`, `<script>${reloadScript()}</script></head>`);
}

function reloadScript() {
   return `let socketUrl="ws://localhost:${port}";
let wss=new WebSocket(socketUrl);
let delay;
wss.onclose = () => {
   let start = () => {
      wss = new WebSocket(socketUrl);
      wss.onerror = () => setTimeout(start, 2e3);
      wss.onopen = () => location.reload();
   };
   start();
};
wss.onmessage = e => location.reload();
`;
}
