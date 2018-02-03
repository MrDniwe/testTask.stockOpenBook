function openBookCross(asks, bids) {
  //проверка на тип атрибутов
  if (!(asks instanceof Array && bids instanceof Array))
    throw new TypeError("Переданый атрибуты неподходящего типа");
  //проверка на состав атрибутов
  if (!(asks.length && bids.length)) return [];
  //проверка на формат элементов
  if (!(asks.every(assertFormat) && bids.every(assertFormat)))
    throw new TypeError("Неверный формат одного из элементов массива");
}

function assertFormat(incoming) {
  return (
    incoming &&
    incoming.amount &&
    incoming.amount instanceof Number &&
    incoming.rate &&
    incoming.rate instanceof Number
  );
}

module.exports = {
  openBookCross
};
