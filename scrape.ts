// import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";


const pagesXpath = '//*[@id="__next"]/div/div/main/div/div[4]/section';

type Review = {
    content: string
    url: string;
};

function load() {
    return Deno.readTextFile("page.html");
}


async function doOnePage(baseUrl: string, page: number) {
    const url = `${baseUrl}?page=${page}`;
    // const res = await fetch(url);
    // const text = await res.text();

    // for debug
    const text = await load();

    // TOOD: parse
    const doc = new DOMParser().parseFromString(text, "text/html",);
    const lastPage = 1;
    const reviews: Review[] = [];
    // *[@id="__next"]/div/div/main/div/div[4]/section
    // /html/body/div[1]/div/div/main/div/div[4]/section
    const p = doc.querySelector("#__next > div > div > main > div > div.styles_mainContent__nFxAv > section");

    // await Deno.writeTextFile("page.html", text);
    // return;
    for (const item of p.childNodes) {
        const s = item.className;
        // if style like then review
        // styles_cardWrapper__LcCPA styles_show__HUXRb styles_reviewCard__9HxJJ
        // for each handle one
        if (s.startsWith('styles_cardWrapper_')) {
            // handle one review
            console.log('found review');
            
            // content
            const content = item.childNodes[0].childNodes[0].childNodes[2].childNodes[1].childNodes[1];
            // date
            const date = item.childNodes[0].childNodes[0].childNodes[2].childNodes[1].childNodes[2];
            // console.log(content.textContent);
            // console.log(date.textContent.trimStart("Date"));
            // break;
        }

        // if styl like then nav -> get last page
        // styles_pagination__6VmQv
        else if (s.startsWith('styles_pagination_')) {
            console.log('found nav')
        }
    }

    // write to file -> easier to handle retry on crash for debug
    return {
        reviews, lastPage,
    }
}

const baseUrl = "https://fr.trustpilot.com/review/www.laposte.fr";

const page1 = await doOnePage(baseUrl, 1);

for (let i = 2; i < page1.lastPage; i++) {
    await doOnePage(baseUrl, i);
    break;
}
