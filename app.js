var admzip = require('adm-zip');
var express = require('express');
var app = express();
var azure = require('azure');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var jf = require('jsonfile');
var path = require('path');
var url = require('url');
var util = require('util');
var http = require('http');


var storage_account = 'gallerie';
var gallerieKey = 'SiQVY98VhO+NI1m6jfBMgB1M/00geM/puCgpMpRvsBSUz0H/xcgF77Wx9SiD7buJFvXZ9NTvyRNvf200CNT6Kg==';
var package_container = 'packages';
var index_container = 'descriptifs';
var images_container = 'images';

var blobService = azure.createBlobService(storage_account,gallerieKey);
var packages_folder = __dirname + '/databases/packages/';

app.all('*', function(req, res, next){
    res.set("Connection", "close");
    next();
});
// view engine setup
app.set('views', __dirname + '/views/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');;

app.use(express.static(__dirname + '/public'));
app.use("/databases", express.static(__dirname + '/databases'));
app.use("/controllers", express.static(__dirname + '/controllers'));

app.get('/gallery', function (req, res){
    res.render('index');
});

// app.use('/gallery', routes);
// app.use('/users', users);

app.get('/gallery/getPackageJSON', function(req, res){
    res.set("Connection", "close");

    jf.readFile(__dirname + '/databases/packages.json', function (err, obj){
        res.send(obj);  
    });
});

app.get('/gallery/product/download', function(req, res){
    var item = url.parse(req.url).query;
    var filePath = packages_folder + item + '.zip';
    blobService.getBlobToFile(package_container, item + '.zip', filePath, function(error, result, response){
        if(!error){
            var returnHeaders = {};
            returnHeaders['Content-Disposition'] = 'attachment; filename="'+ item +'.zip"';
            returnHeaders['Content-Type'] = 'application/zip';
            returnHeaders['Connection'] = "close";
            res.writeHead(200, returnHeaders); 
            var stream = fs.createReadStream(filePath);
            stream.on('open', function () {     
                stream.pipe(res);
            });
            stream.on('end', function () {
                res.end();
            });         
        }
        else{
            res.render('unfind');
            console.log(error);
        }
    });         
});

app.get('/gallery/product/install', function(req, res){
    var adresse = { 
        "name" : req.query.name,
        "blobUrl" : '/gallery/product/download?' + req.query.name,
        "category" : req.query.category
    };
    res.end(JSON.stringify(adresse));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

function Init(){
    // Get index.json
    blobService.getBlobToFile(index_container, 'packages.json', __dirname + '/databases/packages.json', function(error, result, response){
    });
};

Init();
app.listen(3000, function () {
console.log("express has started on port 3000");
});

module.exports = app;
