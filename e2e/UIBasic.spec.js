
const { test, expect } = require('@playwright/test');
test('UI Basics Test', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
    await expect(page).toHaveTitle('LoginPage Practise | Rahul Shetty Academy');
    const username = page.locator('#username');
    const password = page.locator("#password");
    const signInBtn = page.locator('#signInBtn');
    const errorMessage = page.locator("[style*='block;']");
    await username.fill('qasnovia');
    await password.fill('123456');
    await signInBtn.click();
    await expect(errorMessage).toContainText('Incorrect');
    console.log(await errorMessage.textContent());
    await username.fill('rahulshettyacademy');
    await password.fill('Learning@830$3mK2');
    await signInBtn.click();
console.log(await page.locator('.card-body a').nth(1).textContent());
console.log(await page.locator('.card-body a').first().textContent());








});
