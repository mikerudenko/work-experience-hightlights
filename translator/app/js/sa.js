class SyntaxAnalyzer {
  constructor(arrLexemes) {
    this.index = 0;
    this.arrLexemes = arrLexemes;
  }

  //Method of checking stack
  checkStack(lexemes) {
    lexemes.forEach(({ code, error }) => {
      if (this.arrLexemes[this.index].code !== code) {
        giveError(error + " Line: " + this.arrLexemes[this.index].lineNumber);
        throw new Error(error);
      } else {
        this.index++;
      }
    });
  }

  checkNameProgram() {
    this.checkStack([
      {
        code: 1,
        error: 'There is no word "Program" in your code!'
      },
      {
        code: 34,
        error: "There is no name of your program in your code!"
      },
      {
        code: 2,
        error: 'You forgot ";" statement!'
      }
    ]);
  }

  checkVarStatement() {
    this.checkStack([
      {
        code: 3,
        error: "You forgot let  word in your code !"
      }
    ]);
    this.checkIdList();
    this.checkStack([
      {
        code: 7,
        error: "There  must be : symbol in your code Declaration!"
      },
      {
        code: 8,
        error: "There  must be integer type in your code Declaration!"
      },
      {
        code: 2,
        error: 'You forgot ";" statement!'
      }
    ]);
  }

  checkIdList() {
    this.checkStack([
      {
        code: 34,
        errorMsg: "You forgot ID your code !"
      }
    ]);

    while (this.arrLexemes[this.index].code == 9) {
      this.index++;

      this.checkStack([
        {
          code: 34,
          error: "You forgot ID your code !"
        }
      ]);
    }
  }

  checkDeclaration() {
    this.checkNameProgram();
    this.checkVarStatement();
  }

  checkBody() {
    while (this.arrLexemes[this.index].code !== 6) {
      this.inspectOperator();
    }
  }

  inspectReadWrite() {
    this.checkStack([
      {
        code: 26,
        error: "You forgot ( in your Read/Write statement!"
      }
    ]);

    this.checkIdList();

    this.checkStack([
      {
        code: 27,
        error: "You forgot ) in your Read/Write statement!"
      },
      {
        code: 2,
        error: 'You forgot ";" statement!'
      }
    ]);
  }

  inspectMultiplier() {
    if ([34, 35].includes(this.arrLexemes[this.index].code)) {
      this.index++;
      return;
    } else if (this.arrLexemes[this.index].code == 36) {
      this.index++;
      this.inspectStatement();

      this.checkStack([
        {
          code: 37,
          error: "Yo forgot ) in your code!"
        }
      ]);
    } else {
      giveError(
        "Unexpected Token! Line: " +
          (this.arrLexemes[this.index].lineNumber + 1)
      );
    }
  }

  inspectTerminator() {
    this.inspectMultiplier();

    while ([21, 22, 23].includes(this.arrLexemes[this.index].code)) {
      this.index++;
      this.inspectMultiplier();
    }
  }

  inspectStatement() {
    if (this.arrLexemes[this.index].code == 20) {
      this.index++;
    }

    this.inspectTerminator();

    while ([19, 20].includes(this.arrLexemes[this.index].code)) {
      this.index++;
      this.inspectTerminator();
    }
  }

  inspectAssignment() {
    this.checkStack([
      {
        code: 10,
        error: "You forgot = in  your code !"
      }
    ]);

    this.inspectStatement();

    this.checkStack([
      {
        code: 2,
        error: "You forgot ; in your code!"
      }
    ]);
  }

  inspectOperator() {
    switch (this.arrLexemes[this.index].code) {
      case 11:
      case 12:
        this.index++;
        this.inspectReadWrite();
        break;
      case 17:
        this.index++;
        this.inspectIf();
        break;
      case 13:
        this.index++;
        this.inspectDo();
        break;
      case 34:
        this.index++;
        this.inspectAssignment();
        break;
      default:
        giveError(
          "Error! Unexpected token! Line: " +
            (this.arrLexemes[this.index].lineNumber + 1)
        );
        break;
    }
  }

  //Inspection of if
  inspectIf() {
    this.checkStack([
      {
        code: 26,
        error: "You forgot ( in your code your code !"
      }
    ]);

    this.inspectLogicalExpression();

    console.log("End of logical if expression");

    this.checkStack([
      {
        code: 27,
        error: "You forgot ) in your code your code !"
      },
      {
        code: 18,
        error: "You forgot Then in your code your code !"
      },
      {
        code: 39,
        error: "You forgot { in your code your code !"
      }
    ]);

    this.inspectOperator();

    this.checkStack([
      {
        code: 40,
        error: "You forgot } in your code your code !"
      },
      {
        code: 2,
        error: "You forgot ; in your code your code !"
      }
    ]);
  }

  inspectLogicalExpression() {
    this.inspectLogicalTerminator();

    while (this.arrLexemes[this.index].code == 24) {
      this.index++;
      this.inspectLogicalTerminator();
    }
  }

  inspectLogicalTerminator() {
    this.inspectLogicalMultiplier();

    while (this.arrLexemes[this.index].code == 38) {
      this.index++;
      this.inspectLogicalMultiplier();
    }
  }

  inspectLogicalMultiplier() {
    if (this.arrLexemes[this.index].code == 25) {
      while (this.arrLexemes[this.index].code == 25) {
        this.index++;
        if (this.arrLexemes[this.index].code != 35) {
          this.inspectStatement();

          if (
            this.arrLexemes[this.index].code >= 28 &&
            this.arrLexemes[this.index].code <= 33
          ) {
            this.index++;
          } else {
            giveError(
              "Error! Unexpected token! Line: " +
                (this.arrLexemes[this.index].lineNumber + 1)
            );
          }

          this.inspectStatement();
        } else if (this.arrLexemes[this.index].code == 36) {
          this.index++;
          this.inspectLogicalExpression();

          this.checkStack([
            {
              code: 37,
              error: "You forgot ] in your code your code !"
            }
          ]);
        } else {
          giveError(
            "Error! Unexpected token! Line: " +
              (this.arrLexemes[this.index].lineNumber + 1)
          );
        }
      }
    } else {
      if (this.arrLexemes[this.index].code !== 36) {
        this.inspectStatement();

        if (
          this.arrLexemes[this.index].code >= 28 &&
          this.arrLexemes[this.index].code <= 33
        ) {
          this.index++;
        } else {
          giveError(
            "Error! Unexpected token! Line: " +
              (this.arrLexemes[this.index].lineNumber + 1)
          );
        }
        this.inspectStatement();
      } else if (this.arrLexemes[this.index].code == 36) {
        this.index++;
        this.inspectLogicalExpression();

        this.checkStack([
          {
            code: 37,
            error: "You forgot ] in your code your code !"
          }
        ]);
      } else {
        giveError(
          "Error! Unexpected token! Line: " +
            (this.arrLexemes[this.index].lineNumber + 1)
        );
      }
    }
  }

  //Inspect Do
  inspectDo() {
    //Inspect assignment
    this.checkStack([
      {
        code: 34,
        error: "You forgot ID in your code !"
      }
    ]);

    this.checkStack([
      {
        code: 10,
        error: "You forgot = in  your code !"
      }
    ]);

    this.inspectStatement();

    this.checkStack([
      {
        code: 14,
        error: "You forgot To in your code !"
      }
    ]);

    this.inspectStatement();

    this.checkStack([
      {
        code: 15,
        error: "You forgot By in your code !"
      }
    ]);

    this.inspectStatement();

    this.checkStack([
      {
        code: 16,
        error: "You forgot While in your code !"
      }
    ]);

    this.checkStack([
      {
        code: 26,
        error: "You forgot ( in your code !"
      }
    ]);

    this.inspectLogicalExpression();

    this.checkStack([
      {
        code: 27,
        error: "You forgot ) in  your code !"
      }
    ]);

    while (this.arrLexemes[this.index].code !== 5) {
      this.inspectOperator();
    }

    this.checkStack([
      {
        code: 5,
        error: "You forgot End in  your code !"
      },
      {
        code: 2,
        error: "You forgot ; in  your code !"
      }
    ]);
  }

  analyze() {
    this.checkDeclaration();
    this.checkStack([
      {
        code: 4,
        error: "You forgot Begin in your code !"
      }
    ]);

    this.checkBody();

    this.checkStack([
      {
        code: 6,
        error: "You forgot EndPr in your code !"
      }
    ]);

    return true;
  }
}
