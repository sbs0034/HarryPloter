/**
 * Created by steffen on 5/13/16.
 */
// var sqlite3 = require('sqlite3');
var fs = require("fs");
var graphCounter = 0;
var x_title;
var y_title;
var dataIC = [];
var dataTC = [];
var datamarkers = ["circle","square","triangle-up"]
var c_ = 0
var _c = 0
var fs = require('fs');
var SQL = require('sql.js');
var table
var device
var db
var idPos
var devicePos

// Get more inforamtion from selected device and graphs the current vs voltage and current vs resistance
function MoreInfo(num){
  var textBoxFiller = []
  var plotThis = ""
  textBoxFiller.push("<button id='copyCurrent'>Copy Current Data</button>")
  // Checks if the data contains two wire voltage data
  if(data[0].columns.indexOf("Voltage") == -1){
    textBoxFiller.push("<button id='copy4WireVoltage'>Copy 4 Wire Voltage Data</button>")
    textBoxFiller.push("<button id='copy2WireVoltage'>Copy 2 Wire Voltage Data</button>")
    plotThis = "FourWireVoltage"
  }
  else{
    plotThis = "Voltage"
    textBoxFiller.push("<button id='copyVoltage'>Copy Voltage Data</button>")
  }
  textBoxFiller.push("<button id='copyResistance'>Copy Resistance Data</button>")
  $('#textBoxHolder').html(textBoxFiller)
  if(plotThis == "FourWireVoltage"){
    document.getElementById("copy4WireVoltage").addEventListener('click',function(){
      clipboard.copy(data[0].values[devicePos[num]][data[0].columns.indexOf("FourWireVoltage")]).then(
        function(){console.log("success");},
        function(err){console.log("failure", err);}
      );
    })
    document.getElementById("copy2WireVoltage").addEventListener('click',function(){
      clipboard.copy(data[0].values[devicePos[num]][data[0].columns.indexOf("TwoWireVoltage")]).then(
        function(){console.log("success");},
        function(err){console.log("failure", err);}
      );
    })
  }
  else{
    document.getElementById("copyVoltage").addEventListener('click',function(){
      clipboard.copy(data[0].values[devicePos[num]][data[0].columns.indexOf("Voltage")]).then(
        function(){console.log("success");},
        function(err){console.log("failure", err);}
      );
    })
  }
  document.getElementById("copyResistance").addEventListener('click',function(){
    clipboard.copy(data[0].values[devicePos[num]][data[0].columns.indexOf("Resistance")]).then(
      function(){console.log("success");},
      function(err){console.log("failure", err);}
    );
  })
  document.getElementById("copyCurrent").addEventListener('click',function(){
    clipboard.copy(data[0].values[devicePos[num]][data[0].columns.indexOf("Current")]).then(
      function(){console.log("success");},
      function(err){console.log("failure", err);}
    );
  })
  // Grpahing Current Vs Voltage
  var dataXY = []
  var dataYZ = []
  if(data[0].values[devicePos[num]][data[0].columns.indexOf("Current")].toString().indexOf("\n") > -1){
  var y_data = data[0].values[devicePos[num]][data[0].columns.indexOf("Current")].split("\n")
}
else{
  var y_data = [data[0].values[devicePos[num]][data[0].columns.indexOf("Current")]]
}
if(data[0].values[devicePos[num]][data[0].columns.indexOf(plotThis)].toString().indexOf("\n")>-1){
  var x_data = data[0].values[devicePos[num]][data[0].columns.indexOf(plotThis)].split("\n")
}
else{
  var x_data = [data[0].values[devicePos[num]][data[0].columns.indexOf(plotThis)]]
}
if(data[0].values[devicePos[num]][data[0].columns.indexOf("Resistance")].toString().indexOf("\n")>-1){
  var z_data = data[0].values[devicePos[num]][data[0].columns.indexOf("Resistance")].split("\n")
}
else{
  var z_data = [data[0].values[devicePos[num]][data[0].columns.indexOf("Resistance")]]
}
  dataYZ.push({
      y: z_data,
      x: y_data,
      name: document.getElementById("deviceChooser").value,
      mode: 'lines+markers',
      type: 'scatter',
  });
  dataXY.push({
      x: x_data,
      y: y_data,
      name: document.getElementById("deviceChooser").value,
      mode: 'lines+markers',
      type: 'scatter',
  });
  var layout = {
    width: 700,
    height: 600,
      xaxis: {
          title: "Voltage (V)",
          showgrid: true,
          showline: true,
          mirror: 'ticks',
          gridcolor: '#bdbdbd',
          linecolor: '#636363',
          linewidth: 2,
          autotick: true,
          ticks: 'inside',
          tick0: 0,
          ticklen: 8,
          tickwidth: 4,
          tickcolor: '#000'
      },
      yaxis: {
          title: "Current (A)",
          showgrid: true,
          showline: true,
          mirror: 'ticks',
          gridcolor: '#bdbdbd',
          linecolor: '#636363',
          linewidth: 2,
          autotick: true,
          ticks: 'inside',
          tick0: 0,
          ticklen: 8,
          tickwidth: 4,
          tickcolor: '#000'
      },
      font: {
    family:"Droid Serif, serif",
    size: 18,
      },
      showlegend:true,
      title:"Current Vs Voltage"
  }
  var layout2 = {
    width: 700,
    height: 600,
      xaxis: {
          title: "Current (A)",
          showgrid: true,
          showline: true,
          mirror: 'ticks',
          gridcolor: '#bdbdbd',
          linecolor: '#636363',
          linewidth: 2,
          autotick: true,
          ticks: 'inside',
          tick0: 0,
          ticklen: 8,
          tickwidth: 4,
          tickcolor: '#000'
      },
      yaxis: {
          title: "Resistance (Ohms)",
          showgrid: true,
          showline: true,
          mirror: 'ticks',
          gridcolor: '#bdbdbd',
          linecolor: '#636363',
          linewidth: 2,
          autotick: true,
          ticks: 'inside',
          tick0: 0,
          ticklen: 8,
          tickwidth: 4,
          tickcolor: '#000'
      },
      font: {
    family:"Droid Serif, serif",
    size: 18,
      },
      showlegend:true,
      title:"Current Vs Resistance"
  }
  Plotly.newPlot('plot', dataXY, layout);
  Plotly.newPlot('plot2', dataYZ, layout2);
}

$( document ).ready(function() {
  $("#displayResults").click(function(){
  devicePos = []
  device=$("#deviceChooser").val()
  data = db.exec("SELECT * FROM "+"'"+table+"'")
  for(i=0; i<data[0].values.length; i++){
      if(data[0].values[i].indexOf(device) != -1){
        devicePos.push(i)
      }
  }
  var tableData = []
  var tableHeaders = []
  var whiteList = []
  tableHeaders.push("<tr><th> </th>")
  for(i=0; i<data[0].columns.length; i++){
    if(data[0].columns[i] == "Voltage" || data[0].columns[i] == "Current" || data[0].columns[i] == "Resistance" || data[0].columns[i] == "FourWireVoltage" || data[0].columns[i] == "TwoWireVoltage"){
      whiteList.push(i)
    }
    else{
    tableHeaders.push("<th>"+data[0].columns[i]+"</th>")
  }
}
  tableHeaders.push("</tr>")
  for(i=0; i<devicePos.length; i++){
    tableData.push("<tr><td><button id="+i+" onclick='MoreInfo("+i+")'>More Information</button></td>")
    for(i_=0; i_<data[0].values[devicePos[i]].length; i_++){
            if(whiteList.indexOf(i_) > -1){}
            else{
            tableData.push("<td>"+data[0].values[devicePos[i]][i_]+"</td>")
          }
    }
    tableData.push("</tr>")
  }
  $('#dataTable').html(tableHeaders+tableData)
})
$("#deviceChooser").change(function () {});
$("#tableChooser").change(function () {
  table = $(this).val()
  GetTableData(table)
});
function GetTableData(table){
  var data = db.exec("SELECT * FROM "+"'"+table+"'")
  //Get posistion of DeviceIdentifier from array
  idPos = data[0].columns.indexOf("DeviceIdentifier")
  if(idPos==-1){
    idPos=data[0].columns.indexOf("Device")
  }
  deviceChooserFill = []
  for(i=0; i<data[0].values.length; i++){
    deviceChooserFill.push(data[0].values[i][idPos])
  }
  uniqueArray = deviceChooserFill.filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
})
for(i=0; i<uniqueArray.length; i++){uniqueArray[i]="<option>"+uniqueArray[i]+"</option>"}
  $("#deviceChooser").html("<option></option>"+uniqueArray)
}
function GetTables(db){
  var res = db.exec("SELECT * FROM sqlite_master WHERE type='table'");
  tableChooserFill = []
  for(i=0; i<res[0].values.length; i++){
    tableChooserFill.push("<option>"+res[0].values[i][1]+"</option>")
  }
  $("#tableChooser").html("<option></option>"+tableChooserFill)
}
    graphCounter++;
    function PlotCSVFile() {
        var stream = fs.createReadStream($('#csvFile').val());
        var counter = 0
        csv
            .fromStream(stream)
            .on("data", function (data) {
                console.log(data);
                if(counter == 0){
                    x_title = data[0]
                    y_title = data[1]
                    counter = 1
                }
                else {
                    x_data.push(data[0])
                    y_data.push(data[1])
                }
            })
            .on("end", function () {
                alert("Plotting CSV File(s)")
                var trace1 = {
                    x: x_data,
                    y: y_data,
                    name: "Current Vs Voltage",
                    mode: 'markers',
                    type: 'scatter'
                };
                var layout = {
                    xaxis: {
                        title: x_title
                    },
                    yaxis: {
                        title: y_title
                    },
                    showlegend:true
                }

                var data = [trace1];
                Plotly.newPlot('jjPlot', data, layout);
                console.log("done");
            });
    }
    function PlotFile(){
          var filebuffer = fs.readFileSync($(this).val());
          db = new SQL.Database(filebuffer);
          GetTables(db)
    }
    document.getElementById('fileToPlot').addEventListener('change', PlotFile, false);

});
