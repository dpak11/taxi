## Search through a list of callTaxis that are in "ready" status(ie., not running) and automatically allocate the nearest one to the Pick Up location. You may also manually pick a callTaxi of your choice from the list.

# To see the output:

1) Download or clone this repository to your local folder.

2) Go to public folder and run "taxis.html".

In case you are seeing a CORS Alert message, it means that your browser will only allow 'http:','https:' requests from your local. So now you will need to run it in a Node environment, or Alternatively you can also try a different browser. (Firefox worked for me)

# Running in Node:

In the root folder(where you have app.js), open the command prompt(SHIFT + right click), and run this commad,

```
npm install
```

After installation is complete, run the command,

```
node app.js
```

Finally, open your browser and go to "http://localhost:3000/"


