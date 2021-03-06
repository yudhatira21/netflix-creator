const faker = require('faker');
const Mailjs = require("./Mailjs");
const puppeteer = require("puppeteer-extra");
const readlineSync = require('readline-sync');
const delay = require('delay');
const fetch = require('node-fetch');
const fs = require('fs');

const mailjs = new Mailjs();

function get_between(string, start, end) {
	string = " " + string;
	let ini = string.indexOf(start);
	if (ini == 0) return "";
	ini += start.length;
	let len = string.indexOf(end, ini) - ini;
	return string.substr(ini, len);
}

async function netflix() {

	console.log("๐๐๐๐๐๐๐ ๐ผ๐พ๐พ๐๐๐๐ ๐พ๐๐๐ผ๐๐๐");
	console.log("๐ค๐ณ๐ฆ๐ข๐ต๐ฆ๐ฅ ๐ฃ๐บ ๐บ๐ถ๐ฅ๐ฉ๐ข ๐ต๐ช๐ณ๐ข ๐ฑ๐ข๐ฎ๐ถ๐ฏ๐จ๐ฌ๐ข๐ด\n");
	const set_password = readlineSync.question("Set your password : ");
	const banyak = readlineSync.question("How many u want to create account ? ");

	for(let i = 0; i < banyak; i++){
		const netflix_page = 'https://www.netflix.com/';

		const randomName = faker.name.findName();
		const randomEmail = faker.internet.email();
		const explode = randomEmail.split("@");
		const email = explode[0] + "@workingtall.com";

		console.log("\n๐Try to generate email");
		const register_email = await mailjs.register(email, set_password);

		if (register_email.status === true) {
			console.log("โSuccess generate email " + register_email.data.address);
			console.log("๐Register " + register_email.data.address + " on netflix");
			console.log("๐Please wait...");

			const browser = await puppeteer.launch({
				headless: true,
				ignoreHTTPSErrors: true,
				args: [
				'--window-size=820,700'
				]
			});

			const page = await browser.newPage();

			await page.goto(netflix_page, {waitUntil: 'networkidle2'});

			await page.waitForSelector('input[name=email]');
			const emailInput = await page.$('input[name=email]');
			await emailInput.type(register_email.data.address);

			await page.click('button[class="btn btn-red nmhp-cta nmhp-cta-extra-large btn-none btn-custom"]');

			await delay(5000);
			await page.waitForSelector('div[class="submitBtnContainer"]');
			await page.click('div[class="submitBtnContainer"]');

			await delay(2000);
			await page.waitForSelector('input[type="password"]');
			const passInput = await page.$('input[type="password"]');
			await passInput.type(set_password);
			await page.click('div[class="submitBtnContainer"]');

			await delay(2000);
			const response = await page.content();
			const data = await get_between(response, 'data-uia="stepTitle">', '</h1>');

			if (data == 'Choose your plan.') {
				console.log("โSuccess register account " + register_email.data.address);

				const result = register_email.data.address + '|' + set_password + '\r\n';
				fs.appendFileSync(`result_netflix.txt`, result);
				console.log('โSaved to result_netflix.txt');

				await browser.close();
			} else {
				console.log("โFailed to register account");
				await browser.close();
			}

		} else {
			console.log("โFailed to generate email");
		}
	}

}

netflix();
