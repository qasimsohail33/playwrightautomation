
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

// Generate a future date for event creation
function futureDateValue() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(12, 0, 0, 0);

    const pad = (value) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Extract available seats from event card
async function getAvailableSeats(card) {
    const seatText = await card.getByText(/\d+\s+seats?/i).first().innerText();
    const match = seatText.match(/\d+/);

    if (!match) {
        throw new Error(`Unable to extract seat count: ${seatText}`);
    }

    return Number(match[0]);
}

test('Register, create event, book ticket and verify seat reduction', async ({ page }) => {

    // Generate unique test data
    const timestamp = Date.now();
    const eventTitle = `Test Event ${timestamp}`;
    const userEmail = `qasnovia${timestamp}@gmail.com`;
    const customerEmail = `customer${timestamp}@gmail.com`;

    const eventPrice = '100';
    const totalSeats = 50;

    let seatsBeforeBooking;
    let seatsAfterBooking;
    let bookingRef;

    // STEP 1: REGISTER NEW ACCOUNT

    await page.goto(`${BASE_URL}/login`);

    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByTestId('register-email').fill(userEmail);
    await page.getByTestId('register-password').fill('Test@123');

    await page.getByRole('textbox', {
        name: 'Repeat your password'
    }).fill('Test@123');

    await page.getByTestId('register-btn').click();

    // Verify registration success
    await expect(
        page.getByRole('main')
    ).toContainText('Browse Events →');


    // STEP 2: CREATE A NEW EVENT

    await page.goto(`${BASE_URL}/admin/events`);

    await page.locator('#event-title-input').fill(eventTitle);

    await page.locator('#admin-event-form textarea')
        .fill('New description for automated testing');

    await page.getByLabel('City').fill('Lahore');
    await page.getByLabel('Venue').fill('C Block');

    await page.getByLabel('Event Date & Time')
        .fill(futureDateValue());

    await page.getByLabel('Price ($)').fill(eventPrice);
    await page.getByLabel('Total Seats').fill(String(totalSeats));

    await page.locator('#add-event-btn').click();

    // Verify event creation toast
    await expect(
        page.getByText('Event created!', { exact: true })
    ).toBeVisible();


    // STEP 3: FIND EVENT CARD AND CAPTURE INITIAL SEATS

    await page.goto(`${BASE_URL}/events`);

    const eventCards = page.getByTestId('event-card');

    // Verify first event card is visible
    await expect(eventCards.first()).toBeVisible();

    // Find the newly created event
    const eventCard = eventCards.filter({
        hasText: eventTitle
    });

    await expect(eventCard).toBeVisible({ timeout: 5000 });

    // Capture available seats before booking
    seatsBeforeBooking = await getAvailableSeats(eventCard);

    console.log('Seats before booking:', seatsBeforeBooking);


    // STEP 4: START BOOKING

    await eventCard.getByTestId('book-now-btn').click();


    // STEP 5: VERIFY DEFAULT QUANTITY AND FILL BOOKING FORM

    const ticketCount = page.locator('#ticket-count');

    // Default quantity should be 1
    await expect(ticketCount).toHaveText('1');

    await page.getByLabel('Full Name').fill('Qasim');

    await page.locator('#customer-email').fill(customerEmail);

    await page.getByPlaceholder('+91 98765 43210')
        .fill('+91512345678');

    await page.locator('.confirm-booking-btn').click();


    // STEP 6: VERIFY BOOKING CONFIRMATION

    const bookingReference = page.locator('.booking-ref').first();

    await expect(bookingReference).toBeVisible();

    bookingRef = (await bookingReference.innerText()).trim();

    expect(bookingRef).not.toBe('');

    console.log('Booking Reference:', bookingRef);


    // STEP 7: VERIFY BOOKING IN MY BOOKINGS

    await page.getByRole('link', { name: 'View My Bookings' }).click();

    // Verify bookings URL
    await expect(page).toHaveURL(`${BASE_URL}/bookings`);

    const bookingCards = page.locator('#booking-card');

    // Verify first booking card is visible
    await expect(bookingCards.first()).toBeVisible();

    // Find booking containing our reference
    const myBooking = bookingCards.filter({
        has: page.locator('.booking-ref', {
            hasText: bookingRef
        })
    });

    await expect(myBooking).toBeVisible();

    // Verify correct event is associated with booking
    await expect(myBooking).toContainText(eventTitle);


    // STEP 8: VERIFY SEAT REDUCTION

    await page.goto(`${BASE_URL}/events`);

    const updatedEventCards = page.getByTestId('event-card');

    // Verify first event card is visible
    await expect(updatedEventCards.first()).toBeVisible();

    // Find our event again
    const updatedEventCard = updatedEventCards.filter({
        hasText: eventTitle
    });

    await expect(updatedEventCard).toBeVisible();

    // Capture seats after booking
    seatsAfterBooking = await getAvailableSeats(updatedEventCard);

    console.log('Seats before booking:', seatsBeforeBooking);
    console.log('Seats after booking:', seatsAfterBooking);

    // Verify exactly one seat was deducted
    expect(seatsAfterBooking).toBe(seatsBeforeBooking - 1);

});
