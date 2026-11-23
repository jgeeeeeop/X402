/**
 * x402 Money-Making Service
 * Charges real USDC on Base mainnet
 */

import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();

// Your wallet address
const PAY_TO = "0xa1df631954a1c207137f429bb99bdd41698afa09";

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

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
