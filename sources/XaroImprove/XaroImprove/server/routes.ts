import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertRewardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get transactions for a wallet address
  app.get("/api/transactions/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const transactions = await storage.getTransactionsByAddress(address);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Create a new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });

  // Update transaction status
  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, blockHeight } = req.body;
      
      if (!['pending', 'confirmed', 'failed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const transaction = await storage.updateTransactionStatus(id, status, blockHeight);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction status" });
    }
  });

  // Get unclaimed rewards for a wallet address
  app.get("/api/rewards/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const rewards = await storage.getUnclaimedRewardsByAddress(address);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rewards" });
    }
  });

  // Create a new reward
  app.post("/api/rewards", async (req, res) => {
    try {
      const validatedData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(validatedData);
      res.json(reward);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid reward data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create reward" });
      }
    }
  });

  // Claim a reward
  app.post("/api/rewards/:id/claim", async (req, res) => {
    try {
      const { id } = req.params;
      const reward = await storage.claimReward(id);
      
      if (!reward) {
        return res.status(404).json({ error: "Reward not found or already claimed" });
      }
      
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: "Failed to claim reward" });
    }
  });

  // Generate transaction code (45-digit code based on transaction hash)
  app.post("/api/generate-code", async (req, res) => {
    try {
      const { txHash } = req.body;
      
      if (!txHash) {
        return res.status(400).json({ error: "Transaction hash is required" });
      }

      // Generate 45-digit code from transaction hash
      let code = '';
      const hashBytes = Buffer.from(txHash.replace('0x', ''), 'hex');
      
      for (let i = 0; i < 45; i++) {
        const byteIndex = i % hashBytes.length;
        const digit = hashBytes[byteIndex] % 10;
        code += digit.toString();
      }
      
      res.json({ code });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate transaction code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
