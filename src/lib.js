function openBookCross(asks, bids) {
  //проверка на тип атрибутов
  if (!(asks instanceof Array && bids instanceof Array))
    throw new TypeError("Переданый атрибуты неподходящего типа");

  //проверка на состав атрибутов
  if (!(asks.length && bids.length)) return [];

  //проверка на формат элементов
  if (!(asks.every(assertFormat) && bids.every(assertFormat)))
    throw new TypeError("Неверный формат одного из элементов массива");

  //отсортируем массивы на всякий случай
  asks = asks.sort((a, b) => a.rate - b.rate);
  bids = bids.sort((a, b) => a.rate - b.rate).reverse();
}

function assertFormat(incoming) {
  return (
    incoming &&
    incoming.amount &&
    typeof incoming.amount === "number" &&
    incoming.rate &&
    typeof incoming.rate === "number"
  );
}

function proceedTransaction(bid, ask) {
  if (ask.rate > bid.rate) return { bid, ask, transaction: null };
  let [min, max] = [Math.min(ask.rate, bid.rate), Math.max(ask.rate, bid.rate)];
  let transaction = {
    amount: Math.min(ask.amount, bid.amount),
    percent: 100 * (max - min) / min
  };
  return {
    bid:
      bid.amount - transaction.amount
        ? { amount: bid.amount - transaction.amount, rate: bid.rate }
        : null,
    ask:
      ask.amount - transaction.amount
        ? { amount: ask.amount - transaction.amount, rate: ask.rate }
        : null,
    transaction
  };
}

module.exports = {
  openBookCross,
  proceedTransaction
};
