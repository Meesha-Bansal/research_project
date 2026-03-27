import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 5173);

const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".glb", "model/gltf-binary"],
  [".gltf", "model/gltf+json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml; charset=utf-8"],
]);

function safeResolve(urlPath) {
  const cleaned = decodeURIComponent(urlPath.split("?")[0]).replaceAll("\\", "/");
  const rel = cleaned === "/" ? "/index.html" : cleaned;
  const full = path.join(__dirname, rel);
  const normalized = path.normalize(full);
  if (!normalized.startsWith(__dirname)) return null;
  return normalized;
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = safeResolve(req.url || "/");
    if (!filePath) {
      res.writeHead(400);
      res.end("Bad path");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME.get(ext) || "application/octet-stream";
    const data = await fs.readFile(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
