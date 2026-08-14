## PasteDB CLI

> A fast, lightweight, and modern command-line interface for PasteDB — create, read, update, delete, explore, and manage your pastes directly from your terminal.
[](https://www.npmjs.com/package/pastedb-cli)
[](LICENSE)
------------------------------
## ✨ Features

* 📤 Create pastes instantly from local files.
* 📋 Fetch and read existing pastes in your terminal.
* 🗑️ Delete pastes directly from the command line.
* 🌎 Explore public pastes without opening a browser.
* 👤 Manage your account status and user details.
* 🔑 Provision API keys dynamically.
* ▶️ Execute code through PasteDB's remote run service.
* 🔍 Validate custom IDs for availability instantly.

------------------------------
## 📦 Installation
Ensure you have Node.js 18+ installed on your system.

```
npm install -g pastedb-cli
```

Verify that the installation was successful:

```
pdb --version
```

------------------------------
## 🔐 Authentication
Before using API-dependent features, authenticate your terminal client.

```
pdb auth
```

You will see the following interactive prompt:

```
PasteDB CLI Authentication
--------------------------
PasteDB API key: 
```

Once entered, your configuration updates:

```
✓ API key saved. You can now use PasteDB CLI commands.
```

## Storage and Environment Variables

* Local Storage: Your token resides locally at ~/.pastedb/config.json.
* Environment Overrides: You can export your key directly to your environment:

------------------------------
## 🚀 Commands

## 📤 Create a Paste
Upload a local file to PasteDB. The language syntax is automatically detected via the file extension.

```
pdb create app.py
```
Output:

```
Uploading app.py...
✓ Paste created! https://pastedb.netlify.app/paste/abc123
```

Supported syntax extensions include: .js, .py, .html, .css, .json, .md, .java, .cpp, .c, .go, .rs, .php, .rb, .sh, .sql, .xml, .yaml.

## 📥 Get a Paste
Print the raw contents of a specific paste directly to stdout.

```
pdb get abc123
```

## ✏️ Update a Paste
Overwrite an existing paste's content, language settings, and title with a local file.

```
pdb update abc123 app.py
```
Note: In the example, the abc123 is the pasteID which is to be updated and app.py is the file whose content will be replaced from the abc123.

## 🗑️ Delete a Paste
Remove a paste permanently from the server.

```
pdb delete abc123
```

Output:

```
Deleting abc123...
✓ Paste deleted.
```

## 🌎 Explore Public Pastes
Browse through trending and public feeds natively inside your terminal window.

pdb explore

## 👤 Account Details
Check your active profile data and current PasteDB user statistics.

pdb me

## ▶️ Run Code
Execute code snippets using PasteDB's remote code runtime engine.

```
pdb run <language> <file>
```

Examples:

```
pdb run python app.py
pdb run javascript app.js
```

## 🔍 Check Custom ID Availability
Verify if a specific vanity path string is available before publishing.

```
pdb check-id my-project
```

## 🔑 Manage API Keys
Create, audit, and revoke access keys for other environments.

pdb key create "my-laptop" # Create a key

pdb key list               # List active keys

pdb key delete <api-key>   # Delete a key

------------------------------
## 📋 Quick Reference

| Command | Description |
|---|---|
| pdb auth | Authenticate the CLI with an API key |
| pdb create <file> | Create a new paste from a file |
| pdb get <id> | Fetch and display a paste |
| pdb update <id> <file> | Update an existing paste |
| pdb delete <id> | Delete a paste permanently |
| pdb explore | View public pastes |
| pdb me | View profile and account info |
| pdb run <lang> <file> | Remotely execute code |
| pdb check-id <id> | Check if a custom ID is free |
| pdb key create <name> | Generate a new API credential |
| pdb key list | Review all connected keys |
| pdb key delete <key> | Revoke an API token |
| pdb help / -h | Show global help instructions |

------------------------------
## 🔒 Security

* Local credentials are saved with restricted file system permissions.
* The local config path is locked to ~/.pastedb/config.json.
* Important: Never commit your configuration directory or paste raw credentials into public repositories.

------------------------------
## 🛠️ Development
Get involved with development or build the package from source:

   1. Clone the repository:

   ```
   git clone https://github.com/sorathiya903/pastedb-cli.git
   ```

   2. Navigate to the project root:

   ```
   cd pastedb-cli
   ```
   3. Install the dependencies(if added in future):
   
   npm install
   
   4. Run the CLI tool locally:
   
   ```
   node main.js
   ```
   
------------------------------
## 📄 License
Distributed under the MIT License. See the LICENSE file for more details.
------------------------------
