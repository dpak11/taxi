const submitPickupBtn = document.getElementById("submitPickup");
submitPickupBtn.addEventListener("click", () => {
    let pick = document.getElementById("pickupSel").value;
    let drop = document.getElementById("dropSel").value;
    if (pick != drop) {
        submitPickupBtn.setAttribute("disabled", "disabled");
        CallTaxiPool.lookup.cabsnum = CallTaxiPool.alltaxis.length - 1;
        CallTaxiPool.lookup.search("xxx", pick, drop);
    }
});

const CallTaxiPool = {
    alltaxis: [],
    taxiNameList: [],
    add: function(taxi) {
        for (let i in this.alltaxis) {
            if (this.alltaxis[i].id.toLowerCase() == taxi.name.toLowerCase()) {
                console.log("Taxi Duplicate");
                return false;
            }
        }
        let _obj = { id: taxi.name, currentLoc: "a", status: "ready", destination: "a", customer: "", distance: 0, total: 0, price: taxi.cost };
        this.alltaxis.push(_obj);
        this.displayStatus(taxi.name, "ready", "", "a", "a", 0);
        this.taxiNameList.push(taxi.name);
        let option = document.createElement("option");
        option.value = taxi.name;
        option.text = taxi.name;
        document.getElementById("cab_name").appendChild(option);
        return _obj;
    },
    nearest: function(pick, end, txid, strictlyTaxi) {
        let routesequence = "abcdefghij";
        let _apoint = routesequence.indexOf(pick);
        let myTaxiClone = JSON.parse(JSON.stringify(CallTaxiPool.alltaxis));

        for (let j in myTaxiClone) {
            if (myTaxiClone[j].status == "ready") {
                let _end = routesequence.indexOf(end);
                if ((txid == myTaxiClone[j].id && strictlyTaxi == txid) || (strictlyTaxi == "" && myTaxiClone[j].currentLoc == pick && txid == myTaxiClone[j].id)) {
                    myTaxiClone[j].distance = 50 * Math.abs(_apoint - _end);
                    return myTaxiClone[j];
                }
            }
        }

        if (strictlyTaxi != "") {
            return false;
        }

        myTaxiClone = myTaxiClone.filter((elem) => elem.status == "ready");
        myTaxiClone.forEach(taxiclone => {
            let _end = routesequence.indexOf(end);
            let _curr = routesequence.indexOf(taxiclone.currentLoc);
            taxiclone.distance = 50 * Math.abs(_apoint - _end);
            taxiclone.pickDist = Math.abs(_apoint - _curr);
        });

        myTaxiClone.sort((a, b) => a.pickDist - b.pickDist);

        if (myTaxiClone.length == 1) {
            return myTaxiClone[0];
        }

        myTaxiClone = myTaxiClone.filter(elem => elem.pickDist === myTaxiClone[0].pickDist);

        for (let fx in myTaxiClone) {
            if (myTaxiClone[fx].id == txid) {
                return myTaxiClone[fx];
            }
        }

        if (myTaxiClone.length >= 1) {
            return myTaxiClone[0];
        }

        return false;
    },
    update: function(id, state, customer, pickup, end, dist, tot) {
        let alltaxiLen = CallTaxiPool.alltaxis;
        for (let z in CallTaxiPool.alltaxis) {
            if (alltaxiLen[z].id == id) {
                alltaxiLen[z].status = state;
                alltaxiLen[z].customer = customer;
                alltaxiLen[z].currentLoc = pickup;
                alltaxiLen[z].destination = end;
                alltaxiLen[z].distance = dist;
                alltaxiLen[z].total = tot;
            }
        }
    },
    lookup: {
        cabsnum: 0,
        search: function(n, p, d) {
            if (CallTaxiPool.lookup.cabsnum > 0) {
                setTimeout(() => {
                    document.getElementById("searchlog").innerText = "Searching...";
                    let mycab = document.getElementById("cab_name").value;
                    let strictSearch = mycab == "none" ? "" : mycab;
                    if (strictSearch != "" && CallTaxiPool.taxiNameList.indexOf(mycab) == -1) {
                        document.getElementById("searchlog").innerText = "Not Found";
                        submitPickupBtn.removeAttribute("disabled");
                    } else if (!taxiInstances[CallTaxiPool.lookup.cabsnum].pickme(n, p, d, strictSearch)) {
                        CallTaxiPool.lookup.search(n, p, d);
                        CallTaxiPool.lookup.cabsnum--;
                    } else {
                        document.getElementById("searchlog").innerText = "";
                        submitPickupBtn.removeAttribute("disabled");
                    }
                }, 1000);
            } else {
                document.getElementById("searchlog").innerText = "Not available";
                submitPickupBtn.removeAttribute("disabled");
            }
        }
    },
    getSummary: function() {
        let summary = "";
        this.alltaxis.forEach(taxi => {
            summary += `<span class="nameCaps">${taxi.id} (Rs.${taxi.price}/Km)</span><span> Remaining: ${taxi.distance} Kms </span><span> Total(All trips): Rs.${taxi.total}</span><br/>`;
        });
        document.getElementById("infoTaxis").innerHTML = summary;
    },
    displayStatus: function() {
        let alph = "abcdefghij";
        for (let i = 0; i < 10; i++) {
            document.getElementById("col-point-" + alph.substr(i, 1)).innerHTML = "";
            document.getElementById("col-halt-" + alph.substr(i, 1)).innerHTML = "";
        }

        this.alltaxis.forEach(txi => {
            let cell1 = document.getElementById("col-point-" + txi.currentLoc);
            let cell2 = document.getElementById("col-halt-" + txi.destination);
            let activetxt1 = "";
            let activetxt2 = "";
            if (txi.status == "ready") {
                activetxt1 = "<span class='' style = 'color:green;font-weight:normal'>";
            } else if (txi.status == "running") {
                activetxt1 = "<span class='blinker' style = 'color:grey;font-weight:normal'>";
            } else {
                activetxt1 = "<span class='' style = 'color:grey;font-weight:normal'>";
            }
            cell1.innerHTML = `${cell1.innerHTML} ${activetxt1} ${txi.id} (${txi.status})</span><br/><br/>`;

            if (txi.status == "running") {
                activetxt2 = `<span class='blinker ${txi.id}'>`;
            } else {
                activetxt2 = "<span class='hidetaxi'>";
            }
            cell2.innerHTML = `${cell2.innerHTML} ${activetxt2} ${txi.id} </span><br/><br/>`;
        });
    }
};

const DOMRoutePoints = {
    getJsonVals: async function() {
        const mpoints = await fetch("mpoints.json");
        const json = await mpoints.json();
        return json.points[Math.floor(Math.random() * json.points.length)];
    },
    mapSeqPoints: {},
    init: async function() {
        try {
            this.mapSeqPoints = await this.getJsonVals();
            let mapBasePoints = [];
            for (let px in this.mapSeqPoints) {
                mapBasePoints.push(...this.mapSeqPoints[px].split(","));
            }

            for (let z = 0; z < 6; z++) {
                let tableRow = document.createElement("tr");
                tableRow.innerHTML = `<td colspan="90" class="cabnames" id="subtab${z}">${CallTaxiPool.taxiNameList[z]}</td>`;
                document.querySelector("#mapTable tbody").appendChild(tableRow);
                for (let i = 0; i < 10; i++) {
                    let row = document.createElement("tr");
                    row.setAttribute("class", `map${z}_row${i}`);
                    for (let j = 0; j < 100; j++) {
                        let td = document.createElement("td");
                        td.setAttribute("id", `map${z}_cell${i}_${j}`);
                        row.appendChild(td);
                    }
                    document.querySelector("#mapTable tbody").appendChild(row);
                }

            }

            let taxiLen = CallTaxiPool.taxiNameList.length;
            mapBasePoints.forEach((el) => {
                for (let m = 0; m < taxiLen; m++) {
                    let query = `#map${m}_cell${el}`;
                    document.querySelector(query).classList.add("highlight");
                }
            });
        } catch (err) {
            console.log(err);
            if (window.location.href.indexOf("http") == 0) {
                alert("JSON file missing or invalid");
            } else {
                alert("URL scheme must be 'http' or 'https' for CORS request. Try running from a Node server.")
            }

        }

    },
    update: function(name, status, start, end, distLeft) {
        let routesequence = "abcdefghij";
        let _apoint = routesequence.indexOf(start);
        let _end = routesequence.indexOf(end);
        let _totDist = 50 * Math.abs(_apoint - _end);
        let perc = Math.round(((_totDist - distLeft) / _totDist) * 100);
        let taxiIndex = CallTaxiPool.taxiNameList.indexOf(name);

        let refObj = {
            dom: function(elm, method) {
                CallTaxiPool.alltaxis.forEach(t => {
                    if (t.id == name) {
                        if (method == "save") {
                            t.DOM_elm = elm;
                        } else if (t.DOM_elm) {
                            document.querySelector(t.DOM_elm).classList.remove("mark-red");
                        }

                    }
                });
            }
        };

        if (status.includes("picking")) {
            refObj.dom(null, "get");
        }

        let order = [];
        if (_apoint > _end) {
            for (let cnt = _apoint; cnt >= _end; cnt--) {
                order.push(routesequence.substr(cnt, 1));
            }
            order.splice(0, 1);
        } else {
            for (let cnt = _apoint; cnt < _end; cnt++) {
                order.push(routesequence.substr(cnt, 1));
            }
        }


        let seqlist = [];
        order.forEach((s) => {
            let p = DOMRoutePoints.mapSeqPoints["point_" + s].split(",");
            if (_apoint > _end) {
                p.reverse();
            }
            seqlist.push(...p);
        });

        let progressPointTotalCells = Math.floor((seqlist.length * perc) / 100);

        for (let seq in seqlist) {
            let domEl = `#map${taxiIndex}_cell${seqlist[seq]}`;
            if (status == "clear") {
                document.querySelector(domEl).classList.remove("activepoints", "mark-red");
                if (seq == (seqlist.length - 1)) {
                    document.querySelector(domEl).classList.add("mark-red");
                    refObj.dom(domEl, "save");
                }
                if (seq == (seqlist.length - 2)) {
                    document.querySelector(domEl).classList.remove("red-blinker");
                }
            } else if (status.includes("picking")) {
                if (seq == 0) {
                    document.querySelector(domEl).classList.add("mark-red");
                    document.querySelector(domEl).classList.add("red-blinker");
                }
            } else {
                if (document.querySelector(domEl).classList.contains("activepoints") === false) {
                    document.querySelector(domEl).classList.add("activepoints");
                }

                if (seq <= (progressPointTotalCells - 1)) {
                    document.querySelector(domEl).classList.add("mark-red");
                }
                if (seq < (progressPointTotalCells - 1)) {
                    document.querySelector(domEl).classList.remove("red-blinker");
                }
                if (seq == (progressPointTotalCells - 1)) {
                    document.querySelector(domEl).classList.add("red-blinker");
                }
            }

        }

    }
};

function pageAutoScroll(id) {
    let subtab = "#subtab" + CallTaxiPool.taxiNameList.indexOf(id);
    setTimeout(() => {
        $('html,body').animate({
            scrollTop: $(subtab).offset().top - 150
        }, 3000);
    }, 2000);
}


function CallTaxi(taxi) {
    let taxiObj = CallTaxiPool.add(taxi);
    if (taxiObj) {
        let startPoint = taxiObj.currentLoc;
        let destination = taxiObj.destination;
        let customer = taxiObj.customer;
        let id = taxiObj.id;
        let status = taxiObj.status;
        let taxiRunTime;
        let distLeft = 0;
        let totalFare = 0;
        let baseFare = taxiObj.price; // Rs. per Km
        let speed = 2 // kms in 10 seconds
        this.pickme = function(cust, pickup, dest, strictTaxi) {
            if (pickup == dest) {
                return false;
            }
            let nearestTaxi = CallTaxiPool.nearest(pickup, dest, id, strictTaxi);
            if (!nearestTaxi) { return false }
            if (nearestTaxi.id !== id) { return false }
            status = "picking up...";
            customer = cust;
            startPoint = pickup;
            destination = dest;
            distLeft = nearestTaxi.distance;
            totalFare += nearestTaxi.distance * baseFare;
            CallTaxiPool.update(id, status, customer, startPoint, destination, distLeft, totalFare);
            CallTaxiPool.displayStatus();
            DOMRoutePoints.update(id, status, startPoint, destination, distLeft);
            pageAutoScroll(id);
            setTimeout(() => {
                status = "running";
                CallTaxiPool.update(id, "running", customer, startPoint, destination, distLeft, totalFare);
                CallTaxiPool.displayStatus();
                DOMRoutePoints.update(id, "running", startPoint, destination, distLeft);
                taxiRunTime = setInterval(() => {
                    distLeft -= speed;
                    if (distLeft <= 0) {
                        clearInterval(taxiRunTime);
                        status = "ready";
                        CallTaxiPool.update(id, "ready", customer, destination, destination, 0, totalFare);
                        CallTaxiPool.displayStatus();
                        DOMRoutePoints.update(id, "clear", startPoint, destination);
                    } else {
                        CallTaxiPool.update(id, "running", customer, startPoint, destination, distLeft, totalFare);
                        DOMRoutePoints.update(id, "running", startPoint, destination, distLeft);
                    }
                }, 5000);
            }, 5000);
            return true;
        }
    }
}

let ola = new CallTaxi({ name: "ola", cost: 7 });
let uber = new CallTaxi({ name: "uber", cost: 8 });
let zoomcar = new CallTaxi({ name: "zoomcar", cost: 10 });
let fastrack = new CallTaxi({ name: "fastrack", cost: 9 });
let maxicabs = new CallTaxi({ name: "maxicabs", cost: 5 });
let chennaicabs = new CallTaxi({ name: "chennaicabs", cost: 6 });

let taxiInstances = [ola, uber, zoomcar, fastrack, maxicabs, chennaicabs];
DOMRoutePoints.init();

setInterval(() => {
    CallTaxiPool.getSummary();
}, 5000);

/*let consoleList = [];
$("#mapTable tbody").on("click","td", function(){
    consoleList.push($(this).attr("id").split("_cell")[1]);
    $(this).css("background","black");
    console.log(consoleList.join(","))
})*/