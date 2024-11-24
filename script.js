let activeNuclear = 50; //default 5
let decomNuclear = 0;
let activeCoal = 25;
let decomCoal = 0;
let activeCoalNuclear = 0;
let activeGas = 10;
let decomGas = 0;
let activeWind = 0; //default to 150
let decomWind = 0;
let activeSolar = 0; //default 915
let decomSolar = 0;
let totalCost = 0;
let nuclearCost = [5, 1, 0]; // cost of new, cost of recomissioning, cost of coal to nuclear
let coalCost = [0, 0]; //cost of new, cost of recomissioning 
let gasCost = [0, 0];
let windCost = [0, 0];
let solarCost = [0, 0];
let batteryCost = [0, 0];
let windCapacity = .2; //in million kilowatts
let solarCapacity = .0025;
let coalCapacity = .3;
let gasCapacity = .2;
let summerPowerDraw = [47, 44, 42, 40, 39, 39, 40, 41, 43, 46, 49, 53, 57, 60, 62, 63.5, 64.5, 64, 63, 61, 59, 57, 54, 50];
let winterPowerDraw = [38, 36, 35, 34, 35, 36, 37, 40, 42, 43, 42.5, 41.5, 41, 40, 39, 38, 37.5, 38, 39, 41, 42, 42, 41, 40];
let nuclearOutput = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
let coalNuclearOutput = [.3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3];
let windCFWinter = [.62, .56, .50, .44, .38, .33, .33, .33, .33, .33, .33, .33, .33, .33, .33, .33, .33, .33, .33, .38, .44, .50, .56, .62];
let windOutputWinter = windCFWinter.map(x => x * windCapacity);
let windCFSummer = [0.465, 0.42, 0.375, 0.33, 0.285, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.247, 0.285, 0.33, 0.375, 0.42, 0.465];
let windOutputSummer = windCFSummer.map(x => x * windCapacity);
let solarCFSummer = [0, 0, 0, 0, 0, 0, .198, .369, .514, .633, .725, .791, .831, .844, .831, .791, .725, .633, .514, .369, .198, 0, 0, 0];
let solarOutputSummer = solarCFSummer.map(x => x * solarCapacity);
let solarCFWinter = [0, 0, 0, 0, 0, 0, 0, .138, .252, .340, .403, .441, .453, .441, .403, .340, .252, .138, 0, 0, 0, 0, 0, 0];
let solarOutputWinter = solarCFWinter.map(x => x * solarCapacity);
let gasCFOverall = .57;
let coalCFOverall = .40;
let windCFSummerOverall = .30;
let windCFWinterOverall = .40;
let solarCFSummerOverall = .35;
let solarCFWinterOverall = .15;
let summerBaseLoad = [];
let winterBaseLoad = [];
let summerFlexibleLoad = [];
let totalSummerCapacity = 24 * (activeCoalNuclear + activeNuclear + (activeCoal * coalCFOverall) + (activeGas * gasCFOverall) + (activeWind * windCFSummerOverall) + (activeSolar * solarCFSummerOverall));
let totalSummerDemand;
let coalDailyCapacity = (activeCoal * coalCapacity * coalCFOverall * 24);
let gasDailyCapacity = activeGas * gasCFOverall * gasCapacity * 24;
let summerPowerOutputHourly = [];
let winterPowerOutputHourly = [];
let overCapacitySummer = [];
let overCapacityWinter = [];
let coalUseSummer = [];
let gasUseSummer = [];
let coalUseWinter = [];
let gasUseWinter = [];



for(let i = 0; i<24; i++){
    overCapacitySummer.push(0);
    summerBaseLoad.push(0);
    winterBaseLoad.push(0);
    overCapacityWinter.push(0);
}

// todo list:
// add an information column because i am getting lazy
// add a graphic that shows project cost, cost per kwh, and CO2 emissions per Kwh
// make it so you can only add integers into menu
// fix overcapacity distribution



var summerChartCCTX = document.getElementById('summerChartC').getContext('2d');
var winterChartCCTX = document.getElementById('winterChartC').getContext('2d');


function refresh(){
    document.getElementById("nuclearPlantsExisting").children[0].innerHTML = "Active: " + activeNuclear;
    document.getElementById("nuclearPlantsExisting").children[2].innerHTML = "Inactive: " + decomNuclear;

    document.getElementById("coalPlantsExisting").children[0].innerHTML = "Active: " + activeCoal;
    document.getElementById("coalPlantsExisting").children[2].innerHTML = "Inactive: " + decomCoal;
    document.getElementById("coalPlantsExisting").children[4].innerHTML = "Nuclear-Coal Plants: " + activeCoalNuclear;

    document.getElementById("gasPlantsExisting").children[0].innerHTML = "Active: " + activeGas;
    document.getElementById("gasPlantsExisting").children[2].innerHTML = "Inactive: " + decomGas;

    document.getElementById("windPlantsExisting").children[0].innerHTML = "Active: " + activeWind;
    document.getElementById("windPlantsExisting").children[2].innerHTML = "Inactive: " + decomWind;

    document.getElementById("solarPlantsExisting").children[0].innerHTML = "Active: " + activeSolar;
    document.getElementById("solarPlantsExisting").children[2].innerHTML = "Inactive: " + decomSolar;

    for(let i = 0; i<24; i++){
        summerPowerOutputHourly[i] = 0;
        winterPowerOutputHourly[i] = 0;
        winterBaseLoad[i] = (activeNuclear * nuclearOutput[i]) + (activeCoalNuclear * coalNuclearOutput[i]) + (activeSolar * solarOutputWinter[i]) + (activeWind * windOutputWinter[i])
        summerBaseLoad[i] = (activeNuclear * nuclearOutput[i]) + (activeCoalNuclear * coalNuclearOutput[i]) + (activeSolar * solarOutputSummer[i]) + (activeWind * windOutputSummer[i])

    }
    coalUseSummer = [];
    gasUseSummer = [];
    let tempgasDailyCapacity = activeGas * gasCFOverall * gasCapacity * 24;
    let tempcoalDailyCapacity = (activeCoal * coalCapacity * coalCFOverall * 24);
    console.log("daily coal capacity: " + tempcoalDailyCapacity)
    for(let i=0; i<24; i++){
        
        if(summerBaseLoad[i] >= summerPowerDraw[i]){
            summerPowerOutputHourly[i] = summerBaseLoad[i]
            gasUseSummer.push(0);
            coalUseSummer.push(0);
            console.log("baseload is demand: " + i);
        }
        else if(summerPowerDraw[i] - summerBaseLoad[i] < activeGas * gasCapacity && summerPowerDraw[i] - summerBaseLoad[i] < tempgasDailyCapacity){
            summerPowerOutputHourly[i] = summerPowerDraw[i];
            tempgasDailyCapacity -= summerPowerDraw[i] - summerBaseLoad[i];
            gasUseSummer.push(summerPowerDraw[i] - summerBaseLoad[i]);
            coalUseSummer.push(0);
            

        }
        else if(summerPowerDraw[i] - summerBaseLoad[i] < activeGas * gasCapacity + activeCoal * coalCapacity && summerPowerDraw[i] - summerBaseLoad[i] < tempgasDailyCapacity + tempcoalDailyCapacity){
            summerPowerOutputHourly[i] = summerPowerDraw[i];
            tempgasDailyCapacity -= (activeGas * gasCapacity);
            tempcoalDailyCapacity -= (summerPowerDraw[i] - summerBaseLoad[i]) - (activeGas * gasCapacity);
            gasUseSummer.push((activeGas * gasCapacity));
            coalUseSummer.push((summerPowerDraw[i] - summerBaseLoad[i]) - (activeGas * gasCapacity));
            console.log("hours: " + i);
            console.log("gas use: " + (activeGas * gasCapacity));
            console.log("Powerdraw: " + summerPowerDraw[i]);
            console.log("baseload output: " + summerBaseLoad[i])

        }
        else{
            summerPowerOutputHourly[i] += summerBaseLoad[i]
            if (tempgasDailyCapacity != 0){
                if ((activeGas * gasCapacity) >= tempgasDailyCapacity){
                summerPowerOutputHourly[i] += tempgasDailyCapacity;
                gasUseSummer.push(tempgasDailyCapacity)
                tempgasDailyCapacity = 0;
                
                
                }
                else{
                    summerPowerOutputHourly[i] += (activeGas * gasCapacity);
                    tempgasDailyCapacity -= (activeGas * gasCapacity);
                    gasUseSummer.push((activeGas * gasCapacity));
                }
            }
            
            if(tempcoalDailyCapacity != 0){
                if ((activeCoal * coalCapacity) >= tempcoalDailyCapacity){
                summerPowerOutputHourly[i] += tempcoalDailyCapacity
                coalUseSummer.push(tempcoalDailyCapacity)
                tempcoalDailyCapacity = 0;
                console.log("finalpush at: " + i);
                }
                else{
                    summerPowerOutputHourly[i] += (activeCoal * coalCapacity);
                    tempcoalDailyCapacity -= (activeCoal * coalCapacity);
                    coalUseSummer.push(activeCoal * coalCapacity);
                    
                }
            }
            
        }
        
    }
    console.log(coalUseSummer);
    console.log(summerPowerOutputHourly);
    
    for(let i=0; i<24; i++){
        let maxAddGasSummer = 0;
        for(let x=0; x<24;x++){
            maxAddGasSummer += ((activeGas * gasCapacity) - summerPowerDraw[x])
        }
        if (gasUseSummer[i] < (activeGas * gasCapacity) && tempgasDailyCapacity != 0){
            overCapacitySummer[i] = (((activeGas * gasCapacity) - summerPowerDraw[i]) / maxAddGasSummer) * tempgasDailyCapacity;
            console.log(overCapacitySummer[i])
        }
        let maxAddCoalSummer = 0;
        for(let x=0; x<24;x++){
            maxAddCoalSummer += ((activeCoal * coalCapacity) - summerPowerDraw[x])
        }
        if (coalUseSummer[i] < (activeCoal * coalCapacity) && tempcoalDailyCapacity != 0){
            overCapacitySummer[i] = (((activeCoal * coalCapacity) - summerPowerDraw[i]) / maxAddCoalSummer) * tempcoalDailyCapacity;
            console.log(overCapacitySummer[i])
        }
    }
    for(let i=0;i<24;i++){
        summerPowerOutputHourly[i] += overCapacitySummer[i];
    }
    tempgasDailyCapacity = gasDailyCapacity;
    tempcoalDailyCapacity = coalDailyCapacity;
    for(let i=0; i<24; i++){
        
        if(winterBaseLoad[i] >= winterPowerDraw[i]){
            winterPowerOutputHourly[i] = winterPowerDraw[i]
            gasUseWinter.push(0);
            coalUseWinter.push(0);
        }
        else if(winterPowerDraw[i] - winterBaseLoad[i] < activeGas * gasCapacity && winterPowerDraw[i] - winterBaseLoad[i] < tempgasDailyCapacity){
            winterPowerOutputHourly[i] = winterPowerDraw[i];
            tempgasDailyCapacity -= winterPowerDraw[i] - winterBaseLoad[i];
            gasUseWinter.push(winterPowerDraw[i] - winterBaseLoad[i]);
            coalUseWinter.push(0);

        }
        else if(winterPowerDraw[i] - winterBaseLoad[i] < activeGas * gasCapacity + activeCoal * coalCapacity && winterPowerDraw[i] - winterBaseLoad[i] < tempgasDailyCapacity + tempcoalDailyCapacity){
            winterPowerOutputHourly[i] = winterPowerDraw[i];
            tempgasDailyCapacity -= (activeGas * gasCapacity);
            tempcoalDailyCapacity -= (winterPowerDraw[i] - winterBaseLoad[i]) - (activeGas * gasCapacity);
            gasUseWinter.push((activeGas * gasCapacity));
            coalUseWinter.push((winterPowerDraw[i] - winterBaseLoad[i]) - (activeGas * gasCapacity));

        }
        else{
            winterPowerOutputHourly[i] += winterBaseLoad[i];
            if (tempgasDailyCapacity != 0){
                if ((activeGas * gasCapacity) >= tempgasDailyCapacity){
                winterPowerOutputHourly[i] += tempgasDailyCapacity;
                gasUseWinter.push(tempgasDailyCapacity)
                tempgasDailyCapacity = 0;
                
                }
                else{
                    winterPowerOutputHourly[i] += (activeGas * gasCapacity);
                    tempgasDailyCapacity -= (activeGas * gasCapacity);
                    gasUseWinter.push((activeGas * gasCapacity));
                }
            }
            if(tempcoalDailyCapacity != 0){
                if ((activeCoal * coalCapacity) >= tempcoalDailyCapacity){
                winterPowerOutputHourly[i] += tempcoalDailyCapacity
                coalUseWinter.push(tempcoalDailyCapacity)
                tempcoalDailyCapacity = 0;
                }
                else{
                    winterPowerOutputHourly[i] += (activeCoal * coalCapacity);
                    tempcoalDailyCapacity -= (activeCoal * coalCapacity);
                    coalUseWinter.push(activeCoal * coalCapacity);
                }
            }
            
        }
        
    }
    for(let i=0; i<24; i++){
        let maxAddGasWinter = 0;
        for(let x=0; x<24;x++){
            maxAddGasWinter += ((activeGas * gasCapacity) - winterPowerDraw[x])
        }
        if (gasUseWinter[i] < (activeGas * gasCapacity) && tempgasDailyCapacity != 0){
            overCapacityWinter[i] = (((activeGas * gasCapacity) - winterPowerDraw[i]) / maxAddGasWinter) * tempgasDailyCapacity;
            console.log(overCapacityWinter[i])
        }
        let maxAddCoalWinter = 0;
        for(let x=0; x<24;x++){
            maxAddCoalWinter += ((activeCoal * coalCapacity) - winterPowerDraw[x])
        }
        if (coalUseWinter[i] < (activeCoal * coalCapacity) && tempcoalDailyCapacity != 0){
            overCapacityWinter[i] = (((activeCoal * coalCapacity) - winterPowerDraw[i]) / maxAddCoalWinter) * tempcoalDailyCapacity;
            console.log(overCapacityWinter[i])
        }
    }
    for(let i=0;i<24;i++){
        winterPowerOutputHourly[i] += overCapacityWinter[i];
    }
    summerChartC.update();
    winterChartC.update();
    

}
function conPrice(currDecom, conNum, recomPrice, buildPrice){
    if(currDecom > conNum){
        return recomPrice * conNum;
    }
    else{
        return (currDecom * recomPrice) + ((conNum - currDecom) *  buildPrice)
    }
}
function conDecomNumber(currDecom, conNum){
    if(currDecom > conNum){
        return currDecom - conNum;
    }
    else{
        return 0;
    }

}

var summerChartC = new Chart(summerChartCCTX, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        datasets: [{
            label: 'Power Consumption',
            data: summerPowerDraw,
            borderColor: 'rgba(54, 110, 260, 1)',
            borderWidth: 2,
            fill: false
        },
        {
            label: 'Power Output',
            data: summerPowerOutputHourly,
            borderColor: 'rgba(16, 96, 23, 1)',
            borderWidth: 2,
            fill: false
        }],
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                scaleLabel: {
                    display: true,
                    labelString: "Million Kilowatt Hours",
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Time Of Day"
                }
            }]
        }
    }
    
})

var winterChartC = new Chart(winterChartCCTX, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        datasets: [{
            label: 'Power Consumption',
            data: winterPowerDraw,
            borderColor: 'rgba(54, 110, 260, 1)',
            borderWidth: 2,
            fill: false
        },
        {
            label: 'Power Output',
            data: winterPowerOutputHourly,
            borderColor: 'rgba(16, 96, 23, 1)',
            borderWidth: 2,
            fill: false
        }],
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                scaleLabel: {
                    display: true,
                    labelString: "Million Kilowatt Hours",
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Time Of Day"
                }
            }]
        }
    }
})

// need to check to make sure number input is an integer, but i can do that later
function getNuclearCNum(){
    let nuclearCNum = Number(document.getElementById("nuclearNumber").value);
    if(Number.isInteger(nuclearCNum)){
        activeNuclear += nuclearCNum;
        totalCost += conPrice(decomNuclear, nuclearCNum, nuclearCost[1], nuclearCost[0])
        decomNuclear = conDecomNumber(decomNuclear, nuclearCNum);
        document.getElementById("nuclearNumber").value = '';
        refresh();
    }
    
}
function getNuclearDNum(){
    let nuclearDNum = Number(document.getElementById("nuclearNumber").value);
    if(nuclearDNum <= activeNuclear && Number.isInteger(nuclearDNum)){
        activeNuclear -= nuclearDNum;
        decomNuclear += nuclearDNum;
        document.getElementById("nuclearNumber").value = '';
        refresh();
    }

}
function getCoalCNum(){
    let coalCNum = Number(document.getElementById("coalNumber").value);
    if (Number.isInteger(coalCNum)){
        activeCoal += coalCNum;
        totalCost += conPrice(decomCoal, coalCNum, coalCost[1], coalCost[0]);
        decomCoal = conDecomNumber(decomCoal, coalCNum);
        document.getElementById("coalNumber").value = '';
        refresh();
    }
    
}
function getCoalDNum(){
    let coalDNum = Number(document.getElementById("coalNumber").value);
    if(coalDNum <= activeCoal && Number.isInteger(coalDNum)){
        activeCoal -= coalDNum
        decomCoal += coalDNum
        document.getElementById("coalNumber").value = '';
        refresh();
    }
    
}
function getCoalNCNum(){
    let coalNCNum = Number(document.getElementById("coalNumber").value);
    if (coalNCNum <= decomCoal && Number.isInteger(coalNCNum)){
        decomCoal -= coalNCNum;
        activeCoalNuclear += coalNCNum;
        document.getElementById("coalNumber").value = '';
        refresh();
    }
}
function getCoalNDNum(){
    let coalNDNum = Number(document.getElementById("coalNumber").value);
    if(coalNDNum <= activeCoalNuclear && Number.isInteger(coalNDNum)){
        activeCoalNuclear -= coalNDNum;
        decomCoal += coalNDNum;
        document.getElementById("coalNumber").value = '';
        refresh();
    }

}
function getGasCNum(){
    let gasCNum = Number(document.getElementById("gasNumber").value);
    if (Number.isInteger(gasCNum)){
        activeGas += gasCNum;
        totalCost += conPrice(decomGas, gasCNum, gasCost[1], gasCost[0]);
        decomGas = conDecomNumber(decomGas, gasCNum);
        document.getElementById("gasNumber").value = '';
        refresh();
    }
    
}
function getGasDNum(){
    let gasDNum = Number(document.getElementById("gasNumber").value);
    if(activeGas >= gasDNum && Number.isInteger(gasDNum)){
        activeGas -= gasDNum
        decomGas += gasDNum;
        document.getElementById("gasNumber").value = '';
        refresh();
    }
    
}
function getWindCNum(){
    let windCNum = Number(document.getElementById("windNumber").value);
    if (Number.isInteger(windCNum)){
        activeWind += windCNum;
        totalCost += conPrice(decomWind, windCNum, windCost[1], windCost[0])
        decomWind = conDecomNumber(decomWind, windCNum);
        document.getElementById("windNumber").value = '';
        refresh();
    }

}
function getWindDNum(){
    let windDNum = Number(document.getElementById("windNumber").value);
    if (activeWind >= windDNum && Number.isInteger(windDNum)){
        activeWind -= windDNum;
        decomWind += windDNum;
        document.getElementById("windNumber").value = '';
        refresh();
    }
    
}
function getSolarCNum(){
    let solarCNum = Number(document.getElementById("solarNumber").value);
    if (Number.isInteger(solarCNum)){
        activeSolar += solarCNum;
        totalCost += conPrice(decomSolar, solarCNum, solarCost[1], solarCost[0])
        decomSolar = conDecomNumber(decomSolar, solarCNum)
        document.getElementById("solarNumber").value = '';
        refresh();
    }
    
}
function getSolarDNum(){
    let solarDNum = Number(document.getElementById("solarNumber").value);
    if(Number.isInteger(solarDNum)){
        if(activeSolar >= solarDNum){
        activeSolar -= solarDNum;
        decomSolar += solarDNum;
        document.getElementById("solarNumber").value = '';
        refresh();
    }
    }
    

    
}



