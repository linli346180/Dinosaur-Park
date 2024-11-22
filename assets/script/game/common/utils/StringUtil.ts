
export class StringUtil {
    /**
     * Formats a given value as money with specified decimal places.
     * 
     * @param value - 金币数
     * @param decimalPlaces - 小数点
     * @returns 
     */
    static formatMoney(value: number, decimalPlaces: number = 1): string {
        if (value >= 1_000_000_000) {
            return (Math.floor(value / 1_000_000_000 * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces) + 'B'; // 十亿
        } else if (value >= 1_000_000) {
            return (Math.floor(value / 1_000_000 * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces) + 'M'; // 百万
        } else if (value >= 1_000) {
            return (Math.floor(value / 1_000 * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces) + 'K'; // 千
        } else {
            return Math.floor(value).toString();
        }
    }


    /**
     * 合并两个数字，并在前面添加0 比如:101
     *  * 
     * @param first - The first number.
     * @param second - The second number.
     * @param zeroCount - The number of leading zeros to add.
     * @returns The combined number with leading zeros.
     */
    static combineNumbers(first: number, second: number, zeroCount: number): number {
        const secondLength = second.toString().length;
        const adjustedZeroCount = Math.max(zeroCount - secondLength, 0);
        const zeros = '0'.repeat(adjustedZeroCount);
        const combinedString = `${first}${zeros}${second}`;
        const combinedNumber = parseInt(combinedString, 10);
        return combinedNumber;
    }

    /**
     * Formats a given timestamp as a string.
     * 输出个时间格式 2024-01-01 00:00:00
     * @param timestamp - The timestamp to format.
     * @returns The formatted timestamp string.
     */
    static formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = this.padZero(date.getMonth() + 1);
        const day = this.padZero(date.getDate());
        const hours = this.padZero(date.getHours());
        const minutes = this.padZero(date.getMinutes());
        const seconds = this.padZero(date.getSeconds());
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    static padZero(num: number): string {
        return num < 10 ? `0${num}` : num.toString();
    }


    static formatDateToCustomFormat(date: Date): string {
        const pad = (num: number, size: number = 2) => String(num).padStart(size, "0");
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const milliseconds = pad(date.getMilliseconds(), 3);
        const timezoneOffset = -date.getTimezoneOffset(); // Minutes offset
        const sign = timezoneOffset >= 0 ? "+" : "-";
        const absOffset = Math.abs(timezoneOffset);
        const timezone = `${sign}${pad(Math.floor(absOffset / 60))}${pad(absOffset % 60)}`;
      
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}${timezone}`;
      }
}