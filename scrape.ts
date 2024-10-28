// import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";
import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const pagesXpath = '//*[@id="__next"]/div/div/main/div/div[4]/section';

type Review = {
  content: string;
  date: string;
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
  const doc = new DOMParser().parseFromString(text, "text/html");
  let lastPage = 1;
  const reviews: Review[] = [];
  // TODO: use xpath instead
  // *[@id="__next"]/div/div/main/div/div[4]/section
  // /html/body/div[1]/div/div/main/div/div[4]/section
  const p = doc.querySelector(
    "#__next > div > div > main > div > div.styles_mainContent__nFxAv > section",
  );

  // await Deno.writeTextFile("page.html", text);
  // return;
  for (const item of p.childNodes) {
    const s = item.className;
    if (s.startsWith("styles_cardWrapper_")) { // handle review -> styles_cardWrapper__LcCPA styles_show__HUXRb styles_reviewCard__9HxJJ
      const content =
        item.childNodes[0].childNodes[0].childNodes[2].childNodes[1]
          .childNodes[1];
      const date = item.childNodes[0].childNodes[0].childNodes[2].childNodes[1]
        .childNodes[2];
      reviews.push({ content: content.textContent, date: date.textContent });
    } else if (s.startsWith("styles_pagination_")) { // -> styles_pagination__6VmQv
      // console.log("found nav");
      const inner = item.childNodes[0];
      if (inner.childNodes.length > 1) {
        const lastPageDiv = inner.childNodes[inner.childNodes.length - 2];
        lastPage = +lastPageDiv.textContent;
        // console.log("found last page", lastPage);
      }
    }
  }

  // write to file -> easier to handle retry on crash for debug
  await Deno.writeTextFile(
    `result/${page}.json`,
    JSON.stringify({ reviews, lastPage }),
  );
  console.log('did page:', page);
  return {
    reviews,
    lastPage,
  };
}

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

// const startPage = Deno.args();
// const url = Deno.args();

const baseUrl = "https://fr.trustpilot.com/review/www.laposte.fr";

const page1 = await doOnePage(baseUrl, 1);

for (let i = 2; i < page1.lastPage; i++) {
  await doOnePage(baseUrl, i);
  await sleep(1);
}
