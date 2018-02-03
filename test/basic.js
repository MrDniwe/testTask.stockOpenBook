const expect = require("chai").expect;
const lib = require("../src/lib");

const mocks = {
  valid: [
    {
      rate: 100,
      amount: 0.1
    }
  ],
  invalidKey1: [
    {
      rate: 100,
      amount: 0.1
    },
    {
      rates: 100,
      amount: 0.1
    }
  ],
  invalidKey2: [
    {
      rate: 100,
      amount: 0.1
    },
    {
      rate: 100,
      errAmount: 0.1
    }
  ],
  invalidValue1: [
    {
      rate: 100,
      amount: 0.1
    },
    {
      rate: "string",
      amount: 0.1
    }
  ],
  invalidValue2: [
    {
      rate: 100,
      amount: 0.1
    },
    {
      rate: 120,
      amount: true
    }
  ],
  crossInOnePrice: {
    bids: [
      {
        rate: 100,
        amount: 0.1
      },
      {
        rate: 90,
        amount: 0.1
      }
    ],
    asks: [
      {
        rate: 90,
        amount: 0.1
      },
      {
        rate: 100,
        amount: 0.1
      }
    ]
  }
};

describe("Проверим сам факт налиция функции", () => {
  it("то что мы сымпортили - объект", () => {
    expect(lib).to.be.an("object");
  });
  it("и он имеет свойство openBookCross", () => {
    expect(lib).to.have.property("openBookCross");
  });
  it("и это свойство - функция", () => {
    expect(lib.openBookCross).to.be.a("function");
  });
});

describe("Проверяем первичную обработку входящих параметров", () => {
  it("если один из атрибутов отсутствует или не массив, ждем TypeError", () => {
    expect(() => lib.openBookCross()).to.throw(TypeError);
    expect(() => lib.openBookCross(mocks.valid)).to.throw(TypeError);
    expect(() => lib.openBookCross({}, mocks.valid)).to.throw(TypeError);
  });
  it("если один из атрибутов не содержит элементов, возвращаем пустой массив", () => {
    expect(lib.openBookCross(mocks.valid, []))
      .to.be.an("array")
      .and.have.lengthOf(0);
    expect(lib.openBookCross([], mocks.valid))
      .to.be.an("array")
      .and.have.lengthOf(0);
    expect(lib.openBookCross([], []))
      .to.be.an("array")
      .and.have.lengthOf(0);
  });
  it("если среди переданных элементов любого массива хотя бы один не отвечает установленному формату, выбрасывается ошибка TypeError", () => {
    expect(() => lib.openBookCross(mocks.valid, mocks.invalidKey1)).to.throw(
      TypeError
    );
    expect(() => lib.openBookCross(mocks.valid, mocks.invalidKey2)).to.throw(
      TypeError
    );
    expect(() => lib.openBookCross(mocks.valid, mocks.invalidValue1)).to.throw(
      TypeError
    );
    expect(() => lib.openBookCross(mocks.valid, mocks.invalidValue2)).to.throw(
      TypeError
    );
    expect(() => lib.openBookCross(mocks.invalidKey1, mocks.valid)).to.throw(
      TypeError
    );
    expect(() => lib.openBookCross(mocks.invalidKey2, mocks.valid)).to.throw(
      TypeError
    );
    expect(() => lib.openBookCross(mocks.invalidValue1, mocks.valid)).to.throw(
      TypeError
    );
    expect(() => lib.openBookCross(mocks.invalidValue2, mocks.valid)).to.throw(
      TypeError
    );
  });
  it("и не выбрасывается ошибка для валидных элементов", () => {
    expect(() => lib.openBookCross(mocks.valid, mocks.valid)).not.to.throw();
  });
});
