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

describe("Testing fact of availability function itself", () => {
  it("make sure that we imported object", () => {
    expect(lib).to.be.an("object");
  });
  it("it has openBookCross property and this property is a function", () => {
    expect(lib).to.have.property("openBookCross");
    expect(lib.openBookCross).to.be.a("function");
  });
  it("it has property proceedTransaction and this property is a function", () => {
    expect(lib).to.have.property("proceedTransaction");
    expect(lib.proceedTransaction).to.be.a("function");
  });
});

describe("Primary testing of incoming parameters", () => {
  it("if one of attributes is absent or not array, expecting TypeError", () => {
    expect(() => lib.openBookCross()).to.throw(TypeError);
    expect(() => lib.openBookCross(mocks.valid)).to.throw(TypeError);
    expect(() => lib.openBookCross({}, mocks.valid)).to.throw(TypeError);
  });
  it("if one of attributes has no elements, expecting emty array", () => {
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
  it("if any of elements of any given arrays missing expecting format, throwing TypeError", () => {
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
  it("and no error throwing for valid elements", () => {
    expect(() => lib.openBookCross(mocks.valid, mocks.valid)).not.to.throw();
  });
});

describe("Testing transaction function", () => {
  it("if bid and ask are not crossing py price: expecting null", () => {
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
  it("bid and ask are crossing, volumes are same: expecting null bid and ask, transaction", () => {
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
  it("bid and ask are crossing, bid more than ask by volume: expecting null ask, bid difference, transaction", () => {
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
  it("bid and ask are crossing, ask more than bid by volume: expecting null bid, ask difference, transaction", () => {
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

describe("Tests of executing array of transactions", () => {
  it("there are no crossing prices in bid/ask arrays, expecting empty array of transactions", () => {
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
  it("executing simpliest crossing, where all volumes are the same", () => {
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
  it("executing partially", () => {
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
