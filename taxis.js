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
        $("#cab_name").append(`<option value='${taxi.name}'>${taxi.name}</option>`);
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
            summary += `<span class="nameCaps">${txi[i].id} (Rs.${txi[i].price}/Km)</span><span> Remaining: ${txi[i].distance} Kms </span><span> Total(All trips): Rs.${txi[i].total}</span><br/>`;

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
                activetxt1 = "<span class='' style = 'color:green;font-weight:normal'>";
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

const DOMRoutePoints = {
    getJsonVals: function() {
        return fetch("mpoints.json").then(response => response.json())
            .then(json => json.points[Math.floor(Math.random() * json.points.length)]);
    },
    mapSeqPoints: {},
    init: function() {
        this.getJsonVals().then(jpoints => {
            this.mapSeqPoints = jpoints;
            let mapBasePoints = [];
            for (let px in this.mapSeqPoints) {
                mapBasePoints.push(...this.mapSeqPoints[px].split(","));
            }

            for (let z = 0; z < 6; z++) {
                $("#mapTable tbody").append(`<tr><td colspan="90" class="cabnames" id="subtab${z}">${CallTaxiPool.taxiNameList[z]}</td>`);
                for (let i = 0; i < 10; i++) {
                    let row = `<tr class="map${z}_row${i}">`;
                    for (let j = 0; j < 100; j++) {
                        row = `${row}
                    <td id="map${z}_cell${i}_${j}"></td>`;
                    }
                    row = `${row}</tr>`;
                    $("#mapTable tbody").append(row);
                }

            }

            let taxiLen = CallTaxiPool.taxiNameList.length;
            mapBasePoints.forEach(function(e) {
                for (let m = 0; m < taxiLen; m++) {
                    $(`#map${m}_cell${e}`).addClass("highlight");
                }

            });
        });

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
                CallTaxiPool.alltaxis.forEach(function(t) {
                    if (t.id == name) {
                        if (method == "save") {
                            t.DOM_elm = elm;
                        } else if (t.DOM_elm) {
                            $(t.DOM_elm).removeClass("mark-red");
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
        order.forEach(function(s) {
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
                $(domEl).removeClass("activepoints mark-red");
                if (seq == (seqlist.length - 1)) {
                    $(domEl).addClass("mark-red");
                    refObj.dom(domEl, "save");
                }
                if (seq == (seqlist.length - 2)) {
                    $(domEl).removeClass("red-blinker");
                }
            } else if (status.includes("picking")) {
                if (seq == 0) {
                    $(domEl).addClass("mark-red");
                    $(domEl).addClass("red-blinker");
                }
            } else {
                if ($(domEl).hasClass("activepoints") === false) {
                    $(domEl).addClass("activepoints");
                }

                if (seq <= (progressPointTotalCells - 1)) {
                    $(domEl).addClass("mark-red");
                }
                if (seq < (progressPointTotalCells - 1)) {
                    $(domEl).removeClass("red-blinker");
                }
                if (seq == (progressPointTotalCells - 1)) {
                    $(domEl).addClass("red-blinker");
                }
            }

        }

    }
};

function pageAutoScroll(id) {
    let subtab = "#subtab" + CallTaxiPool.taxiNameList.indexOf(id);
    setTimeout(function() {
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
                    DOMRoutePoints.update(id, status, startPoint, destination, distLeft);
                    pageAutoScroll(id);
                    setTimeout(function() {
                        status = "running";
                        CallTaxiPool.update(id, "running", customer, startPoint, destination, distLeft, totalFare);
                        CallTaxiPool.displayStatus();
                        DOMRoutePoints.update(id, "running", startPoint, destination, distLeft);
                        taxiRunTime = setInterval(function() {
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
                } else {
                    return false;
                }
            } else {
                return false;
            }
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


$("#submitPickup").click(function() {
    let pick = $("#pickupSel").val();
    let drop = $("#dropSel").val();
    if (pick != drop) {
        $("#submitPickup").prop("disabled", true);
        CallTaxiPool.lookup.cabsnum = CallTaxiPool.alltaxis.length - 1;
        CallTaxiPool.lookup.search("xxx", pick, drop);
    }

});
DOMRoutePoints.init();

setInterval(function() {
    CallTaxiPool.getSummary();
}, 5000);

/*let consoleList = [];
$("#mapTable tbody").on("click","td", function(){
    consoleList.push($(this).attr("id").split("_cell")[1]);
    $(this).css("background","black");
    console.log(consoleList.join(","))
})*/