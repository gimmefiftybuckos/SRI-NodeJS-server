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

echo('Привет!!');
