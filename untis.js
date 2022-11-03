const { WebUntisSecretAuth } = require('webuntis');
const Authenticator = require('otplib').authenticator;

require('dotenv').config();

const untis = new WebUntisSecretAuth(process.env.UNTIS_SCHOOL, process.env.UNTIS_USER, process.env.UNTIS_SECRET, process.env.UNTIS_URL, 'nope', Authenticator);

async function main() {
    await untis.login();
    const classes = await untis.getExamsForRange(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 2)));
    console.log(classes);

    await untis.logout();
}

main();