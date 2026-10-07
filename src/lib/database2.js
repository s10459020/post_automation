var database = require("../lib/database");
var mysql = require("mysql");

var CONFIG = {
	host: "localhost",
	user: "root",
	port: "3306",
	password: "root",
	database: "shane",
}

/*
database:
1. ip, port current
2. account, password current
3. database have"shane" and "test"
4. output count of tables
5. test query "select"
6. test query "insert"
7. test query "update"
8. test query "delete"
*/

function database_connect_test(config){
	var conn = mysql.createConnection(config);
	conn.connect(function(error){
		if(!error) return;
		switch(error.errno){
			case -3008: console.log("host not found"); break;
			case 1045: console.log("passward error"); break;
			case 1049: console.log("unknow database"); break;
			case 1251: console.log("unknow account"); break;
			default: console.log("unknow error");
		}
		//console.log(err.errno);
		//console.log(err);
		process.exit(1);
	});
	conn.end();
	console.debug("database connect success!");
}

function connect_test(){
	return 0;
}

new Promise( (resolve, reject) => {
	console.log("testing database.js ...");
	resolve();
})
.then( _ => {
	return new Promise( (resolve, reject) => {
		var conn = mysql.createConnection(CONFIG);
		conn.connect(error => {
			resolve({
				conn: conn,
				error: error? error: {errno: 0},
			});
		});
	})
})
.then( result => {
	if(result.error.errno == 1	){
		console.log("(X): database's ip:port is correct");
	}else{
		console.log("(V): database's ip:port is correct");
		console.log(result.error.errno);
		console.log(result.error)
		result.conn.end();	
	}
})