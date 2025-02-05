import { App } from "cdktf";
import * as dotenv from "dotenv";
import { MyStack } from "./lib/stack";

dotenv.config();

const { PROJECT_ID, REGION } = process.env;

const app = new App();

new MyStack(app, "hono-vertexai-sample-api", {
  projectId: PROJECT_ID as string,
  region: REGION as string,
  imageRepoName: "hono-vertexai-sample-repo",
  imageName: "hono-vertexai-image",
});

app.synth();
