// const puppeteer = require('puppeteer');
const PCR = require("puppeteer-chromium-resolver");
const prompt = require("prompt-sync")();

var nim;
var password;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main() {
    const options = {};
    
    const stats = await PCR(options);
    console.log("Welcome to Autofill SIAM UB Survey");
    console.log("Its IMPORTANT to have Chrome Installed!");
    const browser = await stats.puppeteer.launch({
        headless: false,
        args: ["--no-sandbox"],
        executablePath: stats.executablePath
    }).catch(function(error) {
        console.log(error);
    });
    var page = await browser.newPage();
    await page.goto('https://siam.ub.ac.id/');


    console.log("Press CTRL + C or close browser windows to exit the program")
    nim = prompt("Please insert your nim : ");
    password = prompt("Please insert your password : ");
    await page.type('input[name|="username"]', nim);
    await page.type('input[name|="password"]', password);
    await page.evaluate(() => {
        document.querySelector('input[type=submit]').click();
    });
    page.close()

    page = await browser.newPage();
    const response = await page.goto("https://siam.ub.ac.id/notifikasi.php");
    const chain = response.request().redirectChain();

    if (chain.length > 0) {
        console.log("Your Login Credentials is FALSE! Stopping program immediately")
        page.close()
        await browser.close();
        return;
    }

    var allForm = await page.evaluate(() => {
        return document.querySelectorAll('tr.text td a').length
    })
    let formFilled = 0;
    console.log("Survey to be filled: " + allForm.toString())
    console.log("-------------------------------------------------------------------------------------------------------")
    page.close()

    for (let index = 0; index < allForm; index++) {
        page = await browser.newPage();
        const response = await page.goto("https://siam.ub.ac.id/notifikasi.php")

        const chain = response.request().redirectChain();
        console.log(chain)

        if (index%4 == 0) {
            console.log("-----------------Relogin-----------------")
            await page.goto("https://siam.ub.ac.id/logout.php")
            page.close()
            page = await browser.newPage();
            await page.goto('https://siam.ub.ac.id/');
            await page.waitForSelector("input")
            await delay(3000);
        
        
            console.log("Press CTRL + C or close browser windows to exit the program")
            await page.type('input[name|="username"]', nim);
            await page.type('input[name|="password"]', password);
            console.log(nim,password)
            await page.evaluate(() => {
                document.querySelector('input[type=submit]').click();
            });
            await page.close()
            page = await browser.newPage();
            await page.goto("https://siam.ub.ac.id/notifikasi.php")
        }

        await page.waitForSelector("tr.text td a")
        let surveyTitle = await page.evaluate(async () => {
            return document.querySelector('tr.text td[align]').innerHTML
        })
        console.log("Filling out the survey with the title : " + surveyTitle)
        let hrefSurvey = await page.evaluate(async () => {
            if ((document.querySelector("tr.text td a").getAttribute("href")) == null) {
                return null
            }
            return document.querySelector("tr.text td a").getAttribute("href")
        })
        if (hrefSurvey == null) {
            console.log("FAILED")
            continue
        }
        page.close()

        page = await browser.newPage();
        await page.goto("https://siam.ub.ac.id/" + hrefSurvey)
        console.log(hrefSurvey)
        await page.waitForSelector("tr.text td input")
        await page.evaluate(() => {
            var radio = document.querySelectorAll('tr.text td input[value|="5"]')
            for (let index = 0; index < radio.length; index++) {
                radio[index].checked = true
            }
            document.getElementById("saran").value = "terima kasih semoga berkah"
            document.getElementById("form_kuis").submit()
        })
        page.close()
        formFilled++;
        console.log("SUCCESS")
    }
    console.log("-------------------------------------------------------------------------------------------------------")
    console.log("Succesfully fill survey. Success:" + formFilled.toString() + " Failed: " + (allForm - formFilled).toString())
    await browser.close();
}


function login() {

}

main();