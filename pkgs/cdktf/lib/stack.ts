import { CloudRunService } from "@cdktf/provider-google/lib/cloud-run-service";
import { CloudRunServiceIamPolicy } from "@cdktf/provider-google/lib/cloud-run-service-iam-policy";
import { DataGoogleIamPolicy } from "@cdktf/provider-google/lib/data-google-iam-policy";
import { DataGoogleServiceAccount } from "@cdktf/provider-google/lib/data-google-service-account";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { TerraformOutput, TerraformStack } from "cdktf";
import type { Construct } from "constructs";
import * as dotenv from "dotenv";

dotenv.config();

const {
  GEMINI_API_KEY,
  OPENAI_API_KEY,
  TAVILY_API_KEY,
  CDP_API_KEY_NAME,
  CDP_API_KEY_PRIVATE_KEY,
  NETWORK_ID,
  PRIVATE_KEY,
  ALCHEMY_API_KEY,
  Groq_API_Key,
  COINGECKO_API_KEY,
  PRIVY_APP_ID,
  PRIVY_APP_SECRET_KEY,
  ANTHROPIC_KEY_API,
} = process.env;

export interface MyStackConfig {
  projectId: string;
  region: string;
  imageRepoName: string;
  imageName: string;
}

/**
 * MyStack
 */
export class MyStack extends TerraformStack {
  /**
   * Constructor
   * @param scope
   * @param id
   */
  constructor(scope: Construct, id: string, config: MyStackConfig) {
    super(scope, id);

    // Google Cloud Provider settings
    new GoogleProvider(this, "GoogleProvider", {
      project: config.projectId,
      region: config.region,
    });

    // Creating a service account
    const serviceAccount = new DataGoogleServiceAccount(
      this,
      "HonoSampleAccount",
      {
        accountId: "honoSampleAccount", // Service account　name
        project: config.projectId,
      },
    );

    // Policy to be assigned to CloudRun
    const policy_data = new DataGoogleIamPolicy(this, "HonoSampleAccountIAM", {
      binding: [
        {
          role: "roles/run.invoker",
          members: [`serviceAccount:${serviceAccount.email}`, "allUsers"],
        },
      ],
    });

    // CloudRun Resource
    const cloudrunsvcapp = new CloudRunService(this, "HonoVertexAICloudRun", {
      location: config.region,
      name: config.imageName,
      template: {
        spec: {
          serviceAccountName: serviceAccount.email,
          containers: [
            {
              image: `${config.region}-docker.pkg.dev/${config.projectId}/${config.imageRepoName}/${config.imageName}:latest`,
              ports: [
                {
                  containerPort: 3000,
                },
              ],
              // Environment variables settings
              env: [
                {
                  name: "PROJECT_ID",
                  value: config.projectId,
                },
                {
                  name: "REGION",
                  value: config.region,
                },
                {
                  name: "GEMINI_API_KEY",
                  value: GEMINI_API_KEY,
                },
                {
                  name: "OPENAI_API_KEY",
                  value: OPENAI_API_KEY,
                },
                {
                  name: "TAVILY_API_KEY",
                  value: TAVILY_API_KEY,
                },
                {
                  name: "CDP_API_KEY_NAME",
                  value: CDP_API_KEY_NAME,
                },
                {
                  name: "CDP_API_KEY_PRIVATE_KEY",
                  value: CDP_API_KEY_PRIVATE_KEY,
                },
                {
                  name: "NETWORK_ID",
                  value: NETWORK_ID,
                },
                {
                  name: "PRIVATE_KEY",
                  value: PRIVATE_KEY,
                },
                {
                  name: "ALCHEMY_API_KEY",
                  value: ALCHEMY_API_KEY,
                },
                {
                  name: "Groq_API_Key",
                  value: Groq_API_Key,
                },
                {
                  name: "COINGECKO_API_KEY",
                  value: COINGECKO_API_KEY,
                },
                {
                  name: "PRIVY_APP_ID",
                  value: PRIVY_APP_ID,
                },
                {
                  name: "PRIVY_APP_SECRET_KEY",
                  value: PRIVY_APP_SECRET_KEY,
                },
                {
                  name: "ANTHROPIC_KEY_API",
                  value: ANTHROPIC_KEY_API,
                },
              ],
            },
          ],
        },
      },
    });

    // CloudRun IAM Policy
    new CloudRunServiceIamPolicy(this, "runsvciampolicy", {
      location: config.region,
      project: cloudrunsvcapp.project,
      service: cloudrunsvcapp.name,
      policyData: policy_data.policyData,
    });

    //////////////////////////////////////////////////////////////////////
    // 成果物
    //////////////////////////////////////////////////////////////////////

    // サービスURLの出力
    new TerraformOutput(this, "service_url", {
      value: cloudrunsvcapp.status.get(0).url,
      description: "The URL of the deployed Cloud Run service",
    });

    // サービス名の出力
    new TerraformOutput(this, "service_name", {
      value: cloudrunsvcapp.name,
      description: "The name of the deployed Cloud Run service",
    });

    // リージョンの出力
    new TerraformOutput(this, "region", {
      value: cloudrunsvcapp.location,
      description: "The region where the service is deployed",
    });
  }
}
