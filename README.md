# WebUntis API
> A small project for API calls to WebUntis  
  
This project aims to get data from the WebUntis API.  
<br><br>

### Contributing
If you want to contribute to this project, please provide your own secrets.js (only on your local machine) in `secrets.js`:  
```js
const secrets = {
    UNTIS_SCHOOL: "school_name",
    UNTIS_URL: "https://server.webuntis.com",
    UNTIS_USER: "username",
    UNTIS_PASSWORD: "Pa$$word"
};

module.exports = secrets;
```  
<br><br>
Please note that I am in no way affiliated with Untis GmbH.  
I hold no responsibility for misuse of this project.[^mitlicense]

[^mitlicense]: As specified in the `MIT License`
