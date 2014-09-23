/*******************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2014 Fraunhofer FOKUS
 *******************************************************************************/

var _ = require("underscore");
var http = require("http");
var argv = require('minimist')(process.argv.slice(2));

var Model = require('../../models.js').model;

var APIURL = "http://opendata.brussels.be/api/records/1.0/search?";
var DATASETS = [
                 { ds: "cultural-places", nameField: "cultural_place" },
                 // TODO(mla): check why the API does not accept multiple
                 //            dataset records search.
                 //{ ds: "bxl_urinals", nameField: "urinoir" }
               ];
var execcmd = true;

if(execcmd && (argv.id || argv.i)) {
    var dataSets = "";
    var dataSetsMap = {};
    _.each(DATASETS,function(d){dataSets+="&dataset="+(d.ds); dataSetsMap[d.ds]=d; });
    http.get(APIURL+"rows=10000"+dataSets, function(res) {
    var result = '', length=0;

    res.on('data', function(chunk) {
      length += chunk.length;
      process.stdout.write("Downloading " + length + " bytes\r");
        result += chunk;
    });

    res.on('end', function() {
        var datares = JSON.parse(result);
        console.log("\nend.",datares);

        _.each(datares.records,function(r){
          var poi = {};
          poi.coords = r.geometry.coordinates;
          poi.source = APIURL+";"+r.datasetid+";"+r.recordid;
          poi.name = r.fields[dataSetsMap[r.datasetid]["nameField"]];
          poi.city = {"refurl": "cities/"+(argv.id || argv.i), "_city":(argv.id || argv.i)};
          new Model.Poi(poi).save(function(err) {
          if(err) console.log('error saving #' + poi.name);
          else process.stdout.write("saved #" + poi.name + " \r");
          })
        });

        setTimeout(function(){
          process.exit(0);
        },10000);
    });
  }).on('error', function(e) {
    console.log("Open data API error: ",e);
    process.exit(1);
  });
  execcmd = false;
}

if(execcmd && (argv.city || argv.c)) {
  Model.City.find({displayName:new RegExp((argv.city || argv.c), 'i')}).exec(function(e,r){
    if(e || !r.length){
      console.log("No city with this name is available in the db yet.");
      process.exit(1);
    } else {
      _.each(r, function(c){console.log(c.displayName+", ID: ", c._id)});
    }
    process.exit(0);
  });
  execcmd = false;
}

if (execcmd) {
  var script = __filename.split('/');
  script = (script.length)?script[script.length-1]:script;
  console.log("\nImport script using opendata API:");
  console.log("  "+APIURL);
  console.log("\nUsage:\n",script, "(parameters)");
  console.log("Parameters:")
  console.log("  -c \"CityName\" || --city=\"CityName\" ");
  console.log("  -i \"CityID\" || --id=\"CityID\" ");
  process.exit(1);
}









