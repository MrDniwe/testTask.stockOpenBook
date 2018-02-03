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

module.exports = {
  openBookCross
};
