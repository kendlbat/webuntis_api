/*

The api calls were reverse-engineered from the WebUntis Api Wrapper by SchoolUtils (https://github.com/SchoolUtils/WebUntis)
I am not in any way affiliated with Untis GmbH.

(c) Tobias Kendlbacher 2022 - MIT License

*/

const secrets = require("./secrets");
const fs = require("fs");


/**
* @param {string} school
* @param {string} username
* @param {string} password
* @param {string} baseurl
*/
async function login(school, username, password, baseurl) {
    const url = `${baseurl}/WebUntis/jsonrpc_intern.do?m=getUserData2017&school=${school}&v=i2.2`;

    console.log(`${baseurl}/WebUntis/jsonrpc_intern.do?m=getUserData2017&school=${school}&v=i2.2`);

    let response = await fetch(baseurl + "/WebUntis/jsonrpc.do?school=" + school, {
        "credentials": "include",
        method: "POST",
        "body": JSON.stringify({
            "id": "ident",
            "method": "authenticate",
            "params": {
                "user": username,
                "password": password,
                "client": "ident"
            },
            "jsonrpc": "2.0"
        })
    });

    let res = await response.json()

    console.log(res);

    if (response.data && response.data.error)
        throw new Error(response.data.error.message);


    // Convert the response headers from an unusable string worm to a dict
    let rheaders = response.headers
        .get("set-cookie")
        .split(";")
        .reduce((prev, curr) => {
            let kv = curr
                .trim()
                .split("=");
            prev[kv[0]] = kv[1] || undefined;
            return prev;
        }, {});

    console.log(rheaders);


    let cookies = [];
    cookies.push('JSESSIONID=' + rheaders.JSESSIONID);
    cookies.push('schoolname=\"_' + Buffer.from(school).toString("base64") + "\"");
    cookietext = cookies.join(";");

    console.log(cookietext);

    const config = await (await fetch(`${baseurl}/WebUntis/api/app/config`, { headers: { cookie: cookietext } })).json();

    // write variable to file
    fs.writeFileSync("untis.json", JSON.stringify(config, null, 4));
}

login(secrets.UNTIS_SCHOOL, secrets.UNTIS_USER, secrets.UNTIS_PASSWORD, secrets.UNTIS_URL);
