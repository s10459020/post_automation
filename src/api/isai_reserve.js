const home = require("../lib/isaisys/Home.js")
const infoAdd = require("../lib/isaisys/AppSchoolInfoAdd.js")

module.exports={
	/***
	 * @return: rows for all data
	 */
	scan: async function(){
		console.log('call isai_reserve/scan')
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be searched
	 */
	read: async function(id=null){
		console.log('call isai_reserve/read')
	},
	
	/***
	 * @param form: insert data 
	 * @return row: the row be inserted
	 */
	create: async function(form={}){
		console.log('call isai_reserve/create')
		
		if( !Object.keys(form).length ) {
			const argument = {
				account: "好校通帳號 ",
				passward: "好校通密碼 ",
				time: "預約時間，以 yyyy/mm/dd hh:mm 表示",
				class: "發布班級id",
				title: "發送訊息標題 ",
			}
			const options = {
				content: "發送訊息內文 ",
				audio: "夾帶音檔",
				images: "夾帶檔案，若要多個則以images[0], images[1]...傳入"
			}
			throw new Error("請傳入以下資訊: \n" 
				+ JSON.stringify(argument, null, 2) + "\n"
				+ JSON.stringify(options, null, 2)
			);
		}
		if( !form['account'] || !form['passward'] )	
			throw new Error("請輸入帳號密碼(account, passward)");
		if( !form['time'])	
			throw new Error("請輸入預約時間(time)，格式為 yyyy/mm/dd hh:mm");
		if( !form['class'] )	
			throw new Error("請選擇發布班級(class)");
		if( !form['title'])	
			throw new Error("請輸入標題(title)" );
		
		try{
			var page = await home.login({
				account: form.account, 
				passward: form.passward, 
			})
			var page = await infoAdd.reserve({
				page: page,
				title: form.title,
				content: form.content,
				time: form.time,
				classId: form.class,
				audio: form.audio,
				images: form.images,
			})
		}catch(error){
			console.log(error)
			throw error
		}
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be deleted
	 */
	delete: async function(id=null){
		console.log('call isai_reserve/delete')
	},
	
	/***
	 * @param id: search id
	 * @param data: update data
	 * @return row: the row be updated
	 */
	update: async function(id=null, form={}){
		console.log('call isai_reserve/update')
	}
}