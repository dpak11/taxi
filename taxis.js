

const CallTaxiPool = {
    alltaxis: [],
    taxiNameList: [],
    add: function(taxi) {
        for (let i in this.alltaxis) {
            if (this.alltaxis[i].id.toLowerCase() == taxi.toLowerCase()) {
                console.log("Taxi Duplicate")
                return false;
            }
        }
        let _obj = { id: taxi, currentLoc: "a", status: "ready", destination: "a", customer: "", distance: 0, total: 0 };
        this.alltaxis.push(_obj);
        this.displayStatus(taxi, "ready", "", "a", "a", 0);
        this.taxiNameList.push(taxi);
        $("#cab_name").append(`<option value='${taxi}'>${taxi}</option>`);
        return _obj;
    },    
    nearest: function(pick, end, txid, strictlyTaxi) {
        let routesequence = "abcdefghij";
        let _apoint = routesequence.indexOf(pick);

        //var readyNearTaxis = [];
        let myTaxiClone = JSON.parse(JSON.stringify(CallTaxiPool.alltaxis));

        for (let j in myTaxiClone) {
            if (myTaxiClone[j].status == "ready") {
                let _end = routesequence.indexOf(end);
                if (txid == myTaxiClone[j].id && strictlyTaxi == txid) {
                    myTaxiClone[j].distance = 50 * Math.abs(_apoint - _end);
                    return myTaxiClone[j];
                } else if (strictlyTaxi == "" && myTaxiClone[j].currentLoc == pick && txid == myTaxiClone[j].id) {
                    myTaxiClone[j].distance = 50 * Math.abs(_apoint - _end);
                    return myTaxiClone[j];
                }
            }
        }

        if (strictlyTaxi != "") {
            return false;
        }


        myTaxiClone = myTaxiClone.filter(function(elem, indx) {
            return elem.status == "ready";
        });


        for (let alls in myTaxiClone) {
            let _end = routesequence.indexOf(end);
            let _curr = routesequence.indexOf(myTaxiClone[alls].currentLoc);
            myTaxiClone[alls].distance = 50 * Math.abs(_apoint - _end);
            myTaxiClone[alls].pickDist = Math.abs(_apoint - _curr);
        }

        myTaxiClone.sort(function(a, b) {
            return a.pickDist - b.pickDist;
        });

        if (myTaxiClone.length == 1) {
            return myTaxiClone[0];
        }

        myTaxiClone = myTaxiClone.filter(function(elem, indx) {
            return elem.pickDist === myTaxiClone[0].pickDist;
        });

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
                setTimeout(function() {
                    $("#searchlog").text("Searching...");
                    let mycab = $("#cab_name").val();
                    let strictSearch = mycab == "none" ? "" : mycab;
                    if (strictSearch != "" && CallTaxiPool.taxiNameList.indexOf(mycab) == -1) {
                        $("#searchlog").text("Not Found");
                        $("#submitPickup").prop("disabled", false);
                    } else if (!taxiInstances[CallTaxiPool.lookup.cabsnum].pickme(n, p, d, strictSearch)) {
                        CallTaxiPool.lookup.search(n, p, d);
                        CallTaxiPool.lookup.cabsnum--;
                    } else {
                        $("#searchlog").text("");
                        $("#submitPickup").prop("disabled", false);
                    }
                }, 1000);
            } else {
                $("#searchlog").text("Not available");
                $("#submitPickup").prop("disabled", false);
            }
        }
    },
    getSummary: function() {
        let txi = this.alltaxis;
        let summary = "";
        for (let i = 0; i < txi.length; i++) {
            summary += `<span>${txi[i].id}</span><span> Remaining: ${txi[i].distance} Kms </span><span> Total(All trips): Rs.${txi[i].total}</span><br/>`;
            
        }
        $("#infoTaxis").html(summary);
    },
    displayStatus: function() {
        let alph = "abcdefghij";
        for (let i = 0; i < 10; i++) {
            document.getElementById("col-point-" + alph.substr(i, 1)).innerHTML = "";
            document.getElementById("col-halt-" + alph.substr(i, 1)).innerHTML = "";
        }

        for (let disp in this.alltaxis) {
            let cell1 = document.getElementById("col-point-" + this.alltaxis[disp].currentLoc);
            let cell2 = document.getElementById("col-halt-" + this.alltaxis[disp].destination);
            let activetxt1 = "";
            let activetxt2 = "";
            if (this.alltaxis[disp].status == "ready") {
                activetxt1 = "<span class='' style = 'color:#000;font-weight:bold'>";
            } else if (this.alltaxis[disp].status == "running") {
                activetxt1 = "<span class='blinker' style = 'color:grey;font-weight:normal'>";
            } else {
                activetxt1 = "<span class='' style = 'color:grey;font-weight:normal'>";
            }
            cell1.innerHTML = `${cell1.innerHTML} ${activetxt1} ${this.alltaxis[disp].id} (${this.alltaxis[disp].status})</span><br/><br/>`;

            if (this.alltaxis[disp].status == "running") {
                activetxt2 = `<span class='blinker ${this.alltaxis[disp].id}'>`;
            } else {
                activetxt2 = "<span class='hidetaxi'>";
            }
            cell2.innerHTML = `${cell2.innerHTML} ${activetxt2} ${this.alltaxis[disp].id} </span><br/><br/>`;

        }
    }
};

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
        let baseFare = 7; // Rs per Km
        let speed = 2 // kms in 10 seconds
        this.pickme = function(cust, pickup, dest, strictTaxi) {
            if (pickup == dest) {
                return false;
            }
            let nearestTaxi = CallTaxiPool.nearest(pickup, dest, id, strictTaxi);
            if (nearestTaxi) {
                if (nearestTaxi.id == id) {
                    status = "picking up...";
                    customer = cust;
                    startPoint = pickup;
                    destination = dest;
                    distLeft = nearestTaxi.distance;
                    totalFare += nearestTaxi.distance * baseFare;
                    CallTaxiPool.update(id, status, customer, startPoint, destination, distLeft, totalFare);
                    CallTaxiPool.displayStatus();

                    setTimeout(function() {
                        status = "running";
                        CallTaxiPool.update(id, "running", customer, startPoint, destination, distLeft, totalFare);
                        CallTaxiPool.displayStatus();
                        taxiRunTime = setInterval(function() {
                            distLeft -= speed;
                            if (distLeft <= 0) {
                                clearInterval(taxiRunTime);
                                status = "ready";
                                CallTaxiPool.update(id, "ready", customer, destination, destination, 0, totalFare);
                                CallTaxiPool.displayStatus();
                            } else {
                                CallTaxiPool.update(id, "running", customer, startPoint, destination, distLeft, totalFare);
                            }
                        }, 10000);
                    }, 10000);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
}

let ola = new CallTaxi("ola");
let uber = new CallTaxi("uber");
let zoomcar = new CallTaxi("zoomcar");
let fastrack = new CallTaxi("fastrack");
let maxicabs = new CallTaxi("maxicabs");
let chennaicalltaxi = new CallTaxi("chennaicalltaxi");

let taxiInstances = [ola, uber, zoomcar, fastrack, chennaicalltaxi, maxicabs];


$("#submitPickup").click(function() {
    let pick = $("#pickupSel").val();
    let drop = $("#dropSel").val();
    if (pick != drop) {
        $("#submitPickup").prop("disabled", true);
        CallTaxiPool.lookup.cabsnum = CallTaxiPool.alltaxis.length - 1;
        CallTaxiPool.lookup.search("xxx", pick, drop);
    }

});

setInterval(function() {
    CallTaxiPool.getSummary();
}, 5000);