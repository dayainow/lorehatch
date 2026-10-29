import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname,'..');
const mime = {'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server = http.createServer(async (req,res)=> {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = resolve(root,`.${pathname === '/' ? '/index.html':pathname}`);
    const relative = file.slice(root.length+1);
    if (!file.startsWith(root+sep) || relative.split(sep).some(x=>x.startsWith('.')) || !['index.html','app','data','assets'].includes(relative.split(sep)[0])) { res.writeHead(404);res.end('Not found');return; }
    if (!(await stat(file)).isFile()) throw new Error();
    res.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(await readFile(file));
  } catch { res.writeHead(404);res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173),'127.0.0.1',()=>console.log(`Lorehatch: http://127.0.0.1:${server.address().port}`));
server.on('error',err=> { console.error(err.message); process.exitCode=1; });
