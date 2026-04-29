#!/usr/bin/env node

import { Command } from "commander";
import authCommands from "../src/commands/auth.js";
import profileCommands from "../src/commands/profiles.js";

const program = new Command();

program
  .name("insighta")
  .description("Insighta CLI")
  .version("1.0.0");

authCommands(program);
profileCommands(program);

program.parse(process.argv);