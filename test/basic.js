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

describe("Проверим сам факт налиция функциий", () => {
  it("то что мы сымпортили - объект", () => {
    expect(lib).to.be.an("object");
  });
  it("он имеет свойство openBookCross и это функция", () => {
    expect(lib).to.have.property("openBookCross");
    expect(lib.openBookCross).to.be.a("function");
  });
  it("он имеет свойство proceedTransaction и это функция", () => {
    expect(lib).to.have.property("proceedTransaction");
    expect(lib.proceedTransaction).to.be.a("function");
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

describe("Проверяем функцию проведения транзакции", () => {
  it("бид и аск не пересекаются по цене: возврат null", () => {
    const bid = {
      rate: 10,
      amount: 1
    };
    const ask = {
      rate: 15,
      amount: 1
    };
    expect(lib.proceedTransaction(bid, ask)).to.be.null;
  });
  it("бид и аск пересекаются, объемы одинаковые: возврат null бид-аск, транзакция", () => {
    let bid, ask;
    bid = {
      rate: 15,
      amount: 1
    };
    ask = {
      rate: 10,
      amount: 1
    };
    expect(lib.proceedTransaction(bid, ask)).to.deep.equal({
      bid: null,
      ask: null,
      transaction: {
        percent: 50,
        amount: 1
      }
    });
    bid = {
      rate: 100.15,
      amount: 0.001
    };
    ask = {
      rate: 100.1,
      amount: 0.001
    };
    expect(lib.proceedTransaction(bid, ask)).to.deep.equal({
      bid: null,
      ask: null,
      transaction: {
        percent: 100 * ((100.15 - 100.1) / 100.1),
        amount: 0.001
      }
    });
  });
  it("бид и аск пересекаются, bid больше по объему: возврат null аск, разница бид, транзакция", () => {
    let bid, ask;
    bid = {
      rate: 15,
      amount: 2
    };
    ask = {
      rate: 10,
      amount: 1
    };
    expect(lib.proceedTransaction(bid, ask)).to.deep.equal({
      bid: {
        rate: 15,
        amount: 1
      },
      ask: null,
      transaction: {
        percent: 50,
        amount: 1
      }
    });
    bid = {
      rate: 15.3,
      amount: 2.2
    };
    ask = {
      rate: 10.1,
      amount: 1.14
    };
    expect(lib.proceedTransaction(bid, ask)).to.deep.equal({
      bid: {
        rate: 15.3,
        amount: 2.2 - 1.14
      },
      ask: null,
      transaction: {
        percent: 100 * ((15.3 - 10.1) / 10.1),
        amount: 1.14
      }
    });
  });
  it("бид и аск пересекаются, ask больше по объему: возврат null бид, разница аск, транзакция", () => {
    let bid, ask;
    bid = {
      rate: 13,
      amount: 2
    };
    ask = {
      rate: 10,
      amount: 5
    };
    expect(lib.proceedTransaction(bid, ask)).to.deep.equal({
      bid: null,
      ask: {
        rate: 10,
        amount: 3
      },
      transaction: {
        percent: 30,
        amount: 2
      }
    });
    bid = {
      rate: 13.56,
      amount: 2.12
    };
    ask = {
      rate: 12.7,
      amount: 5.984
    };
    expect(lib.proceedTransaction(bid, ask)).to.deep.equal({
      bid: null,
      ask: {
        rate: 12.7,
        amount: 5.984 - 2.12
      },
      transaction: {
        percent: 100 * ((13.56 - 12.7) / 12.7),
        amount: 2.12
      }
    });
  });
});

describe("Проверяем проведение массива транзакций", () => {
  it("В массивах бид/аск нет пересекающихся цен, возвращается пустой массив транзакций", () => {
    let bids = [
      {
        rate: 15,
        amount: 1
      },
      {
        rate: 14,
        amount: 2
      },
      {
        rate: 13,
        amount: 3
      }
    ];
    let asks = [
      {
        rate: 25,
        amount: 1
      },
      {
        rate: 30,
        amount: 2
      },
      {
        rate: 40,
        amount: 3
      }
    ];
    expect(lib.openBookCross(asks, bids))
      .to.be.an("array")
      .and.to.have.lengthOf(0);
  });
  it("Проводим самый простой набор бид/аск, где всё одного объема и пересекается точно", () => {
    let bids = [
      {
        rate: 15,
        amount: 1
      },
      {
        rate: 14,
        amount: 2
      },
      {
        rate: 13,
        amount: 3
      }
    ];
    let asks = [
      {
        rate: 10,
        amount: 1
      },
      {
        rate: 11,
        amount: 2
      },
      {
        rate: 12,
        amount: 3
      }
    ];
    let expectedTransactions = [
      {
        amount: 1,
        percent: 50
      },
      {
        amount: 2,
        percent: 300 / 11
      },
      {
        amount: 3,
        percent: 100 / 12
      }
    ];
    expect(lib.openBookCross(asks, bids)).to.deep.equal(expectedTransactions);
  });
  it("Проверка с частичным выполнением проводок", () => {
    let bids = [
      {
        rate: 15,
        amount: 3
      },
      {
        rate: 14,
        amount: 2
      },
      {
        rate: 13,
        amount: 1
      }
    ];
    let asks = [
      {
        rate: 10,
        amount: 1
      },
      {
        rate: 11,
        amount: 2
      },
      {
        rate: 12,
        amount: 3
      }
    ];
    let expectedTransactions = [
      {
        amount: 1,
        percent: 50
      },
      {
        amount: 2,
        percent: 400 / 11
      },
      {
        amount: 2,
        percent: 200 / 12
      },
      {
        amount: 1,
        percent: 100 / 12
      }
    ];
    expect(lib.openBookCross(asks, bids)).to.deep.equal(expectedTransactions);
  });
});
