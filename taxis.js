function CallTaxi(taxi) {
    var taxiObj = CallTaxiPool.add(taxi);
    if (taxiObj) {
        var startPoint = taxiObj.currentLoc;
        var destination = taxiObj.destination;
        var customer = taxiObj.customer;
        var id = taxiObj.id;
        var status = taxiObj.status;
        var taxiRunTime;
        var distLeft = 0;
        var totalFare = 0;
        var baseFare = 7; // Rs per Km
        var speed = 2 // kms in 10 seconds
        this.pickme = function(cust, pickup, dest, strictTaxi) {
            if (pickup == dest) {
                return false;
            }
            var nearestTaxi = CallTaxiPool.nearest(pickup, dest, id, strictTaxi);
            if (nearestTaxi) {
                if (nearestTaxi.id == id) {
                    status = "picking up...";
                    customer = cust;
                    startPoint = pickup;
                    destination = dest;
                    distLeft = nearestTaxi.distance;
                    totalFare += nearestTaxi.distance * baseFare;
                    CallTaxiPool.update(id, status, customer, startPoint, destination, distLeft, totalFare);
                   
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

var CallTaxiPool = {
    alltaxis: [],
    taxiNameList: [],
    add: function(taxi) {
        for (var i in this.alltaxis) {
            if (this.alltaxis[i].id.toLowerCase() == taxi.toLowerCase()) {
                console.log("Taxi Duplicate")
                return false;
            }
        }
        var _obj = { id: taxi, currentLoc: "a", status: "ready", destination: "a", customer: "", distance: 0, total: 0 };
        this.alltaxis.push(_obj);
        
        this.taxiNameList.push(taxi);
        $("#cab_name").append("<option value='" + taxi + "'>" + taxi + "</option>");
        return _obj;
    },
    nearest: function(pick, end, txid, strictlyTaxi) {
        var routesequence = "abcdefghij";
        var _apoint = routesequence.indexOf(pick);

        //var readyNearTaxis = [];
        var myTaxiClone = JSON.parse(JSON.stringify(CallTaxiPool.alltaxis));

        for (var j in myTaxiClone) {
            if (myTaxiClone[j].status == "ready") {
                var _end = routesequence.indexOf(end);
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



        return false;
    },
    update: function(id, state, customer, pickup, end, dist, tot) {
        var alltaxiLen = CallTaxiPool.alltaxis;
        for (var z in CallTaxiPool.alltaxis) {
            if (alltaxiLen[z].id == id) {
                alltaxiLen[z].status = state;
                alltaxiLen[z].customer = customer;
                alltaxiLen[z].currentLoc = pickup;
                alltaxiLen[z].destination = end;
                alltaxiLen[z].distance = dist;
                alltaxiLen[z].total = tot;
            }
        }
    }
    
};

var ola = new CallTaxi("ola");
var uber = new CallTaxi("uber");
var zoomcar = new CallTaxi("zoomcar");
var fastrack = new CallTaxi("fastrack");
var maxicabs = new CallTaxi("maxicabs");
var chennaicalltaxi = new CallTaxi("chennaicalltaxi");

var taxiInstances = [ola, uber, zoomcar, fastrack, chennaicalltaxi, maxicabs];


$("#submitPickup").click(function() {
    var pick = $("#pickupSel").val();
    var drop = $("#dropSel").val();
    if (pick != drop) {
        $("#submitPickup").prop("disabled", true);
        
    }

});

