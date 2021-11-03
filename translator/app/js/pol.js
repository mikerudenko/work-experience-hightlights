class Poliz {
  constructor(arrLexems) {
    this.arrLexems = arrLexems;
    this.stack = [];
    this.poliz = [];
    this.polizOperator = [];
    this.countLabels = 0;
    this.labels = [];
    this.index = 0;
    this.priorities = [
      { str: "(", priority: 0, code: 26 },
      { str: ")", priority: 1, code: 27 },
      { str: "[", priority: 0, code: 36 },
      { str: "]", priority: 1, code: 37 },
      { str: "=", priority: 2, code: 10 },
      { str: "Or", priority: 3, code: 24 },
      { str: "And", priority: 4, code: 38 },
      { str: "Not", priority: 5, code: 25 },
      { str: "<", priority: 6, code: 28 },
      { str: ">", priority: 6, code: 30 },
      { str: "==", priority: 6, code: 33 },
      { str: "<>", priority: 6, code: 32 },
      { str: ">=", priority: 6, code: 31 },
      { str: "<=", priority: 6, code: 29 },
      { str: "+", priority: 7, code: 19 },
      { str: "-", priority: 7, code: 20 },
      { str: "*", priority: 8, code: 21 },
      { str: "/", priority: 8, code: 22 },
      { str: "@", priority: 8, code: 20 },
      { str: "^", priority: 9, code: 23 },
      { str: "If", priority: 0, code: 17 },
      { str: "Then", priority: 1, code: 18 },
      { str: "While", priority: 0, code: 16 },
      { str: "Do", priority: 1, code: 13 }
    ];
  }

  isAnyBinaryOperator(str) {
    for (let i = 0; i < this.priorities.length; i++) {
      if (str == this.priorities[i].str) {
        return true;
      }
    }
    return false;
  }

  inspectUnaryMinus() {
    if (
      this.arrLexems[this.index].str == "-" &&
      this.isAnyBinaryOperator(this.arrLexems[this.index - 1].str)
    ) {
      return true;
    }
    return false;
  }

  changeToStackElement() {
    for (let i = 0; i < this.priorities.length; i++) {
      if (this.inspectUnaryMinus()) {
        return { str: "@", priority: 8 };
      }

      if (this.priorities[i].code == this.arrLexems[this.index].code) {
        return this.priorities[i];
      }
    }
  }

  pullBetweenBrakets(bracket) {
    while (this.stack[this.stack.length - 1].str !== bracket) {
      this.polizOperator.push(this.stack.pop().str);
    }
    this.stack.pop();
  }

  //-> anyAssignment
  magazineOperation() {
    if (
      this.arrLexems[this.index].code == 34 ||
      this.arrLexems[this.index].code == 35
    ) {
      this.polizOperator.push(this.arrLexems[this.index].str);
      this.index++;
      return;
    }
    let element = this.changeToStackElement();

    if (this.stack.length == 0) {
      this.stack.push(element);
      this.index++;
    } else {
      if (element.priority > this.stack[this.stack.length - 1].priority) {
        this.stack.push(element);
        this.index++;
      } else if (
        element.priority == this.stack[this.stack.length - 1].priority ||
        element.priority < this.stack[this.stack.length - 1].priority
      ) {
        if (element.str == "(" || element.str == "[") {
          this.stack.push(element);
          this.index++;
        } else if (element.str == ")" || element.str == "]") {
          if (element.str == ")") this.pullBetweenBrakets("(");
          if (element.str == "]") this.pullBetweenBrakets("[");

          this.index++;
          return "close bracket signal";
        } else {
          this.polizOperator.push(this.stack.pop().str);
          this.magazineOperation();
        }
      }
    }
  }

  //Read/Write
  polizReadWrite(word) {
    while (this.arrLexems[this.index].code !== 2) {
      if (this.arrLexems[this.index].code == 34) {
        this.polizOperator.push(this.arrLexems[this.index].str);
        this.polizOperator.push(word);
      }
      this.index++;
    }
    this.index++;
  }

  //While Do poliz
  polizDo(objLabels) {
    let Id = this.arrLexems[this.index].str;
    let whileLeft = false;

    while (this.arrLexems[this.index].code !== 2) {
      if (
        this.arrLexems[this.index].code == 14 ||
        this.arrLexems[this.index].code == 15 ||
        this.arrLexems[this.index].code == 16
      ) {
        //To
        if (this.arrLexems[this.index].code == 14) {
          while (this.stack[this.stack.length - 1].code !== 13) {
            this.polizOperator.push(this.stack.pop().str);
          }
          this.polizOperator.push(objLabels.mi);
          this.polizOperator.push("БП");
          this.polizOperator.push(objLabels.mi_plus2);
          this.polizOperator.push(":");
          this.polizOperator.push(Id);

          this.index++;

          console.log(this.polizOperator);
        }

        //By
        if (this.arrLexems[this.index].code == 15) {
          while (this.stack[this.stack.length - 1].code !== 13) {
            this.polizOperator.push(this.stack.pop().str);
          }
          this.polizOperator.push("<=");
          this.polizOperator.push(objLabels.mi_plus3);
          this.polizOperator.push("УПЛ");
          this.polizOperator.push(objLabels.mi);
          this.polizOperator.push("БП");
          this.polizOperator.push(objLabels.mi_plus1);
          this.polizOperator.push(":");
          this.polizOperator.push(Id);
          this.polizOperator.push(Id);

          this.index++;

          console.log(this.polizOperator);
        }

        //While
        if (this.arrLexems[this.index].code == 16) {
          while (this.stack[this.stack.length - 1].code !== 13) {
            this.polizOperator.push(this.stack.pop().str);
          }
          this.polizOperator.push("+");
          this.polizOperator.push("=");
          this.polizOperator.push(objLabels.mi_plus2);
          this.polizOperator.push("БП");
          this.polizOperator.push(objLabels.mi);
          this.polizOperator.push(":");

          this.stack.push(this.priorities[22]);
          this.index++;

          console.log(this.polizOperator);
          whileLeft = true;
        }
      }

      let res = this.magazineOperation();
      if (res == "close bracket signal" && whileLeft) {
        while (this.stack[this.stack.length - 1].code !== 16) {
          this.polizOperator.push(this.stack.pop().str);
        }

        this.polizOperator.push(objLabels.mi_plus3);
        this.polizOperator.push("УПЛ");
        //this.index++;

        console.log(this.polizOperator);

        while (this.arrLexems[this.index].code !== 5) {
          console.log(this.arrLexems[this.index].code + "-code");
          console.log(this.arrLexems[this.index].str + "-str");
          this.polizOfOperator();
        }

        while (this.stack[this.stack.length - 1].code !== 16) {
          this.polizOperator.push(this.stack.pop().str);
        }

        this.stack.pop();

        this.polizOperator.push(objLabels.mi_plus1);
        this.polizOperator.push("БП");
        this.polizOperator.push(objLabels.mi_plus3);
        this.polizOperator.push(":");

        this.index++;

        console.log(this.arrLexems[this.index].code + "-code");
        console.log(this.arrLexems[this.index].str + "-str");
      }
    }

    this.index++;
  }

  //If poliz
  polizIf() {
    while (this.arrLexems[this.index].code !== 2) {
      if (this.arrLexems[this.index].code == 18) {
        this.pullBetweenIfThen();
        this.index += 2;
        this.polizOfOperator(true);

        while (true) {
          if (
            this.stack[this.stack.length - 1].code == 17 &&
            this.stack[this.stack.length - 1].str != "If"
          ) {
            this.polizOperator.push(this.stack.pop().str);
            this.stack.pop();
            this.index++;
            break;
          } else {
            this.polizOperator.push(this.stack.pop().str);
          }
        }
        break;
      }

      this.magazineOperation();
    }

    this.polizOperator.push(":");
    this.index++;
  }

  generateNewLabel() {
    this.countLabels++;
    this.labels.push("m" + this.countLabels);
    return "m" + this.countLabels;
  }

  pullBetweenIfThen() {
    while (this.stack[this.stack.length - 1].code !== 17) {
      this.polizOperator.push(this.stack.pop().str);
    }
    let newLabel = this.generateNewLabel();
    this.polizOperator.push(newLabel);
    this.polizOperator.push("УПЛ");

    this.stack.push({ str: newLabel, priority: 0, code: 17 });
  }

  polizAssignment() {
    while (this.arrLexems[this.index].code !== 2) {
      this.magazineOperation();
    }

    //Push to poliz sign of assignment
    while (true) {
      if (this.stack[this.stack.length - 1].str == "=") {
        this.polizOperator.push(this.stack.pop().str);
        break;
      }
      this.polizOperator.push(this.stack.pop().str);
    }

    this.index++;
  }

  polizOfOperator(clearPolizOperator) {
    switch (this.arrLexems[this.index].code) {
      case 11:
        this.index++;
        this.polizReadWrite("Read");

        this.printPolizOperator("Read");
        if (!clearPolizOperator) {
          this.poliz = this.poliz.concat(this.polizOperator);
          this.polizOperator.length = 0;
        }

        break;
      case 12:
        this.index++;
        this.polizReadWrite("Write");
        this.printPolizOperator("Write");

        if (!clearPolizOperator) {
          this.poliz = this.poliz.concat(this.polizOperator);
          this.polizOperator.length = 0;
        }

        break;
      case 17:
        this.stack.push(this.priorities[20]);
        this.index++;
        this.polizIf();
        this.printPolizOperator("If");

        if (!clearPolizOperator) {
          this.poliz = this.poliz.concat(this.polizOperator);
          this.polizOperator.length = 0;
        }
        break;
      case 13:
        let objLabels = {
          mi: this.generateNewLabel(),
          mi_plus1: this.generateNewLabel(),
          mi_plus2: this.generateNewLabel(),
          mi_plus3: this.generateNewLabel()
        };
        this.stack.push(this.priorities[23]);

        this.index++;
        this.polizDo(objLabels);

        this.printPolizOperator("While");

        if (!clearPolizOperator) {
          this.poliz = this.poliz.concat(this.polizOperator);
          this.polizOperator.length = 0;
        }
        break;
      case 34:
        this.polizOperator.push(this.arrLexems[this.index].str);
        this.index++;
        this.polizAssignment();
        this.printPolizOperator("Assignment");

        if (!clearPolizOperator) {
          this.poliz = this.poliz.concat(this.polizOperator);
          this.polizOperator.length = 0;
        }
        break;
      default:
        alert("Error in your code!");
        this.index++;
        break;
    }
  }

  printPolizOperator(operator) {
    $(
      "<tr>\
			<td>" +
        operator +
        "</td>\
			<td>" +
        this.polizOperator.join(" ") +
        "</td>\
			</tr>"
    ).appendTo($(".table-poliz tbody"));
  }

  makeInPoliz() {
    for (this.index = 0; this.index < this.arrLexems.length; this.index++) {
      if (this.arrLexems[this.index].code === 4) {
        this.index++;
        break;
      }
    }

    while (this.arrLexems[this.index].code !== 6) {
      this.polizOfOperator();
    }
    $(
      "<tr>\
			<td colspan='2' class='common-poliz'>" +
        this.poliz.join(" ") +
        "</td>\
			</tr>"
    ).appendTo($(".table-poliz tbody"));
  }
}
