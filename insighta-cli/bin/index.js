#!/usr/bin/env node

import { Command } from "commander";
import authCommands from "../src/commands/auth.js";
import profileCommands from "../src/commands/profiles.js";

const program = new Command();

// This is the global CLI entrypoint. After npm link/install, "insighta" runs this file.
program
  .name("insighta")
  .description("Insighta CLI")
  .version("1.0.0");

// Register auth commands like: insighta login, insighta logout, insighta whoami.
authCommands(program);

// Register profile commands like: insighta profiles list/search/export.
profileCommands(program);

// Commander reads the terminal arguments and runs the matching command.
program.parse(process.argv);
