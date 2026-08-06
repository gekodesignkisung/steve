/* ============================================================
   steve — 개발용 정적 서버
   의존성 없음. 빌드 단계 아님. 브라우저로 index.html을 직접 열어도 동작한다.

     node server.js          기본 4050 포트
     node server.js 4321     포트 지정
   ============================================================ */
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 4050);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".woff2": "font/woff2",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ "Cache-Control": "no-store" }, headers));
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const started = process.hrtime.bigint();
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(res, 400, "잘못된 경로입니다.", { "Content-Type": MIME[".txt"] });
  }

  if (urlPath.endsWith("/")) urlPath += "index.html";

  // 루트 밖으로 나가는 경로는 거부
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    return send(res, 403, "접근할 수 없는 경로입니다.", { "Content-Type": MIME[".txt"] });
  }

  try {
    const stat = await fsp.stat(filePath);
    if (stat.isDirectory()) {
      res.writeHead(302, { Location: urlPath + "/" });
      return res.end();
    }

    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": stat.size,
      "Cache-Control": "no-store"
    });
    fs.createReadStream(filePath).pipe(res);

    res.on("finish", () => {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      console.log(`200  ${urlPath}  ${stat.size}B  ${ms.toFixed(1)}ms`);
    });
  } catch (err) {
    if (err.code === "ENOENT" || err.code === "ENOTDIR") {
      console.log(`404  ${urlPath}`);
      return send(res, 404, `찾을 수 없습니다: ${urlPath}`, { "Content-Type": MIME[".txt"] });
    }
    console.error(`500  ${urlPath}`, err.message);
    return send(res, 500, "서버에서 파일을 읽지 못했습니다.", { "Content-Type": MIME[".txt"] });
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`포트 ${PORT}이 이미 사용 중입니다. 다른 포트로 실행하세요: node server.js 4051`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`steve  →  http://localhost:${PORT}`);
  console.log(`root   →  ${ROOT}`);
});
