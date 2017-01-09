var express = require("express");
var mongodb = require("mongodb");
var fs = require("fs")
var mongoClient = mongodb.MongoClient;

var url = 'mongodb://kevinhoa95:HolaNguyen1995@ds145997.mlab.com:45997/urlshortener'
var app = express();
var db;
var urlshorten;

mongoClient.connect(url, function(err, database){
    if(err){
        console.log("Connection fail!", err);
        
    } else {
        db = database
        urlshorten = db.collection('urlshorten');
        console.log("Success");
        // db.close();
    }
})

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
}

app.get("/new/:urlString", function(req, res){
    var url = req.params.urlString;
    var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    var response ="";
    
    if (regex.test(url)){
        var num = (Math.random()*10000 + 1000).toFixed(0);
        var short_url = "https://little-url.herokuapp.com/" + num.toString();
        var response = {
            "url_id": num.toString(),
            "original_url":url, 
            "short_url":short_url
        };
        urlshorten.insertOne(response, function(err, doc){
            if(err){
                handleError(res, err.message, "Failed to create new urlshorten.");
            } else{
                var response = {
                    "original_url":url, 
                    "short_url":short_url
                };
                res.end(JSON.stringify(response));
            }
        });
    } else{
        response = {
            params: url,
            error: "Not a URL"
        };
         res.end(JSON.stringify(response));
    }
});
app.get("/", function(req, response) {
    fs.readFile("index.html", function(err, data){
       if(err){
          response.writeHead(404);
          response.write("Not Found!");
       }
       else{
          response.writeHead(200, {'Content-Type': "text/html"});
          response.write(data);
       }
       response.end();
    })
})
app.get("/:id", function(req, res){
    var response = "";
    var url_id = req.params.id;
    urlshorten.findOne({url_id: url_id}, function (err, doc) {
        if(err){
            response = {result : "Khong co id"};
            res.end(JSON.stringify(response));
        } else{
            // console.log(doc);
            // res.writeHead(301,{Location: doc["original_url"]});
            res.redirect(doc["original_url"]);
            // res.end();
        }
    })
});

var server = app.listen(process.env.PORT, function(){
    console.log("Server is actived on port: ", server.address().port);
})