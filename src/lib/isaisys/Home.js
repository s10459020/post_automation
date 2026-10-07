const { Page } = require('./Page.js')

class Home extends Page{
	constructor(page = {}){
		super(page)
		this.url = "https://isaisys.iqschool.com.tw/"
	}
	
	async init(){
		var url = this.url
		
		var packet = await this.get(url)
		if( packet.response.status == "404" ) throw new Error(`Home page is not available: ${url}.`)
		if( packet.response.status != "200" ) throw new Error(`Unknown error occur: ${packet.response.status}, ${url}.`)
	}
	
	async login(account, passward){
		var url = this.url
		
		if( !account ) 	throw new Error(`Account is necessary: ${account}`)
		if( !passward ) throw new Error(`Passward is necessary: ${passward}`)

		const form = new FormData()
		form.set('btnLogin', "")
		form.set('txtLoginId', account)
		form.set('txtPassWord', passward)
		
		var packet = await this.post(url, form)
		if( packet.response.status == "404" ) throw new Error(`Home post is not available: ${url}.`)
		if( packet.response.status != "200" ) throw new Error(`Unknown error occur: ${packet.response.status}, ${url}.`)
		if( packet.response.body.includes("alert('輸入用戶帳號或密碼錯誤！請重新輸入。')") )
			throw new Error(`Account or Passward error: ${account}/${passward}`)
	}
}

async function login({account, passward}) {
	try{
		var page = new Home(page)
		await page.init()
		await page.login(account, passward)
		return page
	}catch(error){
		throw error
	}
}

async function main(){
	await new Promise( (resolve, reject) => {
		exports.login({
			account: "0907490584", 
			passward: "0907490584",
		})
	}).then( _ => {
		console.log("success login")
	})
}

exports.login = login

//main()