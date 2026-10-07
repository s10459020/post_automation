const excelDir = "//AP-SHANE/Data1/0.資料庫/homeworks";
const excelRange = "A1:R25"

const fs = require("fs")
const path = require("path")
const excel = require("../lib/excel.js")

function encode(...args){
	return args.join('|');
}

function decode(str){
	return str.split('|');
}

/***
 * homeworks: homeworks[code][textbook][day][unit]
 */
module.exports={
	/***
	 * @param query: filter condition
	 * @return rows: the rows of conform data
	 */
	scan: async function(){
		homeworks = []
		
		/* scan dir */
		fs.readdirSync(excelDir)
			.filter(filename => filename.endsWith(".xlsx")) // 只取用xlsx檔
			.filter(filename => !filename.startsWith("~")) // 忽略暫存檔
			.filter(filename => fs.existsSync(path.join(excelDir, filename))) // 去除無效路徑
			.forEach(filename => {
				const filepath = path.join(excelDir, filename); // xlsx完整路徑
			
				/* scan xlsx */
				let {data, row, column} = excel.readTwoHeaderTable(filepath);
				
				/* build datas */
				column.forEach(columnKey => {
					row.forEach(rowKey => {
						if (data[columnKey][rowKey]) {
							code = filename.replace(/\.xlsx$/, '')
							textbook = rowKey
							day = columnKey
							unit = data[columnKey][rowKey]
							homeworks.push({
								'id': encode(code, textbook, day, unit),
								'day': day,
								'code': code,
								'unit': unit,
								'textbook': textbook,
							})
						}
					})
				})
			})
		
		console.log(`call homeworks/scan: ${homeworks.length} counts`)
		console.log(homeworks[0])
		return homeworks;
		//console.log(JSON.stringify(homeworks, null, 2));
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be searched
	 */
	read: async function(id){
		console.log('call homeworks/read')
	},
	
	/***
	 * @param form: data form
	 * @return row: the row be inserted
	 */
	create: async function(form){
		console.log('call homeworks/create')
		
		const files = fs.readdirSync(excelDir)
			.filter(filename => filename.endsWith(".xlsx")) // 只取用xlsx檔
			.filter(filename => !filename.startsWith("~")) // 忽略暫存檔
			.filter(filename => fs.existsSync(path.join(excelDir, filename))) // 去除無效路徑
		
		const filename = form['code'] + ".xlsx"
		if (!form['code'] || !files.includes(filename)) 
			return null
			
		const filepath = path.join(excelDir, filename)
		let {data, row, column} = excel.readTwoHeaderTable(filepath); 
		
		if (!row.includes(form['textbook']))
			return null
		
		if (!column.includes(form['day']))
			return null
		
		console.log(form)
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be deleted
	 */
	delete: async function(id){
		console.log('call homeworks/delete')
	},
	
	/***
	 * @param id: search id
	 * @param form: data form
	 * @return row: the row be updated
	 */
	update: async function(id, form){
		console.log('call homeworks/update')
	}
}

if (require.main === module){
	(async function(){
		await module.exports.scan();
		
		let id = await module.exports.create({
			'day': 1, 
			'code': 'TEPX7A', 
			'textbook': 'REC', 
			'unit': 'FP3 U1-2',
		})
		
		await module.exports.update(id, {
			'day': 2, 
		});
		
		let data = await module.exports.read(id);
		console.log(data)
		
		await module.exports.delete(id);
	})();
}