# Overview

This is a full-stack web application for the XARO token, built as a comprehensive cryptocurrency management platform on the Sui blockchain. The application provides a complete token ecosystem including wallet integration, transaction management, reward distribution, and real-time blockchain interaction. It features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in a client-server monorepo structure
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable interface elements
- **Styling**: Tailwind CSS with CSS custom properties for theming and dark mode support
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Blockchain Integration**: Prepared for Sui blockchain integration using @mysten/dapp-kit and @mysten/sui.js

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints for transaction management, user operations, and reward distribution
- **Storage Layer**: Abstracted storage interface with in-memory fallback for development

## Database Schema
- **Users Table**: User authentication with optional wallet address linking
- **Transactions Table**: Complete transaction history with 45-digit codes, status tracking, and blockchain metadata
- **Rewards Table**: Bug bounty and contribution reward system with claim tracking

## Development Environment
- **Build Tool**: Vite for fast development and optimized production builds
- **Development Features**: Hot module replacement, runtime error overlay, and Replit-specific development plugins
- **Type Safety**: Comprehensive TypeScript configuration with strict mode and path mapping

## Authentication & Authorization
- **Wallet-Based Auth**: Primary authentication through Sui wallet connection
- **Session Management**: Prepared for session-based authentication with connect-pg-simple
- **Security**: Parameterized queries through Drizzle ORM prevent SQL injection

## Blockchain Integration Strategy
- **Token Contract**: Designed for Sui Move smart contracts with transfer, minting, and reward functions
- **Transaction Codes**: Unique 45-digit codes generated from transaction hashes for user verification
- **Event Handling**: Prepared for real-time blockchain event processing and transaction status updates

# External Dependencies

## Core Blockchain Services
- **Sui Network**: Primary blockchain for XARO token deployment and operations
- **Wallet Providers**: Integration with Sui wallet ecosystem through @mysten/wallet-kit

## Database & Storage
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations with migration support

## UI & Development
- **Radix UI**: Comprehensive primitive component library for accessible UI elements
- **TanStack Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

## Development Tools
- **Vite**: Development server and build tool with React plugin
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Production bundling for server-side code

## Third-Party Integrations
- **Date Utilities**: date-fns for date formatting and manipulation
- **Form Handling**: React Hook Form with Zod validation resolvers
- **Toast Notifications**: Radix UI toast system for user feedback