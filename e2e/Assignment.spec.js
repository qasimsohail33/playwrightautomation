
const { test, expect } = require('@playwright/test');

const url = 'https://rahulshettyacademy.com/client/#/auth/login';

// TEST 1: Register using the link (Expected FAIL)
test('Register link should create an account', async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveTitle("Let's Shop");

    await page.locator('.login-wrapper-footer-text a').click();

    await page.locator('#firstName').fill('Muhammad');
    await page.locator('#lastName').fill('Qasim');
    await page.locator('#userEmail').fill(`qasimlink${Date.now()}@gmail.com`);
    await page.locator('#userMobile').fill('1234567890');
    await page.locator('[formcontrolname="occupation"]').selectOption('Engineer');
    await page.locator('[formcontrolname="gender"]').nth(0).click();
    await page.locator('#userPassword').fill('Test@123');
    await page.locator('#confirmPassword').fill('Test@123');
    await page.locator('[formcontrolname="required"]').click();

    await page.locator('a[routerlink="/auth/register"]').click();

    // Hover card validation
    const cards = page.locator('.card');
    console.log('Total cards:', await cards.count());

    for (let i = 1; i < await cards.count() - 1; i++) {
        const card = cards.nth(i);
        await card.hover();
        await expect(card).toHaveCSS('background-color', 'rgb(150, 22, 31)');
    }

    // Expected: Account should be created
    await expect(page.getByText('Account Created Successfully')).toBeVisible();
});


// TEST 2: Email link validation (Expected FAIL)
test('Email link should use the correct mailto protocol', async ({ page }) => {
    await page.goto(url);
    await page.locator('.login-wrapper-footer-text a').click();

    const emailLink = page.locator('a[href*="dummywebsite@rahulshettyacademy.com"]');

    await expect(emailLink).toBeVisible();
    await expect(emailLink).toContainText('dummywebsite@rahulshettyacademy.com');
    await expect(emailLink).toHaveAttribute(
        'href',
        'mailto:dummywebsite@rahulshettyacademy.com'
    );
});


// TEST 3: Social media links validation (Expected FAIL)
test('Social media links should have valid URLs', async ({ page }) => {
    await page.goto(url);

    const facebook = page.locator('a:has(i.fa-facebook)');
    const instagram = page.locator('a:has(i.fa-instagram)');
    const twitter = page.locator('a:has(i.fa-twitter)');
    const youtube = page.locator('a:has(i.fa-youtube)');

    await expect(facebook).toHaveAttribute('href', /^https?:\/\/.+/);
    await expect(instagram).toHaveAttribute('href', /^https?:\/\/.+/);
    await expect(twitter).toHaveAttribute('href', /^https?:\/\/.+/);
    await expect(youtube).toHaveAttribute('href', /^https?:\/\/.+/);
});


// TEST 4: Register using the submit button (Expected PASS)

test('Register button should create an account', async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveTitle("Let's Shop");

    // Registration
    await page.locator('.login-wrapper-footer-text a').click();

    await page.locator('#firstName').fill('Muhammad');
    await page.locator('#lastName').fill('Qasim');

    const uniqueEmail = `qasimbutton${Date.now()}@gmail.com`;
    const password = 'Test@123';

    await page.locator('#userEmail').fill(uniqueEmail);
    await page.locator('#userMobile').fill('1234567890');
    await page.locator('[formcontrolname="occupation"]').selectOption('Engineer');
    await page.locator('[formcontrolname="gender"]').nth(0).click();
    await page.locator('#userPassword').fill(password);
    await page.locator('#confirmPassword').fill(password);
    await page.locator('[formcontrolname="required"]').click();

    await page.locator('input[type="submit"][value="Register"]').click();

    await expect(page.getByText('Account Created Successfully')).toBeVisible();

    // Login
    await page.locator("text=Login").click();
    await page.locator('#userEmail').fill(uniqueEmail);
    await page.locator('#userPassword').fill(password);
    await page.locator('#login').click();

    // Add first product to cart
    const card = page.locator('.card-body').first();

    console.log(await card.textContent());

    await card.locator("text=Add To Cart").click();

    // Verify product added notification
    const toast = page.locator("#toast-container");

    await expect(toast).toContainText("Product Added To Cart");
    console.log(await toast.textContent());

    // Navigate to cart and checkout
    await page.locator("button[routerlink='/dashboard/cart']").click();
    await page.locator("button:has-text('Checkout')").click();

    // Payment details
    await page.locator('input[value="4542 9931 9292 2293"]').fill('4242424242424242');

    await page.locator('.field.small')
        .filter({ hasText: 'CVV Code' })
        .locator('input')
        .fill('123');

    await page.locator('.field')
        .filter({ hasText: 'Name on Card' })
        .locator('input')
        .fill('Muhammad Qasim');

    // Verify shipping information validation
    await page.locator(".actions .action__submit").click();

    const toast2 = page.locator("#toast-container");

    await expect(toast2).toContainText("Please Enter Full Shipping Information");
    console.log(await toast2.textContent());

    // Select country using sequential typing
    const country = page.locator("input[placeholder='Select Country']");

    await country.pressSequentially('pakistan', { delay: 100 });

    const results = page.locator(".ta-results");

    await expect(results).toBeVisible();

    const pakistanOption = results.getByRole('button', {
        name: 'Pakistan',
    });

    await expect(pakistanOption).toBeVisible();
    await pakistanOption.click();

    // await expect(country).toHaveValue('Pakistan');

    // Place order
    await page.locator(".actions .action__submit").click();

});
