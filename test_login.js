const url = "http://localhost:54321/auth/v1/token?grant_type=password";
const headers = {
    "apikey": "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
    "Content-Type": "application/json"
};
const data = {
    "email": "admin@kapeuno.com",
    "password": "password"
};

fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
})
.then(response => {
    console.log(`Status Code: ${response.status}`);
    return response.text().then(text => ({status: response.status, text}));
})
.then(({status, text}) => {
    if (status !== 200) {
        console.log(text);
    } else {
        console.log("Login successful.");
        const resp_data = JSON.parse(text);
        console.log("Access Token length:", resp_data.access_token ? resp_data.access_token.length : 0);
    }
})
.catch(e => console.log("Request failed:", e));
