
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
     * Combines two numbers with leading zeros.
     * 
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
}