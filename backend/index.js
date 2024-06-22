const http = require('node:http');
const path = require('node:path');

const fs = require('node:fs');

// import path from 'node:path';
// import http from 'node:http';
// import fs from 'node:fs';
// import url from 'node:url';
// import { fileURLToPath } from 'node:url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const filePath = process.env.BACKUP_FILE_PATH || './db_backup.txt';

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
   fs.mkdirSync(imagesDir);
}

async function readBackupFile(filePath) {
   return new Promise((resolve, reject) => {
      const movies = new Map();
      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      let leftover = '';

      readStream.on('data', (chunk) => {
         const data = leftover + chunk;
         const lines = data.split('\n');
         leftover = lines.pop();
         for (const line of lines) {
            if (line) {
               const movie = JSON.parse(line);
               movies.set(movie.id, {
                  id: movie.id,
                  title: movie.title,
                  //   img: movie.img,
                  description: movie.description,
                  genre: movie.genre,
                  release_year: movie.release_year,
               });

               const imgPath = path.join(
                  __dirname,
                  'images',
                  `${movie.id}.jpeg`
               );
               fs.writeFileSync(imgPath, Buffer.from(movie.img, 'base64'));
            }
         }
      });

      readStream.on('end', () => resolve(movies));
      readStream.on('error', (error) => reject(error));
   });
}

async function startServer() {
   const movies = await readBackupFile(filePath);
   //    console.log(movies);
   const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      const parsedUrl = url.parse(req.url, true);

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

      if (req.url.startsWith('/api/v1/movie/') && req.method === 'GET') {
         const movieId = req.url.split('/').pop();
         if (movies.has(movieId)) {
            const movie = movies.get(movieId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(movie));
         } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Movie not found');
         }
         return;
      }

      // надо по названию найти фильм в Map
      if (req.url === '/api/v1/search' && req.method === 'GET') {
         const searchResults = Array.from(movies.values()).filter((movie) =>
            movie.title.toLowerCase().includes(title.toLowerCase())
         );

         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify({ search_result: searchResults }));
         return;
      }

      if (req.url === '/api/v1/search' && req.method === 'GET') {
         const { title = '', page = 1 } = parsedUrl.query;
         const searchResults = Array.from(movies.values())
            .filter((movie) =>
               movie.title.toLowerCase().includes(title.toLowerCase())
            )
            .slice((page - 1) * 10, page * 10);

         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.end(
            JSON.stringify({
               search_result: searchResults,
            })
         );
         return;
      }

      if (req.url.startsWith('/static/images/') && req.method === 'GET') {
         const imageName = req.url.split('/').pop();
         const imagePath = path.join(__dirname, 'images', imageName);
         fs.readFile(imagePath, (err, data) => {
            if (data) {
               res.writeHead(200, { 'Content-Type': 'image/jpeg' });
               res.end(data);
            } else {
               res.writeHead(404, { 'Content-Type': 'text/plain' });
               res.end('Image not found');
            }
         });
         return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
   });

   server.listen(port, () => {
      console.log(`server is running port: ${port}`);
   });
}

startServer();
