import { App, TerraformStack } from "cdktf";
import type { Construct } from "constructs";

class MyStack extends TerraformStack {}

const app = new App();
new MyStack(app, "cdktf");
app.synth();
