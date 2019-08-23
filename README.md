## Search through a list of taxis that are in "ready" status(ie., not running) and automatically allocate the nearest one to the Pick Up location. You may also manually pick a callTaxi of your choice from the list.
(Note: There are No maps used. The routes are generated from the DOM elements that are represented as dotted paths)

# To see the output:

1) Download or clone this repository to your local folder.

2) Go to public folder and run "taxis.html".

In case you are seeing a CORS Alert message, you will have to try any one of the below:

- Run it in a Node environment, or a web sever to make "http" requests. (You may use "app.js" if you are running Node server).

- Try a different browser. (Firefox might work).

- Copy the JSON data from "mpoints.json" and assign it to an object variable in taxis.js file. Now you do not need the fetch api call to "mpoints.json"


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


