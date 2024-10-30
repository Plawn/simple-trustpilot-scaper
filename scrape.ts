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
  const res = await fetch(url);
  const text = await res.text();

  // for debug
  // const text = await load();

  // TOOD: parse
  const doc = new DOMParser().parseFromString(text, "text/html")!;
  let lastPage = 1;
  const reviews: Review[] = [];
  // TODO: use xpath instead
  // *[@id="__next"]/div/div/main/div/div[4]/section
  // /html/body/div[1]/div/div/main/div/div[4]/section
  const p = doc.querySelector(
    "#__next > div > div > main > div",
  )!.childNodes[4].childNodes[1];

  // await Deno.writeTextFile("page.html", text);
  // return;
  for (const item of p.childNodes) {
    const s = item.className;
    if (s.startsWith("styles_cardWrapper_")) { // handle review -> styles_cardWrapper__LcCPA styles_show__HUXRb styles_reviewCard__9HxJJ
      const content =
        item.childNodes[0].childNodes[0].childNodes[2].childNodes[1]
          .childNodes[1];
      let date: string = "";
      try {
        date = item.childNodes[0].childNodes[0].childNodes[2].childNodes[1]
          .childNodes[2].textContent;
      } catch (e) {
        console.error("failed to handle date");
        console.error(e);
      }

      reviews.push({ content: content.textContent, date });
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

const startPage = Number(Deno.args[1]) || 1;
const count = Number(Deno.args[2]) || -1;
const url = Deno.args[0];

// const baseUrl = "https://fr.trustpilot.com/review/www.laposte.fr";
console.log('doing', url);
console.log('start page', startPage);


let currentCount = 0;
const page1 = await doOnePage(url, startPage);

for (let i = startPage + 1; i < page1.lastPage; i++) {
  const { reviews } = await doOnePage(url, i);
  currentCount += reviews.length;
  console.log('did ', currentCount);
  if (count !== 1) {
    if (currentCount >= count) {
      console.log('done, stopping');
      break;
    }
  }
  await sleep(5);
}
