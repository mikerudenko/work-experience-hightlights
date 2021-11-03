import React, { memo } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody } from "reactstrap";

export function Console({ logs }) {
  return (
    <Card>
      <CardHeader>Console</CardHeader>
      <CardBody>
        {logs.map(log => (
          <li>{log}</li>
        ))}
      </CardBody>
    </Card>
  );
}

Console.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.string)
};

export const ConsoleContainer = memo(Console);
