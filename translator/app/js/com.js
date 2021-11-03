class Compiler {
  constructor(poliz, labels) {
    this.poliz = poliz;
    this.labels = labels;
    this.stack = [];
    this.programContext = {};
    this.hasErrors = false;
    this.fromLetters = /[a-z]+/;
    this.isLabel = /m[0-9]+/;
    this.isNumber = /[0-9]+/;
  }

  assignOperation() {
    const assignmentPart = this.stack.pop();
    const variable = this.stack.pop();
    this.programContext[variable] = assignmentPart;
  }

  inspectRead() {
    const variable = this.stack.pop();
    this.programContext[variable] = parseInt(
      prompt("Please, enter variable " + variable + ": ")
    );
  }

  inspectWrite() {
    const variable = this.stack.pop();

    giveError(
      `Value of the variable ${variable} : ${this.programContext[variable]}`
    );
  }

  logicalArithmeticalOperation(operation) {
    let rightPart = this.stack.pop();
    let leftPart = this.stack.pop();

    if (typeof rightPart !== "number") {
      rightPart = this.programContext[rightPart];
    }

    if (typeof leftPart !== "number") {
      leftPart = this.programContext[leftPart];
    }

    if (rightPart === undefined || rightPart === undefined) {
      this.hasErrors = true;
      giveError("Uninitialized variable in your code");
      return;
    }

    return {
      ">=": leftPart >= rightPart,
      "<=": leftPart <= rightPart,
      "==": leftPart === rightPart,
      "<>": leftPart !== rightPart,
      ">": leftPart > rightPart,
      "<": leftPart < rightPart,
      "-": leftPart - rightPart,
      "+": leftPart + rightPart,
      "*": leftPart * rightPart,
      "/": leftPart / rightPart,
      "^": Math.pow(leftPart, rightPart)
    }[operation];
  }

  compile() {
    for (let i = 0; i < this.poliz.length; i++) {
      if (
        this.poliz[i] !== "Write" &&
        this.poliz[i] !== "Read" &&
        this.poliz[i].search(this.fromLetters) !== -1
      ) {
        if (this.poliz[i].search(this.isLabel) !== -1) {
          if (this.poliz[i + 1] === "УПЛ") {
            let booleanValue = this.stack.pop();
            if (!booleanValue) {
              let label = this.poliz[i],
                index = i + 2;
              while (true) {
                if (
                  label === this.poliz[index] &&
                  ":" === this.poliz[index + 1] &&
                  index < this.poliz.length
                ) {
                  break;
                }
                if (this.poliz.length < index) {
                  break;
                }
                index++;
              }

              if (this.poliz.length < index) {
                let index2 = i;
                index2--;
                while (true) {
                  if (
                    label === this.poliz[index2] &&
                    ":" === this.poliz[index2 + 1]
                  ) {
                    break;
                  }
                  index2--;
                }

                i = index2;
              } else {
                i = index;
              }
            }
          } else if (this.poliz[i + 1] === "БП") {
            console.log("equals BP");
            let label = this.poliz[i],
              index = i + 2;

            while (true) {
              if (
                label === this.poliz[index] &&
                ":" === this.poliz[index + 1] &&
                index < this.poliz.length
              ) {
                break;
              }
              if (this.poliz.length < index) {
                break;
              }
              index++;
            }

            if (this.poliz.length < index) {
              let index2 = i;
              index2--;
              while (true) {
                if (
                  label == this.poliz[index2] &&
                  ":" == this.poliz[index2 + 1]
                ) {
                  break;
                }
                index2--;
              }

              i = index2;
            } else {
              i = index;
            }
          }
        } else {
          this.stack.push(this.poliz[i]);
        }
      } else if (this.poliz[i].search(this.isNumber) !== -1) {
        this.stack.push(parseInt(this.poliz[i]));
      } else {
        if (
          [">=", "<=", "==", "<>", ">", "<", "-", "+", "*", "/", "^"].includes(
            this.poliz[i]
          )
        ) {
          const result = this.logicalArithmeticalOperation(this.poliz[i]);
          if (this.hasErrors) {
            return false;
          }
          this.stack.push(result);
          return false;
        }

        switch (this.poliz[i]) {
          case "=":
            this.assignOperation();
            break;
          case "Write":
            this.inspectWrite();
            break;
          case "Read":
            this.inspectRead();
            break;
          default:
            break;
        }
      }
    }
  }
}
