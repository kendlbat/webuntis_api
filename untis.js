const crypto = require("crypto");
const secrets = require("./secrets");

function intToBytes(num) {
	var bytes = [];

	for(var i=7 ; i>=0 ; --i) {
		bytes[i] = num & (255);
		num = num >> 8;
	}

	return bytes;
}

function hexToBytes(hex) {
	var bytes = [];
	for(var c = 0, C = hex.length; c < C; c += 2) {
		bytes.push(parseInt(hex.substr(c, 2), 16));
	}
	return bytes;
}

async function generateTOTP(secret, epoch = Date.now(), step = 30) {
    let counter = Math.floor(epoch / step / 1000);

    var p = 6;
    var b = intToBytes(counter);

    var hmac = crypto.createHmac('sha1', Buffer.from(secret));

    var digest = hmac.update(Buffer.from(b)).digest('hex');

    var h = hexToBytes(digest);

    // Truncate
    var offset = h[19] & 0xf;
    var v = (h[offset] & 0x7f) << 24 |
        (h[offset + 1] & 0xff) << 16 |
        (h[offset + 2] & 0xff) << 8 |
        (h[offset + 3] & 0xff);

    v = (v % 1000000) + '';

    return Array(7 - v.length).join('0') + v;

}

let loginInformation = null;
/**
* @param {string} school
* @param {string} username
* @param {string} secret
* @param {string} baseurl
*/
async function login(school, username, secret, baseurl) {
    const token = await generateTOTP(secret);
    const time = new Date().getTime();

    const url = `${baseurl}/WebUntis/jsonrpc_intern.do?m=getUserData2017&school=${school}&v=i2.2`;

    console.log(`${baseurl}/WebUntis/jsonrpc_intern.do?m=getUserData2017&school=${school}&v=i2.2`);

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            id: 'identification',
            method: 'getUserData2017',
            params: [
                {
                    auth: {
                        clientTime: time,
                        user: username,
                        otp: token,
                    },
                },
            ],
            jsonrpc: '2.0',
        }),
        credentials: "include"
    });

    let res = await response.json()

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

    
    const config = await (await fetch(`${baseurl}/WebUntis/api/daytimetable/config`, { headers: { cookie: cookietext }})).text();
    console.log(config);
    let untis;
    eval(config.match(/untis[^.]= \{.+?\};/gs)[0]);
    console.log(untis);
}

login(secrets.UNTIS_SCHOOL, secrets.UNTIS_USER, secrets.UNTIS_SECRET, secrets.UNTIS_URL);

/* require('dotenv').config();

const untis = new WebUntisSecretAuth(process.env.UNTIS_SCHOOL, process.env.UNTIS_USER, process.env.UNTIS_SECRET, process.env.UNTIS_URL, 'nope', Authenticator);

async function main() {
    await untis.login();
    //const classes = await untis.getExamsForRange(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 2)));
    const student = await untis.getTimegrid();
    console.log(JSON.stringify(student, null, 2))



    await untis.logout();
}

main(); */