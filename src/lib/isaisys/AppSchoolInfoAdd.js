const path = require('path')
const fs = require('node:fs')
const home = require('./Home.js')
const { Page } = require('./Page.js')

const GROUP_CLASS = 1
const GROUP_PARENT = 2
const GROUP_SCHOOL = 3

class AppSchoolInfoAdd extends Page{
	constructor(page = {}){
		super(page)
		this.url = "https://isaisys.iqschool.com.tw/AppSchoolInfoAdd?PG_ID=APISCHOOLINFO"
		this.form = new FormData()
		this.table = {}
	}
	
	async init(){
		var url = this.url
		
		var packet = await this.get(url)
		if( packet.response.status == "404" ) throw new Error(`AppSchoolInfoAdd page is not available: ${url}.`)
		if( packet.response.status != "200" ) throw new Error(`Unknown error occur: ${url}.`)
	}
	
	setTitle(title){
		if( !title ) throw new Error(`Title is necessary`)
		this.form.set("ctl00$ContentPlaceHolder1$txtTitle", title)
	}
	
	setContent(content){
		this.form.set("ctl00$ContentPlaceHolder1$txtContext", content)
	}
	
	reserve(time){
		this.form.set("ctl00$ContentPlaceHolder1$H_issuedDate", time)
	}
	
	async setAudio(audio){
		const filepath = audio
		const filename = path.parse(filepath).base
		const buffer = await fs.openAsBlob(filepath)
		this.form.append("ctl00$ContentPlaceHolder1$audioFile1", buffer, filename)
	}
	
	async setImages(images){
		for (const i in images) {
			if(images[i] == "") continue
			
			const filepath = images[i]
			const filename = path.parse(filepath).base
			const buffer = await fs.openAsBlob(filepath)
			this.form.append("ctl00$ContentPlaceHolder1$multiUpload", buffer, filename)
		}
	}

	async setGroup(group){
		const url = this.url		
		
		if( ![1,2,3].includes(group) ) throw new Error(`Unknow group: ${group}`)	
		
		this.form.set('ctl00$ContentPlaceHolder1$dropSelectObject', group)
		
		const ajaxForm = this.copyForm(this.form)
		ajaxForm.set("__EVENTTARGET", "ctl00$ContentPlaceHolder1$dropSelectObject")
		ajaxForm.set('ctl00$ContentPlaceHolder1$dropSelectObject', group)
		ajaxForm.set('ctl00$ScriptManager1', "ctl00$ScriptManager1|ctl00$ContentPlaceHolder1$dropSelectObject")
		
		const packet = await this.ajax(url, ajaxForm)
		if( packet.response.status == "404" ) throw new Error(`AppSchoolInfoAdd ajax is not available: ${url}`)
		if( packet.response.status != "200" ) throw new Error(`Unknown error occur: ${packet.response.status}, ${url}.`)
		if( packet.response.body.includes("alert('網頁逾時')") ) throw new Error(`Please login.`)
		if( packet.response.body.includes("error|500") ) throw new Error(`AppSchoolInfoAdd ajax fail: ${packet.request.form}`)
			
		const table = packet.response.dom.querySelector("#cbObject")
		if( !table ){
			require('fs').writeFileSync(__dirname + '/error.html', packet.response.body)
			throw new Error(`Objects table is not found, 'error.html' is store in : ${__dirname}`)
		}			
			
		this.table = table
	}
	
	async setObjects(ids){
		const url = this.url
		const table = this.table
		
		for (var i = 0; i < ids.length; i++){
			var id = ids[i]
			
			var query = table.querySelector(`input[value='${id}']`)
			if(!query) throw new Error(`Object id not found: ${id}`)	
			
			var index = query.id.match(/\d+/)[0]
			this.form.set(`ctl00$ContentPlaceHolder1$cbObject$cbObject_${index}`, "")
			this.form.set(`ctl00$ContentPlaceHolder1$cbObjectSelect$cbObjectSelect_${i}`, "")
			
			const ajaxForm = this.copyForm(this.form)
			ajaxForm.set(`__EVENTTARGET`, `ctl00$ContentPlaceHolder1$cbObject$cbObject_${index}`)
			ajaxForm.set(`ctl00$ScriptManager1`, `ctl00$ContentPlaceHolder1$UpdatePanel1|ctl00$ContentPlaceHolder1$cbObject$cbObject_${index}`)
			
			var packet = await this.ajax(url, ajaxForm)
			if( packet.response.status == "404" ) throw new Error(`AppSchoolInfoAdd ajax is not available: ${url}`)
			if( packet.response.status != "200" ) throw new Error(`Unknown error occur: ${packet.response.status}, ${url}.`)
			if( packet.response.body.includes("alert('網頁逾時')") ) throw new Error(`Please login.`)
			if( packet.response.body.includes("error|500") ) throw new Error(`AppSchoolInfoAdd ajax fail: ${packet.request.form}`)
		}
	}
	
	async send(){
		const url = this.url
		
		this.form.set('ctl00$ContentPlaceHolder1$btnSave', "送出")
		var packet = await this.post(url, this.form)
		if( packet.response.status == "404" ) throw new Error(`AppSchoolInfoAdd post is not available: ${url}`)
		if( packet.response.status == "500" ) throw new Error(`AppSchoolInfoAdd post fail: ${packet.request.form}`)
		if( packet.response.status != "200" ) throw new Error(`Unknown error occur: ${packet.response.status}, ${url}.`)
	}
}

async function send({page, title, content = "", members = []}) {
	members = typeof(members) == "object"? members: [members]
	
	var page = new AppSchoolInfoAdd(page)
	await page.init()
	await page.setTitle(title)
	await page.setContent(content)
	await page.setGroup(GROUP_PARENT)
	await page.setObjects(members)
	await page.send()
}

async function reserve({page, title, content = "", time, classId, audio = null, images=[]}) {
	images = typeof(images) == "object"? images: [images]
		
	var page = new AppSchoolInfoAdd(page)
	await page.init()
	await page.setTitle(title)
	await page.setContent(content)
	await page.reserve(time)
	await page.setGroup(GROUP_CLASS)
	await page.setObjects([classId])
	if(audio) await page.setAudio(audio)
	if(images.length > 0) await page.setImages(images)
	await page.send()
}

async function testSend(){
	await Promise.resolve()
	.then( _ => {
		return home.login({
			account: "0907490584", 
			passward: "0907490584", 
		})
	}).then( page => {
		return exports.send({
			page: page,
			title: "Test",
			content: "Program send test",
			objects: [1120653],
		})
	}).then( page => {
		console.log("send success")
	})
}

async function testReserve(){
	await Promise.resolve()
	.then( _ => {
		return home.login({
			account: "0907490584", 
			passward: "0907490584", 
		})
	}).then( page => {
		return exports.reserve({
			page: page,
			title: "Test",
			content: "Program reserve test",
			time: "2025/01/01 07:00",
			classId: 114890,
			images: ["E:/Computer_Desktop/test1.jpg", "E:/Computer_Desktop/test2.jpg"],
		})
	}).then( page => {
		console.log("reserve success")
	})
}

exports.send = send
exports.reserve = reserve

//testSend()
//testReserve()