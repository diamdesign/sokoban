export const formatElapsedTime = (timeInMillis: number): string => {
    const days = Math.floor(timeInMillis / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeInMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeInMillis % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeInMillis % (1000 * 60)) / 1000);
    const milliseconds = String(timeInMillis % 1000).padStart(3, '0'); // Ensure 3 digits

    // Build the formatted time string
    let formattedTime = '';

    if (days > 0) {
        formattedTime += `${days}:`;
    }
    if (hours > 0 || formattedTime !== '') {
        formattedTime += `${hours}:`;
    }
    if (minutes > 0 || formattedTime !== '') {
        formattedTime += `${minutes}:`;
    }

    formattedTime += `${seconds}:${milliseconds}`;

    return formattedTime;
};

export function formatMilliseconds(milliseconds: number) {
    // Calculate days, hours, minutes, seconds, and milliseconds
    let days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    let hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    let ms = milliseconds % 1000;

    // Ensure milliseconds are always displayed as three digits
    let formattedMilliseconds = ms.toString().padStart(3, '0');

    // Create an object to store the formatted time components
    let formattedTime = {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        milliseconds: parseInt(formattedMilliseconds),
    };

    return formattedTime;
}
