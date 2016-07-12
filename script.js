/**
 * Created by steffen on 5/13/16.
 */
// var sqlite3 = require('sqlite3');
var fs = require("fs");
var x_title;
var y_title;
var datamarkers = ["circle","square","triangle-up"]
var fs = require('fs');
var SQL = require('sql.js');
var device
var db
var idPos
var devicePos

// Builds Initial GUI
function InitGUI(){
  // Database file chooser
  $('body').append(' <div class="form-group" style="width: 20%;"><label class="control-label" for="databaseFile">File</label> <input type="file" id="databaseFile" multiple=""><input type="text" readonly="" class="form-control" placeholder="Choose Database File"></div>')
  document.getElementById('databaseFile').addEventListener('change', GetDatabaseTables, false);
  $.material.init()
}

// Finds all the tables in the database and creates a selector for them
function GetDatabaseTables(){
  var filebuffer = fs.readFileSync($(this).val());
  db = new SQL.Database(filebuffer);
  // Finds all the tables listed in the master table
  var res = db.exec("SELECT * FROM sqlite_master WHERE type='table'");
  // Addes a selector for the tables if it does not already exist
  if($('#tableSelect').length == 0){
    $('body').append('<div class="dropdown" style="display: inline; float: left"><button class="dropdown-toggle btn btn-default" href="#" id="tableSelect" data-toggle="dropdown"data-target="#">Choose DIMM Card <span class="caret"></span></button><ul id="tableSelectOptions" class="dropdown-menu"></ul></div>')
  }
  // Clears the previews slections if there were any
  $('#tableSelectOptions').html("")
  $('#tableSelect').html('Choose DIMM Card <span class="caret"></span>')

  // Loops over master table and adds each chip table to tableSelect
  for(i=0; i<res[0].values.length; i++){
    $("#tableSelectOptions").append("<li><a onclick='GetTableData(\""+res[0].values[i][1]+"\")'>"+res[0].values[i][1]+"</a></li>")
  }
  $.material.init()
}

// Gets the devices from the selected chip and adds a selector for them
function GetTableData(table){
  $('#tableSelect').html(table+' <span class="caret"></span>')
  // Array containg all devices on the selected chip
  var devices = db.exec("SELECT * FROM "+"'"+table+"'")
  //Get posistion of each device from array
  idPos = devices[0].columns.indexOf("DeviceIdentifier")
  if(idPos==-1){
    idPos=devices[0].columns.indexOf("Device")
  }
  // Creates a selector for the devices on the selected chip if it does not already exist
  if($('#deviceChooser').length == 0){
    $('body').append('<div class="dropdown" style="display: inline; float: left""><button class="dropdown-toggle btn btn-default" href="#" id="deviceChooser" data-toggle="dropdown"data-target="#">Choose Device <span class="caret"></span></button><ul id="deviceChooserOptions" class="dropdown-menu"></ul></div>')
  }
  // Clears the previus selections if there are any
  $('#deviceChooserOptions').html(" ")
  $('#deviceChooser').html('Choose Device <span class="caret"></span>')
  // Clears the selector if it already exists
  deviceSelectorFill = []
  // Creates an array for all devices on the selected chip
  for(i=0; i<devices[0].values.length; i++){
    deviceSelectorFill.push(devices[0].values[i][idPos])
  }
  // loops over the deviceChooserFill array and returns only the unique devices so there are no duplicates
  uniqueArray = deviceSelectorFill.filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
  })
  // Adds the unique devices to the devices selector
  for(i=0; i<uniqueArray.length; i++){
    $("#deviceChooserOptions").append('<li><a onclick="CreateDeviceTable(\''+uniqueArray[i]+'\',\''+table+'\')">'+uniqueArray[i]+'</a></li>')
  }
  $.material.init()
}

// Creates a table for all the data of the selected chip
function CreateDeviceTable(device,table){
  $('#deviceChooser').html(device+' <span class="caret"></span>')
  devicePos = []
  // gathers all of the devices in the selected table
  data = db.exec("SELECT * FROM "+"'"+table+"'")
  // Loops through the devices and creates an array of the posistions of the selected device
  for(i=0; i<data[0].values.length; i++){
      if(data[0].values[i].indexOf(device) != -1){
        devicePos.push(i)
      }
  }
  // See if the database just has 4 wire voltage or contains both 2 wire and 4 wire data
  if(data[0].columns.indexOf("Voltage") == -1){
    voltageDataType = "2/4 Wire Voltage"
  }
  else{
    voltageDataType = "Voltage"
  }
  var tableData = ""
  var tableHeaders = []
  var whiteList = []
  // Creates a table for the selected chips data to be displayed
  $('body').append('<table id="dataTable" class="table table-hover table-striped"></table>')
  tableHeaders.push("<tr><th>Options</th>")
  // Loops through all the data points for the selected device and adds table headers for each data catagory
  for(i=0; i<data[0].columns.length; i++){
    // Creates a whitelist of data that we don't want to display, the data is normally too big to display and would crash the program
    if(data[0].columns[i] == "Voltage" || data[0].columns[i] == "Current" || data[0].columns[i] == "Resistance" || data[0].columns[i] == "FourWireVoltage" || data[0].columns[i] == "TwoWireVoltage"){
      whiteList.push(i)
    }
    // Creates a headers array for the different device data points
    else{
    tableHeaders.push("<th>"+data[0].columns[i]+"</th>")
    }
  }
  tableHeaders.push("</tr>")
  // Creates table entries for the device's data
  for(i=0; i<devicePos.length; i++){
    // Creates an options menu for interacting with a particualr set of data points
    if(voltageDataType == "Voltage"){
      tableData=tableData+('<tr><td><div class="dropdown"><a  class="dropdown-toggle" href="#" data-toggle="dropdown"data-target="#">Options <span class="caret"></span></a><ul class="dropdown-menu"><li><a onclick="GraphCurrentVsVoltage('+i+')">Graph Current Vs Voltage</a></li>')
      tableData=tableData+('<li><a onclick="GraphCurrentVsResistance('+i+')">Graph Current Vs Resistance</a></li>')
      tableData=tableData+('<li><a onclick="CopyData(\'Current\','+i+')">Copy Current Data</a></li>')
      tableData=tableData+('<li><a onclick="CopyData(\'Voltage\','+i+')">Copy Voltage Data</a></li>')
      tableData=tableData+('<li><a onclick="CopyData(\'Resistance\','+i+')">Copy Resistance Data</a></li>')
      tableData=tableData+('</ul></div></td>')
    }
    else{
      tableData=tableData+('<tr><td><div class="dropdown"><a class="dropdown-toggle" href="#" data-toggle="dropdown"data-target="#">Options <span class="caret"></span></a><ul class="dropdown-menu"><li><a onclick="GraphCurrentVsVoltage('+i+')">Graph Current Vs Voltage</a></li>')
      tableData=tableData+('<li><a onclick="GraphCurrentVsResistance('+i+')">Graph Current Vs Resistance</button></li>')
      tableData=tableData+('<li><a onclick="CopyData(\'Current\','+i+')">Copy Current Data</a></li>')
      tableData=tableData+('<li><a onclick="CopyData(\'FourWireVoltage\','+i+')">Copy 4 Wire Voltage Data</a></li>')
      tableData=tableData+('<li><a onclick="CopyData(\'TwoWireVoltage\','+i+')">Copy 2 Wire Voltage Data</a></li>')
      tableData=tableData+('<li><a onclick="CopyData(\'Resistance\','+i+')">Copy Resistance Data</a></li>')
      tableData=tableData+('</ul></div></td>')
    }
    // Adds the data under the correct header
    for(i_=0; i_<data[0].values[devicePos[i]].length; i_++){
            if(whiteList.indexOf(i_) > -1){}
            else{
            tableData=tableData+("<td>"+data[0].values[devicePos[i]][i_]+"</td>")
          }
    }
    tableData=tableData+("</tr>")
  }
  $('#dataTable').html(tableHeaders+tableData)
  $.material.init()
}

// Graphs the current vs voltage of the selected device's measurement using its posistion in the table
function GraphCurrentVsVoltage(tablePosistion){
  // Gathers the current and voltage data from the table
  if(data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Current")].toString().indexOf("\n") > -1){
  var y_data = data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Current")].split("\n")
  }
  else{
    var y_data = [data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Current")]]
  }
  if(data[0].columns.indexOf("Voltage") >= 0){
    if(data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Voltage")].toString().indexOf("\n")>-1){
      var x_data = data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Voltage")].split("\n")
    }
    else{
      var x_data = [data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Voltage")]]
    }
  }
  else{
    if(data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("FourWireVoltage")].toString().indexOf("\n")>-1){
      var x_data = data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("FourWireVoltage")].split("\n")
    }
    else{
      var x_data = [data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("FourWireVoltage")]]
    }
  }
  GraphData("Voltage (V)","Current (A)", x_data, y_data, "Current Vs Voltage")
}

// Graphs the current vs resistance of the selected device's measurement using its posistion in the table
function GraphCurrentVsResistance(tablePosistion){
  // Gathers the current and resistance data from the table
  if(data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Current")].toString().indexOf("\n") > -1){
  var y_data = data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Resistance")].split("\n")
  }
  else{
    var y_data = [data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Resistance")]]
  }
  if(data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Current")].toString().indexOf("\n")>-1){
    var x_data = data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Current")].split("\n")
  }
  else{
    var x_data = [data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf("Current")]]
  }
  GraphData("Current (A)","Resistance (Ohms)", x_data, y_data, "Current Vs Resistance")
}

// Graphs the given data
function GraphData(x_title, y_title, x_data, y_data, graphTitle){
  if($('#dataGraph').length == 0){
    $('body').append('<div id="dataGraph"></div>')
  }
  dataToGraph = []
  dataToGraph.push({
      x: x_data,
      y: y_data,
      name: $('#deviceChooser').html().split(" ")[0],
      mode: 'lines+markers',
      type: 'scatter',
  });
  // Layout settings for the graph
  var layout = {
    width: 700,
    height: 600,
      xaxis: {
          title: x_title,
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
          title: y_title,
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
      title:graphTitle
  }
    Plotly.newPlot('dataGraph', dataToGraph, layout);
    // Automaticaly takes the user to the graph
    $('html, body').animate({
    scrollTop: $("#dataGraph").offset().top
}, 1000);
}

// Copies data to clipboard
function CopyData(dataType, tablePosistion){
  clipboard.copy(data[0].values[devicePos[tablePosistion]][data[0].columns.indexOf(dataType)]).then(
    function(){console.log("success");
    $.snackbar({content: "Copied Data!"});
  },
    function(err){console.log("failure", err);
    $.snackbar({content: "Error Copying Data :()"});
  }
);
}

// Waits until the DOM is loaded
$( document ).ready(function() {
  InitGUI();
});
