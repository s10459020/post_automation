const { JSDOM } = require("jsdom")

class Page {
	constructor(page = {}){
		this.session = page.session || ""
		this.viewstate = page.viewstate || ""
		this.eventvalidation = page.eventvalidation || ""
	}
	
	get(url, headers = {}){ 
		return new Promise( async (resolve, reject) => {
			const packet = {}
			packet.response = {}
			packet.request = {}
			packet.request.url = url
			packet.request.method = "GET"
			packet.request.headers = {...headers, ...{'cookie': this.session}}
			
			await fetch(packet.request.url, {
				method: packet.request.method,
				headers: packet.request.headers,
			})
			.then( response => { // get cookie
				var C = response.headers.get('set-cookie')
				if(C) this.session = C.split(';')[0]
				
				packet.response.status = response.status
				packet.response.headers = Object.fromEntries(Array.from(response.headers.entries()));
				packet.response.statusText = response.statusText
				return response.text()
			}) 
			.then( body => { // get ASP.NET values and DOM
				this.getAspInfoInResponse(body)
				
				const fs = require('fs')
				fs.writeFileSync('get.html', body)
				
				var dom = new JSDOM(body).window.document;
				packet.response.body = body
				packet.response.dom = dom
			})
			.then( _ => resolve(packet))
		})
	}
	
	ajax(url, formData, headers = {}){
		return new Promise( async (resolve, reject) => {
			const ajaxForm = this.copyForm(formData)		
			ajaxForm.set("__ASYNCPOST", "true")
			ajaxForm.set("__VIEWSTATE", this.viewstate)
			ajaxForm.set("__EVENTVALIDATION", this.eventvalidation)
			
			const packet = {}
			packet.response = {}
			packet.request = {}
			packet.request.url = url
			packet.request.body = ajaxForm
			packet.request.form = Array.from(ajaxForm.entries()).reduce((acc, cur) => 
				typeof(cur[1]) == "string"?
					`${acc}\n - ${cur[0]}: ${cur[1].substring(0, 80)}${cur[1].length > 80? "...": ""}`:
					`${acc}\n - ${cur[0]}: ${typeof(cur[1])}`, 
				"[formdata]"
			)
			packet.request.method = "POST"
			packet.request.headers = {...headers, ...{
				'cookie': this.session,
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
			}}
			
			await fetch(packet.request.url, {
				body: packet.request.body,
				method: packet.request.method,
				headers: packet.request.headers,
			}) 
			.then( response => { // get cookie
				var C = response.headers.get('set-cookie')
				if(C) this.session = C.split(';')[0]
				
				packet.response.status = response.status
				packet.response.headers = Object.fromEntries(Array.from(response.headers.entries()));
				packet.response.statusText = response.statusText
				return response.text()
			}) 
			.then( body => { // get ASP.NET values in ajax pattern
				this.getAspInfoInAjax(body)
				
				const fs = require('fs')
				fs.writeFileSync('ajax.html', body)
				
				var dom = new JSDOM(body).window.document;
				packet.response.body = body
				packet.response.dom = dom
			})
			.then( _ => resolve(packet))
		})
	}
	
	post(url, formData, headers = {}){ 
		return new Promise( async (resolve, reject) => {
			const postForm = this.copyForm(formData)		
			postForm.set("__VIEWSTATE", this.viewstate)
			postForm.set("__EVENTVALIDATION", this.eventvalidation)
			
			const packet = {}
			packet.response = {}
			packet.request = {}
			packet.request.url = url
			packet.request.body = postForm
			packet.request.form = Array.from(postForm.entries()).reduce((acc, cur) => 
				typeof(cur[1]) == "string"?
					`${acc}\n - ${cur[0]}: ${cur[1].substring(0, 80)}${cur[1].length > 80? "...": ""}`:
					`${acc}\n - ${cur[0]}: ${typeof(cur[1])}`, 
				"[formdata]"
			)
			packet.request.method = "POST"
			packet.request.method = "POST"
			packet.request.headers = {...headers, ...{
				'cookie': this.session,
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
			}}
			
			await fetch(packet.request.url, {
				body: packet.request.body,
				method: packet.request.method,
				headers: packet.request.headers,
			}) 
			.then( response => { // get cookie
				var C = response.headers.get('set-cookie')
				if(C) this.session = C.split(';')[0]
					
				packet.response.status = response.status
				packet.response.headers = Object.fromEntries(Array.from(response.headers.entries()));
				packet.response.statusText = response.statusText
				return response.text()
			}) 
			.then( body => { // get ASP.NET values and DOM
				this.getAspInfoInResponse(body)
				
				const fs = require('fs')
				fs.writeFileSync('post.html', body)
				
				var dom = new JSDOM(body).window.document;
				packet.response.body = body
				packet.response.dom = dom
			})
			.then( _ => resolve(packet))
		})
	}
	
	getAspInfoInResponse(body){
		var document = new JSDOM(body).window.document
		var V = document.querySelector(`#__VIEWSTATE`)
		var E = document.querySelector(`#__EVENTVALIDATION`)
		
		if(V) this.viewstate = V.value
		if(E) this.eventvalidation = E.value
	}
	
	getAspInfoInAjax(body){
		var splits = body.split('|')
		var V = splits.indexOf("__VIEWSTATE")
		var E = splits.indexOf("__EVENTVALIDATION")
		
		if(V != -1) this.viewstate = splits[V+1]
		if(E != -1) this.eventvalidation = splits[E+1]
	}
	
	copyForm(formData){
		const copyForm = new FormData()
		for (const pair of formData.entries()){
			copyForm.append(pair[0], pair[1])
		}
		return copyForm
	}
}

exports.Page = Page