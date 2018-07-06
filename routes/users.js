var express = require('express');
var router = express.Router();
var mongojs = require("mongojs");
var db = mongojs('local');
var usuarios = db.collection("usuarios");
var lugares = db.collection("lugares");
var fs = require("fs");

var sharp = require("sharp");
var sha1 = require("sha1");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/login', function(req, res, next) {

   let params = req.body;
   let json = {success:false,user:null};

   usuarios.findOne({user: params.user,password: params.password},function (err, docs) {

       if(docs!=null){
           json.success= true;
           json.user = docs;
       }
       res.json(json);

   });

});

router.get('/getByUser/:user', function(req, res, next) {

    let json = {success:false,user:null};
    let user = req.params.user;

    usuarios.findOne({user: user},function (err, docs) {
        if(docs!=null){
            json.success= true;
            json.user = docs;
        }

        res.json(json);

    });

});


router.post('/register', function(req, res, next) {

    let params = req.body;
    let json = {success:false,user:null};

    usuarios.insert(params,function (err, docs) {
        if(!err){
            json.success = true;
            json.user = docs;
        }
        res.json(json);
        console.log(json);
    });

});


router.put('/update', function(req, res, next) {

    let params = req.body;
    let json = {success:false,user:null};

    console.log({ $set: params });
    usuarios.update({ _id: mongojs.ObjectId(params.id) },{ $set: params }, function (err, doc, lastErrorObject) {

        console.log(doc);
        if(!err){
            json.success = true;
            json.user = doc;
        }
        res.json(json);
    });

});



router.put('/updateLugares', function(req, res, next) {

    let params = req.body;
    let json = {success:false,user:null};


    lugares.update({ usuario_id: params.id },{ $set: {lugares : JSON.parse(params.data)}},{upsert: true}, function (err, doc, lastErrorObject) {

        console.log(doc);
        console.log(err);
        if(!err){
            json.success = true;
            json.user = doc;
        }
        res.json(json);
    });

});





router.post('/updateImagen', function(req, res, next) {

    let params = req.body;
    let json = {success:false,url:null};

    let imagedata  = params.imagen;

    var imagen = Buffer.from(imagedata, 'base64');

    let nombre = sha1(Date.now()+params._id);

    let url = "public/images/"+ nombre+".png";


        json.url = "http://localhost:2000/images/"+nombre+".png";

        //console.log(json);
        sharp(imagen)
            .resize(196, 225)
            .crop(sharp.strategy.entropy)
            .toFile(url, function(err) {
                // console.log(err);
                if(err!=null) {

                    //  console.log(err);
                    fs.writeFile(url, imagen, 'binary', function (err) {

                        //console.log(err);
                        if(!err){
                            json.success = true;
                        }
                    })

                }else{
                    json.success= true;
                    console.log(json);
                }

                usuarios.update({ _id: mongojs.ObjectId(params._id) },{ $set: {"avatar": json.url} }, function (err, doc, lastErrorObject) {
                    console.log(doc);
                });


                setTimeout(function () {
                    res.json(json);
                    },4000)

            });


});



router.post('/searchUsuario', function(req, res, next) {

    let params = req.body;
    let json = {success:false,users:null};

    let name = params.name;

    usuarios.find({nombre_y_apellido:name},function (err, docs) {
        if(!err){
            json.success = true;
            json.usuarios = docs;
        }
        console.log(docs)
        res.json(json);
    });

});




router.get('/userLugares/:user', function(req, res, next) {

    let params = req.params;
    let json = {success:false,data:null};


    let id = params.user;
    lugares.findOne({usuario_id:id},function (err, docs) {
        if(!err){
            json.success = true;
            json.data = docs;
        }

        console.log(docs);
        res.json(json);
    });

});



router.get('/userList', function(req, res, next) {

    let json = {success:false,response:null};

    usuarios.find({},function (err, docs) {
        if(!err){
            json.success = true;
            json.usuarios = docs;
        }
        res.json(json);
    });

});


router.delete('/delete/:user', function(req, res, next) {

    let json = {success:false};
    let user = req.params.user;

    usuarios.remove({_id: mongojs.ObjectId(user)},function (err,doc) {

      if(doc.deletedCount>0){
            json.success= true;
      }
      res.json(json);
    });
});



module.exports = router;
