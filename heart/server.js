const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "localhost";
const PORT = 3000;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mkv": "video/x-matroska",
  ".svg": "image/svg+xml",
};

function safeJoin(baseDir, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^([/\\])+/, "");
  const fullPath = path.join(baseDir, normalized);
  if (!fullPath.startsWith(baseDir)) return null;
  return fullPath;
}

function resolvePath(urlPath) {
  const pathname = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (pathname === "/" || pathname === "/index.html") {
    return path.join(ROOT_DIR, "index.html");
  }

  const publicPath = safeJoin(PUBLIC_DIR, pathname);
  if (publicPath && fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    return publicPath;
  }

  const rootPath = safeJoin(ROOT_DIR, pathname);
  if (rootPath && fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
    return rootPath;
  }

  return null;
}

function sendFile(request, response, filePath) {
  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Internal server error");
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    const rangeHeader = request.headers.range;

    if (rangeHeader) {
      const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
      if (!match) {
        response.writeHead(416, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Invalid range");
        return;
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stats.size - 1;

      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start < 0 || end >= stats.size) {
        response.writeHead(416, {
          "Content-Range": `bytes */${stats.size}`,
          "Content-Type": "text/plain; charset=utf-8",
        });
        response.end("Requested range not satisfiable");
        return;
      }

      response.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Content-Type": contentType,
      });

      fs.createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "Content-Length": stats.size,
      "Content-Type": contentType,
    });

    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  sendFile(request, response, resolvePath(request.url));
});

server.listen(PORT, HOST, () => {
  console.log(`Heart app running at http://${HOST}:${PORT}`);
});
