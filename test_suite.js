import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { expect, assert } from 'chai';
import chromedriver from 'chromedriver';
import dotenv from 'dotenv';
import { getMonthNumber, validateDate } from './_util/DateUtils';

dotenv.config({ path: '.env' })

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

const chromeOptions = new chrome.Options();

// chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--window-size=720,720');

const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

const { URL, USER_NAME, PASSWORD, DATE } = process.env;

const login = async () => {
    // Populating USER_NAME and PASSWORD
    await driver.findElement(By.xpath("//input[@name='email']")).sendKeys(USER_NAME);
    await driver.findElement(By.xpath("//input[@name='password']")).sendKeys(PASSWORD);

    // Clicking login button
    await driver.findElement(By.xpath("//button[@name='login']")).click();
};

const openDatePicker = async () => {
    // Wait for home page to load and clicking on 'accounts'
    await driver.wait(until.elementLocated(By.xpath("//a[@href='/accounts']"))).click();

    // Wait for accounts to load and click on 'Add account(+)'
    await driver.wait(until.elementLocated(By.xpath("//*[@name='addAccount']"))).click();

    // Click on input 'Start Date' 
    await driver.wait(until.elementLocated(By.xpath("//input[@id='accountStartDate']"))).click();
};

const getCurrentMonthYear = async () => {
    const currentMonthYear = await driver.findElement(By.xpath("//div[contains(@class, 'react-datepicker__current-month')]")).getText();
    const currentYear = currentMonthYear.split(' ')[1];
    const currentMonth = currentMonthYear.split(' ')[0];

    return [currentMonth, currentYear];
};

const getCalenderActions = async () => {
    const previousBtn = await driver.findElement(By.xpath("//button[contains(@class, 'react-datepicker__navigation--previous')]"));
    const nextBtn = await driver.findElement(By.xpath("//button[contains(@class, 'react-datepicker__navigation--next')]"));

    return [previousBtn, nextBtn];
};

const goToMonthYear = async (diff, actionButton) => {
    Array.from({ length: Math.abs(diff) }, () => {
        actionButton.click();
    })
};

const selectYear = async (year) => {
    const [previousBtn, nextBtn] = await getCalenderActions();
    const [currentMonth, currentYear] = await getCurrentMonthYear();
    const currentMonthIndex = getMonthNumber(currentMonth.trim());

    const yearDiff = year - currentYear;

    const actionButton = (yearDiff > 0) ? nextBtn : previousBtn;

    const lastYearMonthDiff = (yearDiff > 0) ? (12 - currentMonthIndex) : currentMonthIndex;

    // Offset used to move to first month in an year.
    const monthOffset = 11;

    const monthDiff = ((Math.abs(yearDiff) - 1) * 12) + lastYearMonthDiff;

    const diff = monthDiff + monthOffset;

    // Loop for moving to selected year.
    await goToMonthYear(diff, actionButton);
};

const selectMonth = async (monthIndex) => {
    const [previousBtn, nextBtn] = await getCalenderActions();
    const [currentMonth] = await getCurrentMonthYear();
    const currentMonthIndex = getMonthNumber(currentMonth.trim());

    const monthDiff = monthIndex - currentMonthIndex;

    const actionButton = (monthDiff > 0) ? nextBtn : previousBtn;

    // Loop for moving to selected month
    await goToMonthYear(monthDiff, actionButton);
};

const selectDay = async (day) => {
    // Removing 0 padding in left
    day = Number(day).toString();

    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class, 'react-datepicker__day') and text()='${day}']`)));
    const selectedDate = await driver.findElement(By.xpath(`//div[contains(@class, 'react-datepicker__day') and text()='${day}']`));

    selectedDate.click();
};

const getDateInInput = async () => {
    return await driver.findElement(By.xpath("//input[@id='accountStartDate']")).getAttribute('value');
};

describe('Test accounts page', function () {

    before(async () => {
        await driver.get(URL);

        // Wait for page to load.
        await driver.wait(until.elementLocated(By.id('email')));

        await login();
    });

    after(async () => {
        await driver.quit();
    });

    it('Test date picker', async () => {

        assert.isOk(validateDate(DATE), '!!! INVALID DATE !!!');

        // Open 'Start Date' date picker in 'Accounts' page.
        await openDatePicker();

        const [month, day, year] = DATE.split('/');

        await selectYear(year);

        await selectMonth(month);

        await selectDay(day);

        const dateInInput = await getDateInInput();

        expect(dateInInput).equals(DATE);

        await driver.sleep(2000);
    });

});