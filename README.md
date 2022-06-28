# Word Cloud App ☁️

Howdy! 👋 Welcome to the **Word Cloud App** for Slack, built using [Bolt JS](https://github.com/slackapi/bolt-js) and also referencing the project structure from the [Bolt JS Starter Template](https://github.com/slack-samples/bolt-js-starter-template).

This Slack app will allow users to run a `/word-cloud` command or "Word Cloud" shortcut in any Slack channel with the bot installed to generate a word cloud reflecting the most commonly used words for a specified date range.

**Table of Contents**

* [File Tour](https://github.com/hello-ashleyintech/word-cloud-app#file-tour-)
* [Run it Locally](https://github.com/hello-ashleyintech/word-cloud-app#run-it-locally-%EF%B8%8F)
* [How to Use] (https://github.com/hello-ashleyintech/word-cloud-app#how-to-use-)
* [Example Output + Flow] (https://github.com/hello-ashleyintech/word-cloud-app#example-output--flow)

# File Tour 🚗
### 📁 word-cloud-app
   * 📁 **functions**
        * 📃 _**word-cloud-functions.js**_: File that contains main functionality for pulling messages from a specified channel, generating a string to input to the Word Cloud API of all text within a date range, and then creating the word cloud using the API and uploading it to the specified channel.
   * 📁 **listeners**
        *  📁 **commands**
             * 📃 _**index.js**_: Sets up event listener for commands - specificially, listening for the `/word-cloud` command configured for this app.
             * 📃 _**word-cloud.js**_: Initializes a callback and related functionality that is triggered when the `/word-cloud` command is called.
        *  📁 **shortcuts**
             * 📃 _**index.js**_: Sets up event listener for shortcuts - specificially, listening for the Word Cloud shortcut configured for this app.
             * 📃 _**word-cloud.js**_: Initializes a callback and related functionality that is triggered when the `/word-cloud` command is called. 
        *  📁 **views**
             * 📃 _**index.js**_: Sets up event listener for views - specificially, listening for the Word Cloud shortcut modal configured for this app to be submitted.
             * 📃 _**word-cloud-view.js**_: Initializes a callback and related functionality that is triggered when the Word Cloud shortcut modal is submitted.
        * 📃 _**index.js**_: Initializes event listeners (ex: commands, shortcuts, views) for Slack. This is then called in `app.js` as part of app setup.
   * 📃 _**.env.sample**_: Example template with required environment variables for a `.env` file to authenticate the app and any related API requests to Slack.
   * 📃 _**app.js**_: Primary app entry point that initializes the authenticated app and sets up the event listeners for the app.

# Run it Locally 🏃‍♀️
### Prerequisites
1. Make sure you have  `npm` installed. To verify this, run `npm -v` in your Terminal.
3.  Create an account on [api.slack.com](https://api.slack.com/).
4.  Follow the first two steps of [Bolt JS Getting Started Guide](https://slack.dev/bolt-js/tutorial/getting-started) to set up an application under your Slack Developer account and generate access tokens. 
5. Create a `/word-count` slash command by following step #1: Creating a Slash Command [here](https://api.slack.com/interactivity/slash-commands#creating_commands).

### Instructions
**First-Time Setup**
1. Clone this repository. This will create a local directory called `word-cloud-app`.
2. `cd` into your `word-cloud-app` directory.
3. Create a `.env` file in your root directory based off of your `.env.example` file and add your `SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN`, and `SLACK_APP_TOKEN` values - this will be on your App's settings page on [api.slack.com](https://api.slack.com/) under Basic Information > scroll to the App Credentials category.
4. Run `npm install` in the `word-cloud-app` directory to install all dependencies.

**General Instructions**

Once the above setup has been completed (or if you've run the app before), you can run the application using the following command in the project's root directory:
```node app.js```

# How to Use 💻
To install the bot in Slack, first install it to your workspace. Then, add it into the desired channel you'd like to run the bot in. Once the bot is installed in the channel, you can call the `/word-cloud` command or run the "Word Cloud" shortcut.

For both the shortcut and command flows - no date range is specified, then the bot will automatically query for messages from the last 30 days to the current date.

**Shortcut Specific Notes**

For shortcut modal input, please enter dates as `YYYY-MM-DD`.

If only a "newest" date is specified in the shortcut prompt, then the bot will automatically query from messages from the last 30 days to the "newest" date that was specified. 

**Command Specific Notes**

To specify a date range for commands, run `/word-cloud [from YYYY-MM-DD] [to YYYY-MM-DD]`.

If only one date is specified for the command, the bot will automatically query for messages from that date to the current date.

Example Commands: 
* To get a word cloud for January 1, 2022 to January 4, 2022, you would run `/word-cloud 2022-01-01 2022-01-04`. 
* To get a word cloud for January 1, 2022 to now, you would run `/word-cloud 2022-01-01`. 
* To get a word cloud for the last 30 days to now, you would run `/word-cloud`.

## Example Output + Flow
Command Example:

![word-cloud-demo](https://user-images.githubusercontent.com/12901850/176051279-0fd43668-1a0b-42ef-81a6-bce7e3cf1ca0.gif)

Shortcut Example:

![word-cloud-demo-shortcut](https://user-images.githubusercontent.com/12901850/176244599-98a29671-3a97-452a-9cc1-eaa635d802d3.gif)
