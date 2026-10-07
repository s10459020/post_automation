const database = require("../lib/database.js")

function reload(file_path){
    delete require.cache[require.resolve(file_path)];
	return require(file_path);
}

module.exports={
	/***
	 * @return: rows for all data
	 */
	scan: async function(){
		console.log('call test/scan')
		
		var rows = await database.select('test');
		return rows;
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be searched
	 */
	read: async function(id){
		console.log('call test/read')
		
		var rows = await database.select('test', {'id': id});
		return rows[0];
	},
	
	/***
	 * @param form: insert data
	 * @return row: the row be inserted
	 */
	create: async function(form){
		console.log('call test/create')
		
		var data = {
			date: database.time(),
			name: form.name || "",
			level: form.level || 0,
			comment: form.comment || "",
		}
		
		var rows = await database.insert('test', data);
		return rows[0];
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be deleted
	 */
	delete: async function(id){
		console.log('call test/delete')
		
		var rows = await database.delete('test', {'id': id});
		return rows[0];
	},
	
	/***
	 * @param id: search id
	 * @param data: update data
	 * @return row: the row be updated
	 */
	update: async function(id, form){
		console.log('call test/update')
		
		var data = {}
		if('name' in form) 
			data.name = form.name;
		if('level' in form) 
			data.level = form.level;
		if('comment' in form) 
			data.comment = form.comment;
		
		var rows = await database.update('test', {'id': id}, data);
		return rows[0];
	}
}