import AWS from "aws-sdk";
import { ENVS_VARS } from "env";
import logger from "logger";
import fs from "node:fs";
import csv from "csv-parser";
import path from "node:path";
import ejs from "ejs";

const AWS_SES = new AWS.SES(ENVS_VARS);

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const params = {
    Source: ENVS_VARS.fromEmail,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  };

  try {
    await AWS_SES.sendEmail(params).promise();
    logger.info(`✅ Email sent to ${to}`);
  } catch (err) {
    logger.error(`❌ Error sending to ${to}: ${(err as Error).message}`);
  }
}

async function run(): Promise<void> {
  const recipients: Array<{ email: string; name: string; jobTitle: string }> =
    [];

  const recipientsCsvPath = path.join(__dirname + "/data/recipients.csv");
  console.log(recipientsCsvPath);
  if (!fs.existsSync(recipientsCsvPath)) {
    logger.error(`❌ File not found: ${recipientsCsvPath}`);
    return;
  }

  fs.createReadStream(recipientsCsvPath)
    .pipe(csv())
    .on("data", (row: { email: string; name: string; jobTitle: string }) =>
      recipients.push(row),
    )
    .on("end", async () => {
      const template: string = fs.readFileSync(
        path.join(__dirname + "/templates/jobAlert.ejs"),
        "utf-8",
      );

      for (let i = 0; i < recipients.length; i++) {
        const { email, name, jobTitle } = recipients[i];
        const html = ejs.render(template, { name, jobTitle });

        await sendEmail(email, "New Job Alert for You!", html);

        // SES Rate Limit Handling
        if (i % ENVS_VARS.rateLimit === 0) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      console.log("✅ All emails processed");
    });
}

run();
