const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

export const getMonthNumber = (month) => (months.indexOf(month) + 1);

export const getMonthName = (monthIndex) => months[monthIndex - 1];

export const validateDate = (date) => {
    const [month, day, year] = date.split('/');

    const result = new Date(year, (+month - 1), day);

    const isValidDate = (Boolean(+result) && (result.getDate() === Number(day)));

    return isValidDate;
}
