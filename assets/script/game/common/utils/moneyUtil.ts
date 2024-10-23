export class moneyUtil {
    
    static formatMoney(value: number,decimalPlaces:number = 0 ): string {
        if (value >= 1_000_000_000) {
            return (value / 1_000_000_000).toFixed(decimalPlaces) + 'B'; // 十亿
        } else if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(decimalPlaces) + 'M'; // 百万
        } else if (value >= 1_000) {
            return (value / 1_000).toFixed(decimalPlaces) + 'K'; // 千
        } else {
            return value.toString();
        }
    }

     /** 将两个数字组合成一个新的数字 */
    static combineNumbers(first: number, second: number, zeroCount: number): number {
        const secondLength = second.toString().length;
        const adjustedZeroCount = Math.max(zeroCount - secondLength, 0);
        const zeros = '0'.repeat(adjustedZeroCount);
        const combinedString = `${first}${zeros}${second}`;
        const combinedNumber = parseInt(combinedString, 10);
        return combinedNumber;
    }
}