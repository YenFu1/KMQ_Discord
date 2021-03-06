const request = require("request-promise")
const fs = require("fs")
const mkdirp = require("mkdirp")
const { execSync } = require("child_process");
const unzipper = require("unzipper")
const mysql = require("promise-mysql");
const config = require("../config.json");
const rmfr = require('rmfr');
const fileUrl = "http://kpop.aoimirai.net/download.php";

//TODO: this is probably not how you use promises fix later

let options = {
    url: fileUrl,
    encoding: null,
    headers: {
        "Host": "kpop.aoimirai.net",
        "User-Agent": "PostmanRuntime/7.22.0"
    }
}
const kmqTempDir = "/tmp/kmq";

let main = async function () {
    await rmfr(kmqTempDir);
    await mkdirp(kmqTempDir);
    await mkdirp(`${kmqTempDir}/sql`)
    const output = `${kmqTempDir}/bootstrap.zip`
    db = await mysql.createConnection({
        host: "localhost",
        user: config.dbUser,
        password: config.dbPassword
    });

    request(options)
        .then((resp, body) => {
            return new Promise((resolve, reject) => {
                fs.writeFile(output, resp, function (err) {
                    console.log("Downloaded database.zip");
                    resolve();
                });
            })
        })
        .then(() => {
            return new Promise((resolve, reject) => {
                fs.createReadStream(`${kmqTempDir}/bootstrap.zip`)
                    .pipe(unzipper.Extract({ path: `${kmqTempDir}/sql/` }))
                    .on("error", (err) => {
                        // this throws an error even though it finished successfully
                        if (!err.toString().includes("invalid signature")) {
                            reject(err);
                        }
                        console.log("Extracted database.zip");
                        resolve();
                    })
                    .on("finish", () => resolve())
            })
        })
        .then(async () => {
            return new Promise((resolve, reject) => {
                fs.readdir(`${kmqTempDir}/sql`, async (err, files) => {
                    console.log("Dropping K-Pop video database");
                    await db.query("DROP DATABASE IF EXISTS kpop_videos;");
                    console.log("Creating K-Pop video database")
                    await db.query("CREATE DATABASE kpop_videos;");
                    console.log("Seeding K-Pop video database");
                    execSync(`mysql kpop_videos < ${kmqTempDir}/sql/${files[0]}`)
                    console.log(`Imported database dump (${files[0]}) successfully`);
                    console.log("Creating KMQ database");
                    await db.query("CREATE DATABASE IF NOT EXISTS kmq");
                    //this is awful but idk why it won't end
                    process.exit();
                })
            })
        })
        .catch(e => console.log(e))
};

main()
