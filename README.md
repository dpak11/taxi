### Search through a list of taxis that are in "ready" status(ie., not running) and automatically allocate the nearest one to the Pick Up location. You may also manually pick a taxi of your choice from the list.
(NOTE: There are No maps used in this example. The routes are DOM elements represented as dots. There are 4 set of routes(in mpoints.json) which are selected randomly when page is loaded or refreshed)



## Output:

1) Download or clone this repository to your local folder.

2) Go to public folder and run "taxis.html".

In case you are seeing a CORS Alert message, try any 1 of the below:

- Run it in a Node environment, or in any other web server to make `http` requests.

- Copy the JSON data from `mpoints.json` and assign it to `const json` ([line #158](https://github.com/dpak11/taxi/blob/5ddd6eaf1c341b21bba029368576a46d9bc47226/public/taxis.js#L158)). Now you do not need `async` and `await`.


## Running in Node:

In the root folder(where you have main.js), open the command prompt(SHIFT + right click), and run this commad,

```
npm install
```

After installation is complete, run the command,

```
node main
```

Finally, open your browser and go to "http://localhost:3000/"


