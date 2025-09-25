import { type User, type InsertUser, type Transaction, type InsertTransaction, type Reward, type InsertReward } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: string, walletAddress: string): Promise<User | undefined>;

  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByHash(txHash: string): Promise<Transaction | undefined>;
  getTransactionsByAddress(address: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string, blockHeight?: number): Promise<Transaction | undefined>;

  // Reward methods
  getReward(id: string): Promise<Reward | undefined>;
  getRewardsByUser(userId: string): Promise<Reward[]>;
  getUnclaimedRewardsByAddress(address: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  claimReward(id: string): Promise<Reward | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private rewards: Map<string, Reward>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.rewards = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === address,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      walletAddress: insertUser.walletAddress || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(id: string, walletAddress: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.walletAddress = walletAddress;
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByHash(txHash: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.txHash === txHash,
    );
  }

  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.fromAddress === address || tx.toAddress === address)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
      confirmedAt: null,
      status: insertTransaction.status || 'pending',
      blockHeight: insertTransaction.blockHeight || null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: string, status: string, blockHeight?: number): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.status = status;
      if (blockHeight) {
        transaction.blockHeight = blockHeight;
      }
      if (status === 'confirmed') {
        transaction.confirmedAt = new Date();
      }
      this.transactions.set(id, transaction);
      return transaction;
    }
    return undefined;
  }

  // Reward methods
  async getReward(id: string): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async getRewardsByUser(userId: string): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnclaimedRewardsByAddress(address: string): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(reward => reward.walletAddress === address && !reward.claimed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = {
      ...insertReward,
      id,
      createdAt: new Date(),
      claimedAt: null,
      claimed: insertReward.claimed || false,
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async claimReward(id: string): Promise<Reward | undefined> {
    const reward = this.rewards.get(id);
    if (reward && !reward.claimed) {
      reward.claimed = true;
      reward.claimedAt = new Date();
      this.rewards.set(id, reward);
      return reward;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
