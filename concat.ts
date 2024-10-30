import { writeCSV } from "jsr:@vslinko/csv";


let debug = false;

async function getFilenames() {
    const filenames = [];

    if (debug) {
        filenames.push("res1.json");
    }
    for await (const dirEntry of Deno.readDir("result")) {
        const name = dirEntry.name;
        if (!name.endsWith('.json')) {
            continue;
        }
        filenames.push("result/" + dirEntry.name);
    }

    return filenames;
}




const f = await Deno.open("./result.csv", {
    write: true,
    create: true,
    truncate: true,
});

const rows = [
    ["content", "date"],
];

for (const file of await getFilenames()) {
    const content = JSON.parse(await Deno.readTextFile(file));
    for (const line of content["reviews"]) {
        rows.push([line.content, line.date]);
    }
}


await writeCSV(f, rows);

f.close();