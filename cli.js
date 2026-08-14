#!/usr/bin/env node

require("./main.js");
const command = process.argv[2];

if (command === "auth") {
    auth();
}
