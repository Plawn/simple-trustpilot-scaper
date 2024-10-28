import { writeCSV } from "jsr:@vslinko/csv";


const filenames = ["res1.json"];


const f = await Deno.open("./result.csv", {
    write: true,
    create: true,
    truncate: true,
});

const rows = [
    ["content", "date"],
];

for (const file of filenames) {
    const content = JSON.parse(await Deno.readTextFile(file));
    for (const line of content["reviews"]) {
        rows.push([line.content, line.date]);
    }
}


await writeCSV(f, rows);

f.close();