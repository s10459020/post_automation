const infoAdd = require("../lib/isaisys/AppSchoolInfoAdd.js")

module.exports={
	/***
	 * @return: rows for all data
	 */
	scan: async function(){
		console.log('call isai_message/scan')
		
		var document = await isaisys.get("0907490584", "https://isaisys.iqschool.com.tw/APPSchoolInfo?PG_ID=APISCHOOLINFO");
		var tbody = document.querySelector("#ContentPlaceHolder1_GridView1 > tbody")
		var ids = 		[...tbody.querySelectorAll("tr > td:nth-child(10) > *[id^=msgId]")].map(input => input.value);
		var titles = 	[...tbody.querySelectorAll("tr > td:nth-child(5)")].map(td => td.innerHTML.trim());
		var senders = 	[...tbody.querySelectorAll("tr > td:nth-child(7)")].map(td => td.innerHTML.trim());
		var replys = 	[...tbody.querySelectorAll("tr > td:nth-child(9)")].map(td => td.innerHTML.trim());
		var dates = 	[...tbody.querySelectorAll("tr > td:nth-child(11)")].map(td => td.innerHTML.trim());	
		var contents = 	[...tbody.querySelectorAll("tr > td:nth-child(6)")].map(td => {
			var content = td.innerHTML.trim();
			var content = content.replace(/<table>.*<\/table>/i, '');
			var content = content.replaceAll('<br>', '');
			return content.trim();
		});
		
		
		var datas = ids.map((e, i) => {
			return {
				id: ids[i],
				date: dates[i],
				reply: replys[i],
				title: titles[i],
				sender: senders[i],
				content: contents[i],
			}
		})
		return datas;
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be searched
	 */
	read: async function(id){
		console.log('call isai_message/read')
		var document = await isaisys.get("0907490584", `https://isaisys.iqschool.com.tw/APPSchoolInfo_Reply?M_ID=${id}`);
		
		var title = document.querySelector("#ContentPlaceHolder1_h2r").innerHTML;
		var tbody = document.querySelector("#ContentPlaceHolder1_divContent > div > table > tbody")
		
		var first = tbody.querySelector("tr:nth-child(2) > td.td ")
		var image = first.querySelector("img").src
		var date = 	first.lastElementChild.innerHTML;
		var	content = first.innerHTML.trim()
			content = content.replace(/<table>.*<\/table>/i, '');
			content = content.replace(/<div.*>.*<\/div>/i, '');
			content = content.replaceAll('<br>', '');
			content = content.trim()
			
		var result = {
			id: id,
			date: date,
			title: title,
			image: image,
			content: content,
		}
		return result;
	},
	
	/***
	 * @param form: insert data 
	 * @return row: the row be inserted
	 */
	create: async function(form={}){
		console.log('call isai_message/create')
		if( !Object.keys(form).length ) 
			return {
				error: "請傳入以下資訊",
				form: {
					account: "好校通帳號 ",
					passward: "好校通密碼 ",
					title: "發送訊息標題 ",
					members: "發布對象id，可發給複數目標",
				},
				options: {
					content: "發送訊息內文 ",
				}
			}
		
		if( !form['account'] || !form['passward'] )	
			return { error: "請輸入帳號密碼(account, passward)" }
		if( !form['members'] )	
			return { error: "請選擇發布對象(members)" }
		if( !form['title'])	
			return { error: "請輸入標題(title)" }
		
		const document = await infoAdd.send({
			account: form.account,
			passward: form.passward,
			title: form.title,
			content: form.content,
			members: form.members,
		});
		return document;
	},
	
	/***
	 * @param id: search id
	 * @return row: the row be deleted
	 */
	delete: async function(id){
		console.log('call isai_message/delete')
		return rows[0];
	},
	
	/***
	 * @param id: search id
	 * @param data: update data
	 * @return row: the row be updated
	 */
	update: async function(id, form){
		console.log('call isai_message/update')
		return rows[0];
	}
}