import React, { useState, useCallback } from "react";
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
  Table
} from "reactstrap";
import classnames from "classnames";

import "./Tables.css";

export const Tables = () => {
  const [activeTab, setActiveTab] = useState("1");

  const toggle = useCallback(
    tab => {
      if (activeTab !== tab) {
        setActiveTab(tab);
      }
    },
    [activeTab]
  );

  const toggleFirstTab = useCallback(() => toggle("1"), [toggle]);
  const toggleSecondTab = useCallback(() => toggle("2"), [toggle]);

  return (
    <Col sm={12}>
      <Nav tabs className="app-tabs">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "1" })}
            onClick={toggleFirstTab}
          >
            Lexemes table
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "2" })}
            onClick={toggleSecondTab}
          >
            Polish sign table
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Row>
            <Col sm="6">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Lexeme</th>
                    <th>Code of lexeme</th>
                    <th>Number of line</th>
                    <th>Index of id/const</th>
                  </tr>
                </thead>
                <tbody>{/* there will be lexemes mappings */}</tbody>
              </Table>
            </Col>
            <Col sm="3">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Number</th>
                  </tr>
                </thead>
                <tbody>{/* there will be lexemes mappings */}</tbody>
              </Table>
            </Col>
            <Col sm="3">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Constant</th>
                    <th>Number</th>
                  </tr>
                </thead>
                <tbody>{/* there will be lexemes mappings */}</tbody>
              </Table>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm="12">
              <Table bordered>
                <thead>
                  <tr>
                    <th>Operator</th>
                    <th>Polish sign</th>
                  </tr>
                </thead>
                <tbody>{/* will be polish content */}</tbody>
              </Table>
            </Col>
          </Row>
        </TabPane>
      </TabContent>
    </Col>
  );
};
