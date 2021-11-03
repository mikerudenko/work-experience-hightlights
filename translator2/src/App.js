import React from "react";
import "./App.css";
import { Container, Col, Row } from "reactstrap";

import "bootstrap/dist/css/bootstrap.min.css";

import { ConsoleContainer } from "./Console";
import { FormContainer } from "./Form";
import { Tables } from "./Tables";
import "./App.css";

import { useCodeString } from "./useCodeString";
import { useLexemes } from "./useLexemes";

function App() {
  const [lexemes, generateLexemes] = useLexemes();
  const [codeString, { setCodeString, setDefaultCodeString }] = useCodeString();

  return (
    <Container fluid className="app-container">
      <Row>
        <Col sm={8}>
          <FormContainer
            {...{
              codeString,
              setDefaultCodeString,
              generateLexemes
            }}
            onCodeStringChange={setCodeString}
          />
        </Col>
        <Col sm={4}>
          <ConsoleContainer logs={[]} />
        </Col>
      </Row>
      <Row>
        <Tables {...{ lexemes }} />
      </Row>
    </Container>
  );
}

export default App;
