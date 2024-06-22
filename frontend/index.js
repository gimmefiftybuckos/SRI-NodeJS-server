async function ping() {
   const res = await fetch('http://localhost:3000/ping');
   //    const data = await res.json();
   //    await console.log(await data);
   await console.log(await res);
}

// ping();

async function echo(textMessage) {
   const res = await fetch('http://localhost:3000/echo', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         message: textMessage,
      }),
   });

   const data = await res.json();

   console.log(data);
}

// echo('Привет!!');

async function requestFilms(id) {
   const res = await fetch(`http://localhost:3000/api/v1/movie/${id}`);

   const data = await res.json();

   await console.log(data);
}

requestFilms('326');

async function search(title, page) {
   const res = await fetch(
      `http://localhost:3000/api/v1/search?title=${title}&page=${page}`
      // ,
      // {
      //    method: 'GET',
      //    headers: {
      //       'Content-Type': 'application/json; charset=utf-8',
      //    },
      // }
   );

   await console.log(res);
}

search('Брат', 1);
