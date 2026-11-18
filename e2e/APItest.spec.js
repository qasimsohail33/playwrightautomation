const {test, expect, request} = require('@playwright/test');
const APIutils = require('./utils/APIutils');

let token;
let response;
const orderPayload = {orders:[{country:"Cuba",productOrderedId:"6960eae1c941646b7a8b3ed3"}]};

test.beforeAll(async () => {
    const apicontext = await request.newContext();

    const apiUtils = new APIutils(apicontext);

    token = await apiUtils.gettoken();
    response = await apiUtils.createOrder(orderPayload);

});


test('Verify order creation via API', async ({page}) => {

await page.addInitScript(value => {
    window.localStorage.setItem('token', value);
}, token);
    await page.goto("https://rahulshettyacademy.com/client");
    await page.pause();



    // console.log('Token:', token);
    // console.log('Order Response:', response); 


  })
