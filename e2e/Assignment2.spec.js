
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

// Your credentials
const EMAIL = 'qasnovia@gmail.com';
const PASSWORD = 'Test@123';
const PHONE = '+91512345678';

// Reusable login helper
async function loginAndGoToBooking(page) {
    await page.goto(`${BASE_URL}/login`);

    await page.getByPlaceholder('you@email.com').fill(EMAIL);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.locator('#login-btn').click();

    await expect(
        page.getByRole('link', { name: 'Browse Events →' })
    ).toBeVisible();
}

// Reusable booking details and refund eligibility validation
async function checkRefundEligibility(page, expectedResult, expectedMessage) {

    // Navigate to My Bookings
    await page.getByRole('link', { name: 'View My Bookings' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/bookings`);

    // Open first booking
    await page.getByRole('link', { name: 'View Details' }).first().click();

    // Verify booking details page
    await expect(
        page.getByText('Booking Information')
    ).toBeVisible();

    // Capture booking reference and event title
    const bookingRef = (await page.locator('span.text-gray-900.font-mono').innerText()).trim();
    const eventTitle = (await page.locator('h1').innerText()).trim();

    console.log('Booking Reference:', bookingRef);
    console.log('Event Title:', eventTitle);

    // Validate booking reference
    expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0));

    // Check refund eligibility
    await page.getByTestId('check-refund-btn').click();

    // Verify spinner appears
const spinner = page.getByRole('status', { name: 'Loading' });
    await expect(spinner).toBeVisible();

    // Verify spinner disappears within 6 seconds
    await expect(spinner).toBeHidden({ timeout: 6000 });

    // Verify refund eligibility result
    const refundResult = page.locator('#refund-result');

    await expect(refundResult).toBeVisible();
    await expect(refundResult).toContainText(expectedResult);
    await expect(refundResult).toContainText(expectedMessage);
}


// TEST 1: Single ticket booking is eligible for refund

test('Single ticket booking should be eligible for refund', async ({ page }) => {

    // STEP 1: LOGIN

    await loginAndGoToBooking(page);


    // STEP 2: BOOK FIRST EVENT WITH 1 TICKET

    await page.goto(`${BASE_URL}/events`);

    const firstEvent = page.getByTestId('event-card').last();

    await expect(firstEvent).toBeVisible();

    await firstEvent.getByTestId('book-now-btn').click();

    // Default quantity should be 1
    await expect(page.locator('#ticket-count')).toHaveText('1');

    // Fill booking form
    await page.getByLabel('Full Name').fill('Qasim');
    await page.locator('#customer-email').fill(EMAIL);

    await page.getByPlaceholder('+91 98765 43210').fill(PHONE);

    await page.locator('.confirm-booking-btn').click();


    // STEP 3–6: VERIFY BOOKING AND REFUND ELIGIBILITY

    await checkRefundEligibility(
        page,
        'Eligible for refund',
        'Single-ticket bookings qualify for a full refund'
    );

});


// TEST 2: Group booking is NOT eligible for refund

test.only('Group booking should not be eligible for refund', async ({ page }) => {

    // STEP 1: LOGIN

    await loginAndGoToBooking(page);


    // STEP 2: BOOK FIRST EVENT WITH 3 TICKETS

    await page.goto(`${BASE_URL}/events`);

    const firstEvent = page.getByTestId('event-card').first();

    await expect(firstEvent).toBeVisible();

    await firstEvent.getByTestId('book-now-btn').click();

    // Increase ticket quantity from 1 to 3
    const incrementButton = page.locator('button:has-text("+")');

    await incrementButton.click();
    await incrementButton.click();

    // Verify selected quantity
    await expect(page.locator('#ticket-count')).toHaveText('3');

    // Fill booking form
    await page.getByLabel('Full Name').fill('Qasim');
    await page.locator('#customer-email').fill(EMAIL);

    await page.getByPlaceholder('+91 98765 43210').fill(PHONE);

    await page.locator('.confirm-booking-btn').click();


    // STEP 3–6: VERIFY BOOKING AND REFUND ELIGIBILITY

    await checkRefundEligibility(
        page,
        'Not eligible for refund',
        'Group bookings (3 tickets) are non-refundable'
    );

});
