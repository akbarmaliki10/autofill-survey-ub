const puppeteer = require('puppeteer');
const prompt = require("prompt-sync")();

async function main() {
    console.log("Welcome to Autofill SIAM UB Survey");
    console.log("Its IMPORTANT to have Chrome Installed!");
    const browser = await puppeteer.launch({
        headless: false
    });
    var page = await browser.newPage();
    await page.goto('https://siam.ub.ac.id/');


    console.log("Press CTRL + C or close browser windows to exit the program")
    const nim = prompt("Please insert your nim : ");
    const password = prompt("Please insert your password : ");
    await page.type('input[name|="username"]', nim);
    await page.type('input[name|="password"]', password);
    await page.evaluate(() => {
        document.querySelector('input[type=submit]').click();
    });
    page.close()

    page = await browser.newPage();
    const response = await page.goto("https://siam.ub.ac.id/notifikasi.php");
    const chain = response.request().redirectChain();
    console.log(chain.length); // Return 1
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
        await page.goto("https://siam.ub.ac.id/notifikasi.php")
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
main();