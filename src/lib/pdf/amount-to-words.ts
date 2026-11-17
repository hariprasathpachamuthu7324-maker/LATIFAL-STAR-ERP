/**
 * Converts a numerical amount in AED to official English words.
 * Example: 2500.00 -> "UAE Dirhams Two Thousand Five Hundred Only"
 * Example: 14320.75 -> "UAE Dirhams Fourteen Thousand Three Hundred Twenty and 75/100 Fils Only"
 */
export function numberToWordsAED(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return "UAE Dirhams Zero Only";
  }

  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  const dirhams = Math.floor(absoluteAmount);
  const fils = Math.round((absoluteAmount - dirhams) * 100);

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertGroup(n: number): string {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
    } else if (n > 0) {
      str += units[n];
    }
    return str.trim();
  }

  function convertNumber(num: number): string {
    if (num === 0) return "Zero";

    const billions = Math.floor(num / 1000000000);
    num %= 1000000000;
    const millions = Math.floor(num / 1000000);
    num %= 1000000;
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;

    let result = "";

    if (billions > 0) {
      result += convertGroup(billions) + " Billion ";
    }
    if (millions > 0) {
      result += convertGroup(millions) + " Million ";
    }
    if (thousands > 0) {
      result += convertGroup(thousands) + " Thousand ";
    }
    if (remainder > 0) {
      result += convertGroup(remainder);
    }

    return result.trim();
  }

  const dirhamsInWords = convertNumber(dirhams);
  let words = `UAE Dirhams ${dirhamsInWords}`;

  if (fils > 0) {
    words += ` and ${fils}/100 Fils`;
  }

  words += " Only";

  return isNegative ? `Minus ${words}` : words;
}
