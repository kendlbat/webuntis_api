/*

The api calls were reverse-engineered from the WebUntis Api Wrapper by SchoolUtils (https://github.com/SchoolUtils/WebUntis)
I am not in any way affiliated with Untis GmbH.

(c) Tobias Kendlbacher 2022 - MIT License

*/

const secrets = require("./secrets");

const untis_id: string | number = "ident";

let logged_in: boolean = false;
let untis_config: object | null;

let session_cookies: string | undefined;

/**
 * 
 * @param {Date} date 
 * @returns {string}
 */
function convertToUntisDate(date: Date): string {
    return (
        date.getFullYear().toString() +
        (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1).toString() +
        (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()).toString()
    );
}

/**
* Will use {@link secrets} as default
* @param {string} school
* @param {string} username
* @param {string} password
* @param {string} baseurl
*/
async function login(school: string = secrets.UNTIS_SCHOOL, username: string = secrets.UNTIS_USER, password: string = secrets.UNTIS_PASSWORD, baseurl: string = secrets.UNTIS_URL) {
    if (logged_in)
        console.warn("Call to login even though already logged in");

    let response: Response = await fetch(baseurl + "/WebUntis/jsonrpc.do?school=" + school, {
        "credentials": "include",
        method: "POST",
        "body": JSON.stringify({
            "id": untis_id,
            "method": "authenticate",
            "params": {
                "user": username,
                "password": password,
                "client": untis_id
            },
            "jsonrpc": "2.0"
        })
    });

    let res = await response.json()

    console.log(res);

    if (res.data && res.data.error)
        throw new Error(res.data.error.message);

    let rheaders: {};

    if (response?.headers != null) {
        rheaders = response.headers
            .get("set-cookie")!
            .split(";")
            .reduce((prev, curr) => {
                let kv = curr
                    .trim()
                    .split("=");
                prev[kv[0]] = kv[1] || undefined;
                return prev;
            }, {});
    } else {
        rheaders = {};
        throw new Error("No response headers");
    }

    // Convert the response headers from an unusable string worm to a dict

    let cookies: string[] = [];
    cookies.push(`JSESSIONID=${rheaders["JSESSIONID"]}`);
    cookies.push('schoolname=\"_' + Buffer.from(school).toString("base64") + "\"");

    session_cookies = cookies.join(";");

    const config: {} = await (await fetch(`${baseurl}/WebUntis/api/app/config`, { headers: { cookie: session_cookies } })).json();

    // write variable to file
    // fs.writeFileSync("config_nogit.json", JSON.stringify(config, null, 4));

    logged_in = true;
    untis_config = config;
}

/**
 * Logs out of the current session
 * @param {string} school The school name to pass to the api
 */
async function logout(school = secrets.UNTIS_SCHOOL, baseurl: string = secrets.UNTIS_URL) {
    if (!logged_in)
        console.warn("Call to logout even though not logged in");

    await fetch(`${baseurl}/WebUntis/jsonrpc.do?school=${school}`, {
        "credentials": "include",
        method: "POST",
        "body": JSON.stringify({
            "id": untis_id,
            "method": "logout",
            "params": {},
            "jsonrpc": "2.0"
        })
    });

    logged_in = false;
    session_cookies = undefined;  // Clear session cookies, as they are no longer valid
}

/**
 * @see {@link https://webuntis.noim.me/classes/WebUntis.html#getExamsForRange getExamsForRange - WebUntis API Docs}
 * 
 * @param {Date} startDate 
 * @param {Date | null} endDate 
 * @param {string} baseurl Defaults to {@link secrets.UNTIS_URL}
 * 
 * @returns {object}
 */
async function getExamsBetween(startDate: Date, endDate: Date | null = null, baseurl: string = secrets.UNTIS_URL, cookies: string | undefined = session_cookies): Promise<object> {
    if (!session_cookies)
        throw new Error("Not logged in");

    return await (
        await fetch(
            encodeURI(
                `${baseurl}/WebUntis/api/exams?startDate=${convertToUntisDate(startDate)}${endDate == null ? "&endDate=" + convertToUntisDate(endDate!) : ""}`
            ),
            {
                headers: {
                    cookie: session_cookies
                }
            }
        )
    ).json();
}

async function main() {
    await login();
    console.log(JSON.stringify(await getExamsBetween(new Date(), new Date(new Date().setMonth(11))), null, 2));
    logout(secrets.UNTIS_SCHOOL);
}

main()