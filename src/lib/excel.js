const xlsx = require('xlsx');
const assert = require('assert');

module.exports={
	/***
	 * @param: table: string, table name.
	 * @param: conds: dict, filter for datas.
	 */	
	readTwoHeaderTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, true, true);
		return {'data': data, 'row': row, 'column': column}
	},
	
	readTopHeaderTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, true, false);
		return {'data': data, 'row': row}
	},
	
	readLeftHeaderTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, false, true);
		return {'data': data, 'column': column}
	},
	
	readTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, false, false);
		return {'data': data}
	},

	writeTwoHeaderTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, true, true);
		return {'data': data, 'row': row, 'column': column}
	},
	
	writeTopHeaderTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, true, false);
		return {'data': data, 'row': row}
	},
	
	writeLeftHeaderTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, false, true);
		return {'data': data, 'column': column}
	},
	
	writeTable: function(filepath, {range=null, sheetName=null} = {}){
		const {data, row, column} = readExcel(filepath, range, sheetName, false, false);
		return {'data': data}
	},
}

function toCoords(cell){
	column = cell.match(/^[A-Z]+/)[0]
	row = cell.match(/[0-9]+$/)[0]
	
	x = 0
	for(var i = 0; i < column.length; i++){
		x *= 26
		x += column.charCodeAt(i) - 'A'.charCodeAt(0) + 1
	}
	y = parseInt(row)
	return {x: x, y: y}
}

function toCell(x,y){
	column = ""
	while (x > 0){
		x -= 1
		column = String.fromCharCode('A'.charCodeAt(0) + x%26) + column
		x = Math.floor(x/26)
	}
	row = y.toString()
	
	return column + row
}

function openFile(filepath, sheetName=null){
	const workbook = xlsx.readFile(filepath);
	sheetName = sheetName ?? workbook.SheetNames[0];
	const worksheet = workbook.Sheets[sheetName];
	return worksheet
}

function getRange(worksheet, range=null){
	range = range ?? worksheet['!ref'];
	const [start, end] = range.split(':');
	const {x:bx, y:by} = toCoords(start);
	const {x:ex, y:ey} = toCoords(end);
	return {'begin': {'x':bx, 'y':by}, 'end': {'x':ex, 'y':ey}}
}

function getHeader(worksheet, begin, end, {row = null, column = null}){
	assert(row != null || column != null)
	
	let metas = []
	for (let i = begin; i <= end; i++){
		const x = row? i: column;
		const y = row? row: i;
		const cell = toCell(x, y);
		const value = worksheet[cell];
		if (value){
			metas.push({
				'x': x,
				'y': y,
				'key': value.v,
			});
		}
	}
	
	return metas
}

function getData(worksheet, row_metas, col_metas, rowHeader=false, colHeader=false){
	let data = colHeader? {}: [];

	col_metas.forEach((col_meta, j) => {
		const key_y = colHeader? col_meta.key: j;
		data[key_y] = rowHeader? {}: [];

		row_metas.forEach((row_meta, i) => {
			const key_x = rowHeader? row_meta.key: i;
			const cell = toCell(row_meta.x, col_meta.y);
			const value = worksheet[cell];
			
			if (worksheet[cell]){
				data[key_y][key_x] = value.v
			}
		})
	})
	
	return data
}

function readExcel(filepath, range=null, sheetName=null, rowHeader=false, colHeader=false){
	const worksheet = openFile(filepath, sheetName);
	const {begin, end} = getRange(worksheet, range)
	
	const row_metas = getHeader(worksheet, begin.x, end.x, {row: begin.y});
	const col_metas = getHeader(worksheet, begin.y, end.y, {column: begin.x});
	const datas = getData(worksheet, row_metas, col_metas, rowHeader, colHeader)
	
	return {
		'data': datas,
		'row': rowHeader? row_metas.map(meta => meta.key).slice(colHeader): [],
		'column': colHeader? col_metas.map(meta => meta.key).slice(rowHeader): [],
	}
}

function writeExcel(filepath, row, column, data, range=null, sheetName=null, topHeader=false, leftHeader=false){
	const worksheet = openFile(filepath, sheetName);
	const {begin, end} = getRange(worksheet, range)
	
	const top_metas = getHeader(worksheet, begin.x, end.x, {row: begin.y});
	const left_metas = getHeader(worksheet, begin.y, end.y, {column: begin.x});
	
	x = topHeader? top_metas[row].x: begin.x + row
	y = leftHeader? left_metas[column].y: begin.y + column
	worksheet[toCell(x,y)] = data
}

if (require.main === module){
	(async function(){
		filepath = "E:\\Project_Gitlab\\shane_api\\src\\test.xlsx";

		var worksheet = openFile(filepath)
		console.log("worksheet 1", worksheet)

		var worksheet = openFile(filepath, "Table 1")
		console.log("worksheet 2", worksheet)

		var {begin, end} = getRange(worksheet)
		console.log("range 1", begin, end)

		var {begin, end} = getRange(worksheet, "C3:E6")
		console.log("range 2", begin, end)
		
		var top_metas = getHeader(worksheet, begin.x, end.x, {row: begin.y});
		console.log("header 1", top_metas)

		var left_metas = getHeader(worksheet, begin.y, end.y, {column: begin.x});
		console.log("header 2", left_metas)
	})();
}