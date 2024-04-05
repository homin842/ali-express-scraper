const moment = require("moment-timezone");
const { pool } = require("../database");
const { DatabaseService } = require("../services");
const db = new DatabaseService(pool, "cv_parser");

async function countWithin(startDate, endDate) {
  const condition = `WHERE received_at >= $1 AND received_at <= $2`;

  // Define database query functions
  const queryFunctions = [
    { name: "Tracks", tableName: "tracks" },
    { name: "Create Credentials Failure", tableName: "create_credentials_failure" },
    { name: "CV parser", tableName: "cv_parser" },
    { name: "CV parser user tag", tableName: "cv_parser_user_tag" },
    { name: "Action 1 clicked", tableName: "action_1_clicked" },
    { name: "Action 2 clicked", tableName: "action_2_clicked" },
    {
      name: "Execute Workflow Button Success",
      tableName: "execute_workflow_button_success",
    },
    {
      name: "Execute Workflow Button Failure",
      tableName: "execute_workflow_button_failure",
    },
    { name: "Workflow Success", tableName: "workflow_success" },
    { name: "Workflow Failure", tableName: "workflow_failure" },
    { name: "CVs upload success", tableName: "cvs_upload_success" },
    { name: "CVs upload failure", tableName: "cvs_upload_failure" },
  ].map(async ({ name, tableName }) => {
    const count = await db.count({
      tableName,
      condition,
      values: [startDate, endDate],
    });
    return { [name]: Number(count) };
  });

  // Execute database queries concurrently
  const results = await Promise.all(queryFunctions);

  // Format the results
  const formatVNTime = (isoTime) =>
    moment.utc(isoTime).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")
  const formattedResults = results.reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {},
  );
  return {
    "From Date": formatVNTime(startDate),
    "To Date": formatVNTime(endDate),
    ...formattedResults,
  };
}

module.exports = { countWithin };
