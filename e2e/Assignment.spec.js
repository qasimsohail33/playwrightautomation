const { test, expect } = require('@playwright/test');

const url = 'https://rahulshettyacademy.com/client/#/auth/login';

// TEST 1: Register using the link (Expected FAIL)
test.only('Register link should create an account', async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveTitle("Let's Shop");

    const registerLink = page.locator('.login-wrapper-footer-text a');
    await registerLink.highlight();
    await registerLink.click();

    const firstName = page.locator('#firstName');
    await firstName.highlight();
    await firstName.fill('Muhammad');

    const lastName = page.locator('#lastName');
    await lastName.highlight();
    await lastName.fill('Qasim');

    const email = page.locator('#userEmail');
    await email.highlight();
    await email.fill(`qasimlink${Date.now()}@gmail.com`);

    const mobile = page.locator('#userMobile');
    await mobile.highlight();
    await mobile.fill('1234567890');

    const occupation = page.locator('[formcontrolname="occupation"]');
    await occupation.highlight();
    await occupation.selectOption('Engineer');

    const gender = page.locator('[formcontrolname="gender"]').nth(0);
    await gender.highlight();
    await gender.click();

    const password = page.locator('#userPassword');
    await password.highlight();
    await password.fill('Test@123');

    const confirmPassword = page.locator('#confirmPassword');
    await confirmPassword.highlight();
    await confirmPassword.fill('Test@123');

    const terms = page.locator('[formcontrolname="required"]');
    await terms.highlight();
    await terms.click();

    const registerButton = page.locator('a[routerlink="/auth/register"]');
    await registerButton.highlight();
await page.waitForTimeout(4000); // Keep highlight visible for 4 seconds
    await registerButton.click();

    // Hover card validation
    const cards = page.locator('.card');
    console.log('Total cards:', await cards.count());

    for (let i = 1; i < await cards.count() - 1; i++) {
        const card = cards.nth(i);
        await card.highlight();
        await card.hover();
        await expect(card).toHaveCSS('background-color', 'rgb(150, 22, 31)');
    }

    const successMessage = page.getByText('Account Created Successfully');
    await successMessage.highlight();
    await expect(successMessage).toBeVisible();
});


// TEST 2: Email link validation (Expected FAIL)
test('Email link should use the correct mailto protocol', async ({ page }) => {
    await page.goto(url);

    const registerLink = page.locator('.login-wrapper-footer-text a');
    await registerLink.highlight();
    await registerLink.click();

    const emailLink = page.locator('a[href*="dummywebsite@rahulshettyacademy.com"]');

    await emailLink.highlight();
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

    const socialLinks = [facebook, instagram, twitter, youtube];

    for (const link of socialLinks) {
        await link.highlight();
        await expect(link).toHaveAttribute('href', /^https?:\/\/.+/);
    }
});


// TEST 4: Register using the submit button (Expected PASS)
test('Register button should create an account', async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveTitle("Let's Shop");

    // Registration
    const registerLink = page.locator('.login-wrapper-footer-text a');
    await registerLink.highlight();
    await registerLink.click();

    const firstName = page.locator('#firstName');
    await firstName.highlight();
    await firstName.fill('Muhammad');

    const lastName = page.locator('#lastName');
    await lastName.highlight();
    await lastName.fill('Qasim');

    const uniqueEmail = `qasimbutton${Date.now()}@gmail.com`;
    const password = 'Test@123';

    const email = page.locator('#userEmail');
    await email.highlight();
    await email.fill(uniqueEmail);

    const mobile = page.locator('#userMobile');
    await mobile.highlight();
    await mobile.fill('1234567890');

    const occupation = page.locator('[formcontrolname="occupation"]');
    await occupation.highlight();
    await occupation.selectOption('Engineer');

    const gender = page.locator('[formcontrolname="gender"]').nth(0);
    await gender.highlight();
    await gender.click();

    const passwordField = page.locator('#userPassword');
    await passwordField.highlight();
    await passwordField.fill(password);

    const confirmPassword = page.locator('#confirmPassword');
    await confirmPassword.highlight();
    await confirmPassword.fill(password);

    const terms = page.locator('[formcontrolname="required"]');
    await terms.highlight();
    await terms.click();

    const submitRegister = page.locator('input[type="submit"][value="Register"]');
    await submitRegister.highlight();
    await submitRegister.click();

    const successMessage = page.getByText('Account Created Successfully');
    await successMessage.highlight();
    await expect(successMessage).toBeVisible();

    // Login
    const loginLink = page.locator('text=Login');
    await loginLink.highlight();
    await loginLink.click();

    const loginEmail = page.locator('#userEmail');
    await loginEmail.highlight();
    await loginEmail.fill(uniqueEmail);

    const loginPassword = page.locator('#userPassword');
    await loginPassword.highlight();
    await loginPassword.fill(password);

    const loginButton = page.locator('#login');
    await loginButton.highlight();
    await loginButton.click();

    // Add first product to cart
    const card = page.locator('.card-body').first();

    await card.highlight();
    console.log(await card.textContent());

    const addToCart = card.locator('text=Add To Cart');
    await addToCart.highlight();
    await addToCart.click();

    // Verify product added notification
    const toast = page.locator('#toast-container');

    await toast.highlight();
    await expect(toast).toContainText('Product Added To Cart');
    console.log(await toast.textContent());

    // Navigate to cart and checkout
    const cartButton = page.locator("button[routerlink='/dashboard/cart']");
    await cartButton.highlight();
    await cartButton.click();

    const checkoutButton = page.locator("button:has-text('Checkout')");
    await checkoutButton.highlight();
    await checkoutButton.click();

    // Payment details
    const cardNumber = page.locator('input[value="4542 9931 9292 2293"]');
    await cardNumber.highlight();
    await cardNumber.fill('4242424242424242');

    const cvv = page.locator('.field.small')
        .filter({ hasText: 'CVV Code' })
        .locator('input');

    await cvv.highlight();
    await cvv.fill('123');

    const cardName = page.locator('.field')
        .filter({ hasText: 'Name on Card' })
        .locator('input');

    await cardName.highlight();
    await cardName.fill('Muhammad Qasim');

    // Verify shipping information validation
    const placeOrder = page.locator('.actions .action__submit');

    await placeOrder.highlight();
    await placeOrder.click();

    const toast2 = page.locator('#toast-container');

    await toast2.highlight();
    await expect(toast2).toContainText('Please Enter Full Shipping Information');
    console.log(await toast2.textContent());

    // Select country using sequential typing
    const country = page.locator("input[placeholder='Select Country']");

    await country.highlight();
    await country.pressSequentially('pakistan', { delay: 100 });

    const results = page.locator('.ta-results');
    await results.highlight();
    await expect(results).toBeVisible();

    const pakistanOption = results.getByRole('button', {
        name: 'Pakistan',
    });

    await pakistanOption.highlight();
    await expect(pakistanOption).toBeVisible();
    await pakistanOption.click();

    // Place order
    await placeOrder.highlight();
    await placeOrder.click();
});
