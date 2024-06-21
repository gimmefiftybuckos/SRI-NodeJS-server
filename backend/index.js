const http = require('node:http');
const path = require('node:path');

const fs = require('node:fs');

const port = process.env.PORT || 3000;

function readBackupFile(filePath) {
   return new Promise((resolve, reject) => {
      const movieData = [];
      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

      readStream.on('data', (chunk) => {
         chunk.split('\n').forEach((line) => {
            if (line) {
               const movie = JSON.parse(line);
               movieData[movie.id] = {
                  id: movie.id,
                  title: movie.title,
                  img: movie.img,
                  description: movie.description,
                  genre: movie.genre,
                  release_year: movie.release_year,
               };
               const imgPath = path.join(
                  __dirname,
                  'images',
                  `${movie.id}.jpeg`
               );
               fs.writeFileSync(imgPath, Buffer.from(movie.img, 'base64'));
            }
         });
      });

      readStream.on('end', () => resolve(movieData));
      readStream.on('error', (error) => reject(error));
   });
}

async function startServer() {
   const films = await readBackupFile('./db_backup.txt');
   console.log(films);
   const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.url === '/ping' && req.method === 'GET') {
         console.log(req.method);
         res.writeHead(200, {
            'Content-Type': 'text/html',
         });
         return res.end('pong!');
      }

      if (req.url === '/echo' && req.method === 'POST') {
         res.writeHead(200, {
            'Content-Type': 'application/json',
         });
         let body = '';
         req.on('data', (chunk) => {
            body += chunk;
         });

         req.on('end', () => {
            const parsedBody = JSON.parse(body);
            return res.end(JSON.stringify(parsedBody));
         });

         return;
      }
      res.end('Hello! ');
   });

   server.listen(port, () => {
      console.log(`server is running port: ${port}`);
   });
}

startServer();
