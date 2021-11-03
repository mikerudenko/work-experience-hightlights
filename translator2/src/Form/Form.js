import React, { memo } from "react";
import PropTypes from "prop-types";

import { Row, Col, Button, Input } from "reactstrap";

import "./Form.css";

export default function Form({
  onSave,
  onReset,
  generateLexemes,
  runSyntaxAnalyzer,
  runInterpreter,
  setDefaultCodeString,
  codeString,
  onCodeStringChange
}) {
  return (
    <Row>
      <Col sm={8}>
        <Input
          type="textarea"
          cols="30"
          rows="19"
          onChange={onCodeStringChange}
          value={codeString}
        />
      </Col>
      <Col sm={4}>
        <Button color="primary" onClick={onSave} className="app-button">
          Save code
        </Button>
        <Button color="warning" onClick={onReset} className="app-button">
          Reset
        </Button>
        <Button
          color="info"
          onClick={setDefaultCodeString}
          className="app-button"
        >
          Paster default source code
        </Button>
        <Button
          color="success"
          onClick={generateLexemes}
          className="app-button"
        >
          Run lexical analyzer
        </Button>
        <Button
          color="success"
          onClick={runSyntaxAnalyzer}
          className="app-button"
        >
          Run syntax analyzer
        </Button>
        <Button color="success" onClick={runInterpreter} className="app-button">
          Run Interpreter
        </Button>
      </Col>
    </Row>
  );
}

Form.propTypes = {
  codeString: PropTypes.string,
  onCodeStringChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  generateLexemes: PropTypes.func.isRequired,
  runSyntaxAnalyzer: PropTypes.func.isRequired,
  runInterpreter: PropTypes.func.isRequired,
  setDefaultCodeString: PropTypes.func.isRequired
};

export const FormContainer = memo(Form);
