/**
 * x402 Money-Making Service
 * Charges real USDC on Base mainnet
 */

import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { createFacilitatorConfig } from "@coinbase/x402";

const app = express();

// Your wallet address
const PAY_TO = "0xa1df631954a1c207137f429bb99bdd41698afa09";

// The CDP facilitator is required for Base mainnet (eip155:8453).
const missingEnv = ["CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"].filter(
  (name) => !process.env[name]
);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missingEnv.join(", ")}. ` +
      "Set them in the Railway service variables and redeploy."
  );
  process.exit(1);
}

const facilitatorClient = new HTTPFacilitatorClient(
  createFacilitatorConfig(
    process.env.CDP_API_KEY_NAME,
    process.env.CDP_API_KEY_PRIVATE_KEY
  )
);

const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:8453", new ExactEvmScheme());

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: "eip155:8453",
            payTo: PAY_TO,
          },
        ],
        description: "Current weather data",
        mimeType: "application/json",
      },
    },
    resourceServer
  )
);

app.get("/weather", (req, res) => {
  res.json({
    report: {
      weather: "sunny",
      temperature: 72,
      location: "San Francisco",
      forecast: "Clear skies",
      source: "x402 paid service",
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    paidEndpoint: "GET /weather → $0.01 USDC on Base",
    owner: PAY_TO,
  });
});

const PORT = process.env.PORT || 4021;
app.listen(PORT, () => {
  console.log(`x402 service running on port ${PORT}`);
});
