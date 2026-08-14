const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { Client, PasteDBError } = require("./sdk");
const os = require("os");



const configDir = path.join(os.homedir(), ".pastedb");
const configFile = path.join(configDir, "config.json");

async function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function auth() {
    console.log("");
    console.log("PasteDB CLI Authentication");
    console.log("--------------------------");
    console.log("");

    const apiKey = await ask("PasteDB API key: ");

    if (!apiKey) {
        console.log("");
        console.log("✗ No API key provided.");
        return;
    }

    try {
        fs.mkdirSync(configDir, { recursive: true });

        fs.writeFileSync(
            configFile,
            JSON.stringify(
                {
                    apiKey: apiKey
                },
                null,
                2
            ),
            {
                mode: 0o600
            }
        );

        console.log("");
        console.log("✓ API key saved.");
        console.log("You can now use PasteDB CLI commands.");
        console.log("");

    } catch (err) {
        console.error("");
        console.error("✗ Failed to save API key.");
        console.error(err.message);
    }
                                 }

function getApiKey() {
    // Environment variable takes priority
    if (process.env.PASTEDB_API_KEY) {
        return process.env.PASTEDB_API_KEY;
    }

    try {
        const config = JSON.parse(
            fs.readFileSync(configFile, "utf8")
        );

        return config.apiKey || null;
    } catch {
        return null;
    }
}

const client = new Client(getApiKey());

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function print(value) {
    if (typeof value === "string") {
        console.log(value);
    } else {
        console.log(JSON.stringify(value, null, 2));
    }
}

function error(message) {
    console.error(`\n✗ ${message}\n`);
    process.exitCode = 1;
}

function success(message) {
    console.log(`\n✓ ${message}\n`);
}

function getLanguage(filename) {
    const ext = path.extname(filename).toLowerCase();

    const languages = {
        ".js": "javascript",
        ".mjs": "javascript",
        ".cjs": "javascript",

        ".ts": "typescript",
        ".tsx": "typescript",

        ".py": "python",

        ".html": "html",
        ".htm": "html",

        ".css": "css",

        ".json": "json",

        ".md": "markdown",

        ".txt": "text",

        ".java": "java",
        ".c": "c",
        ".cpp": "cpp",
        ".h": "c",

        ".cs": "csharp",

        ".go": "go",
        ".rs": "rust",

        ".php": "php",
        ".rb": "ruby",

        ".sh": "bash",
        ".bash": "bash",

        ".sql": "sql",

        ".xml": "xml",

        ".yaml": "yaml",
        ".yml": "yaml"
    };

    return languages[ext] || "text";
}


// ─────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────

async function createPaste(file) {

    if (!file) {
        return error("Please provide a file.\nExample: pdb create app.py");
    }

    if (!fs.existsSync(file)) {
        return error(`File not found: ${file}`);
    }

    if (!fs.statSync(file).isFile()) {
        return error(`${file} is not a file.`);
    }

    try {

        console.log(`\nUploading ${file}...`);

        const content = fs.readFileSync(file, "utf8");

        const language = getLanguage(file);

        const title = path.basename(file);

        const data = await client.apiCreatePaste({
            title,
            content,
            language,
            images:[]
        });

        success("Paste created!");

        // Try common URL fields returned by APIs
        const pasteId =
            data.id ||
            data.paste_id ||
            data.pasteId ||
            data.custom_id ||
            data.customId;

        if (data.url) {
            console.log(data.url);
        } else if (pasteId) {
            console.log(
                `https://pastedb.netlify.app/paste/${pasteId}`
            );
        } else {
            print(data);
        }

    } catch (err) {
        handleError(err);
    }
}


async function getPaste(id) {

    if (!id) {
        return error("Please provide a paste ID.\nExample: pdb get abc123");
    }

    try {

        console.log(`\nFetching ${id}...`);

        const data = await client.apiGetPaste(id);

        console.log();

        if (typeof data.content === "string") {
            console.log(data.content);
        } else {
            print(data);
        }

    } catch (err) {
        handleError(err);
    }
}


async function deletePaste(id) {

    if (!id) {
        return error("Please provide a paste ID.\nExample: pdb delete abc123");
    }

    try {

        console.log(`\nDeleting ${id}...`);

        await client.apiDeletePaste(id);

        success("Paste deleted.");

    } catch (err) {
        handleError(err);
    }
}


async function updatePaste(id, file) {

    if (!id || !file) {
        return error(
            "Usage:\n  pdb update <paste-id> <file>"
        );
    }

    if (!fs.existsSync(file)) {
        return error(`File not found: ${file}`);
    }

    try {

        console.log(`\nUpdating ${id}...`);

        const content = fs.readFileSync(file, "utf8");

        const language = getLanguage(file);

        const data = await client.apiUpdatePaste(id, {
            content,
            language,
            title: path.basename(file)
        });

        success("Paste updated.");

        print(data);

    } catch (err) {
        handleError(err);
    }
}


async function stats(id) {

    if (!id) {
        return error(
            "Usage:\n  pdb stats <paste-id>"
        );
    }

    try {

        const data = await client.pasteStats(id);

        console.log("\nPaste statistics:\n");

        print(data);

    } catch (err) {
        handleError(err);
    }
}


async function explore() {

    try {

        console.log("\nFetching public pastes...\n");

        const data = await client.explore();

        print(data);

    } catch (err) {
        handleError(err);
    }
}


async function me() {

    try {

        const data = await client.apiMe();

        console.log("\nAccount:\n");

        print(data);

    } catch (err) {
        handleError(err);
    }
}


async function runCode(language, file) {

    if (!language || !file) {
        return error(
            "Usage:\n  pdb run <language> <file>\n\n" +
            "Example:\n  pdb run python app.py"
        );
    }

    if (!fs.existsSync(file)) {
        return error(`File not found: ${file}`);
    }

    try {

        const code = fs.readFileSync(file, "utf8");

        console.log(`\nRunning ${file}...\n`);

        const result = await client.runCode(
            language,
            code
        );

        print(result);

    } catch (err) {
        handleError(err);
    }
}


async function checkId(id) {

    if (!id) {
        return error(
            "Usage:\n  pdb check-id <custom-id>"
        );
    }

    try {

        const data = await client.checkCustomId(id);

        print(data);

    } catch (err) {
        handleError(err);
    }
}


// ─────────────────────────────────────────────
// API key commands
// ─────────────────────────────────────────────

async function generateKey(name) {

    if (!name) {
        return error(
            "Usage:\n  pdb key create <name>"
        );
    }

    try {

        const data = await client.generateApiKey(name);

        success("API key created.");

        print(data);

    } catch (err) {
        handleError(err);
    }
}


async function listKeys() {

    try {

        const data = await client.myApiKeys();

        print(data);

    } catch (err) {
        handleError(err);
    }
}


async function deleteKey(key) {

    if (!key) {
        return error(
            "Usage:\n  pdb key delete <api-key>"
        );
    }

    try {

        await client.deleteApiKey(key);

        success("API key deleted.");

    } catch (err) {
        handleError(err);
    }
}


// ─────────────────────────────────────────────
// Help
// ─────────────────────────────────────────────

function showHelp() {

    console.log(`
PasteDB CLI

Usage:
  pdb <command> [arguments]

Commands:

  create <file>
      Create a paste from a local file

      Example:
        pdb create app.py


  get <id>
      Get a paste

      Example:
        pdb get abc123


  update <id> <file>
      Update an existing paste

      Example:
        pdb update abc123 app.py


  delete <id>
      Delete a paste

      Example:
        pdb delete abc123


  stats <id>
      Show paste statistics

      Example:
        pdb stats abc123


  explore
      Explore public pastes


  me
      Show your PasteDB account


  run <language> <file>
      Run code using PasteDB

      Example:
        pdb run python app.py


  check-id <id>
      Check whether a custom paste ID is available

      Example:
        pdb check-id my-project


API Keys:

  pdb key create <name>
      Generate an API key

  pdb key list
      List your API keys

  pdb key delete <key>
      Delete an API key


Other:

  pdb help
      Show this help

  pdb version
      Show CLI version
`);
}


function showVersion() {
    console.log("PasteDB CLI v0.0.4");
}


// ─────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────

function handleError(err) {

    if (err instanceof PasteDBError) {
        error(err.message);
        return;
    }

    if (err.code === "ENOENT") {
        error("File not found.");
        return;
    }

    if (err.name === "AbortError") {
        error("Request timed out.");
        return;
    }

    error(
        err.message ||
        "Something went wrong."
    );
}


// ─────────────────────────────────────────────
// CLI Router
// ─────────────────────────────────────────────

async function main() {

    const args = process.argv.slice(2);

    const command = args[0];

    switch (command) {

        case "create":
            await createPaste(args[1]);
            break;

        case "auth":
            await auth();
            break;

        case "get":
            await getPaste(args[1]);
            break;

        case "update":
            await updatePaste(args[1], args[2]);
            break;

        case "delete":
            await deletePaste(args[1]);
            break;

        case "stats":
            await stats(args[1]);
            break;

        case "explore":
            await explore();
            break;

        case "me":
            await me();
            break;

        case "run":
            await runCode(args[1], args[2]);
            break;

        case "check-id":
            await checkId(args[1]);
            break;

        case "key":

            switch (args[1]) {

                case "create":
                    await generateKey(args.slice(2).join(" "));
                    break;

                case "list":
                    await listKeys();
                    break;

                case "delete":
                    await deleteKey(args[2]);
                    break;

                default:
                    console.log(`
API key commands:

  pdb key create <name>
  pdb key list
  pdb key delete <key>
`);
            }

            break;

        case "version":
        case "-v":
        case "--version":
            showVersion();
            break;

        case "help":
        case "-h":
        case "--help":
        case undefined:
            showHelp();
            break;

        default:
            error(
                `Unknown command "${command}".\n` +
                `Run "pdb help" to see available commands.`
            );
    }
}


main();
