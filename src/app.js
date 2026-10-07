var express = require('express');
const IP = '127.0.0.1';
const PORT = 80;

function reload(file_path){
    delete require.cache[require.resolve(file_path)];
	return require(file_path);
}

function setRouter(file_path){
	var module = require(file_path);
	
	var router = express.Router();
	router.get('/', async function(req, res){ 
		module = reload(file_path);
		try{
			var rows = await module.scan();
			res.header("Content-Type",'application/json');
			res.send(JSON.stringify(rows, null, 4));
		}catch (error) {
			res.statusCode = 400;
			res.send(error.message);
		}
	});
	router.post('/', async function(req, res){
		module = reload(file_path);
		try{
			var data = req.body;
			var rows = await module.create(data);
			res.statusCode = 200;
			res.header("Content-Type",'application/json');
			res.send(JSON.stringify(rows, null, 4));
		}catch (error) {
			res.statusCode = 400;
			res.send(error.message);
		}
	});
	router.get('/:id', async function(req, res){ 
		module = reload(file_path);
		var id = req.params.id;
		var rows = await module.read(id);
		res.header("Content-Type",'application/json');
		res.send(JSON.stringify(rows, null, 4));
	});
	router.delete('/:id',async function(req, res){ 
		module = reload(file_path);
		var id = req.params.id;
		var rows = await module.delete(id);
		res.header("Content-Type",'application/json');
		res.send(JSON.stringify(rows, null, 4));
	});
	router.put('/:id', async function(req, res){ 
		module = reload(file_path);
		var id = req.params.id;
		var data = req.body;
		var rows = await module.update(id, data);
		res.header("Content-Type",'application/json');
		res.send(JSON.stringify(rows, null, 4));
	});
	return router;
}

(function openServer(){
	var app = express();
	app.use(express.urlencoded({extended: true}));
	app.use(express.json())
	app.use('/reserve', setRouter('./api/isai_reserve.js'));
	app.use('/message', setRouter('./api/isai_message.js'));
	app.use('/', setRouter('./api/test.js'));
	
	app.listen(PORT, () => {
		console.log(`Webapi running at http://${IP}:${PORT}/`);
	})	
})()