var mysql = require('mysql');
var CONFIG = {
	host: "localhost",
	port: "3306",
	user: "root",
	password: "root",
	database: "shane",
}

module.exports = {
	query: function(sql) {
		// console.log("- query:", sql)
		return new Promise( (resolve, reject) => {
			var conn = mysql.createConnection(CONFIG);
			conn.connect(CONFIG);
			conn.query(sql, (error, results) => {
				if (error) throw error;
				conn.end();
				resolve(results); 
			}); 
		})
	},	
	
	select: async function(table, cond=null){
		var select_sql = cond ?
			mysql.format("SELECT * FROM ?? WHERE ?", [table, cond]) : 
			mysql.format("SELECT * FROM ?? ", [table]);
		var rows = await module.exports.query(select_sql);
		return rows;
	},
	
	insert: async function(table, form){
		var insert_sql = mysql.format("INSERT INTO ?? SET ?", [table, form]);
		var results = await module.exports.query(insert_sql)
		var id = results.insertId; 
		
		var select_sql = mysql.format("SELECT * FROM ?? WHERE id = ?", [table, id]);
		var rows =  await module.exports.query(select_sql);
		
		return rows;
	},
	
	delete: async function(table, cond){
		var select_sql = mysql.format("SELECT * FROM ?? WHERE ?", [table, cond]);
		var rows = await module.exports.query(select_sql);
		
		var insert_sql = mysql.format("DELETE FROM ?? WHERE ?", [table, cond]);
		var results = await module.exports.query(insert_sql);
		
		return rows;
	},
	
	update: async function(table, cond, form){
		var update_sql = mysql.format("UPDATE ?? SET ? WHERE ?", [table, form, cond]);
		var results = await module.exports.query(update_sql)
		
		var select_sql = mysql.format("SELECT * FROM ?? WHERE ?", [table, cond]);
		var rows =  await module.exports.query(select_sql);
		
		return rows;
	},
	
	time: function() {
        var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
		return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
	}
}