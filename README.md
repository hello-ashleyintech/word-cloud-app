# Word Cloud App

Howdy! 👋 Welcome to the **Word Cloud App** for Slack, built using [Bolt JS](https://github.com/slackapi/bolt-js) and also referencing the project structure from the [Bolt JS Starter Template](https://github.com/slack-samples/bolt-js-starter-template).

This Slack app will allow users to run a `/word-cloud` command in any Slack channel to generate a word cloud reflecting the most commonly used words for a specified date range.

To specify a date range, run `/word-cloud [YYYY-MM-DD of oldest date] [YYYY-MM-DD of latest date]`.

If no date range is specified, then the bot will automatically query for messages from the last 30 days to the current date. If only one date is specified, the bot will automatically query for messages from that date to the current date.

Example: 
* To get a word cloud for January 1, 2022 to January 4, 2022, you would run `/word-cloud 2022-01-01 2022-01-04`. 
* To get a word cloud for January 1, 2022 to now, you would run `/word-cloud 2022-01-01`. 
* To get a word cloud for the last 30 days to now, you would run `/word-cloud`.

# File Tour 🚗
### 📁 word-cloud-app
   * 📁 **listeners**
        *  📁 **commands**
             * 📃 _**index.js**_: Sets up event listener for commands - specificially, listening for the `/word-cloud` command configured for this app.
             * 📃 _**word-cloud.js**_: Initializes a callback and related functionality that is triggered when the `/word-cloud` command is called. 
        * 📃 _**index.js**_: Initializes event listeners (ex: messages, commands) for Slack. This is then called in `app.js` as part of app setup.
   * 📃 _**env.sample**_: Example template with required environment variables for a `.env` file to authenticate the app and any related API requests to Slack.
   * 📃 _**app.js**_: Primary app entry point that initializes the authenticated app and sets up the event listeners for the app.

# Run it Locally 🏃‍♀️
### Prerequisites
1. Make sure  `npm` installed. To verify this, run `npm -v` in your Terminal.
3.  Create an account on [api.slack.com](https://api.slack.com/).
4.  Follow the first two steps of [Bolt JS Getting Started Guide](https://slack.dev/bolt-js/tutorial/getting-started) to set up an application under your Slack Developer account and generate access tokens. 
5. Create a `/word-count` slash command by following step #1: Creating a Slash Command [here](https://api.slack.com/interactivity/slash-commands#creating_commands).

### Instructions
**First-Time Setup**
1. Clone this repository. This will create a local directory called `word-cloud-app`.
2. `cd` into your `word-cloud-app` directory.
3. Create a `.env` file in your root directory and a dd your `SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN`, and `SLACK_APP_TOKEN` - this will be on your App's settings page on [api.slack.com](https://api.slack.com/) under Basic Information > scroll to the App Credentials category.
4. Run `npm install` in the `word-cloud-app` directory to install all dependencies.

**General Instructions**
Once the above setup has been completed (or if you've run the app before), you can run the application using the following command in the project's root directory:
```node app.js```


## Example Output + Flow
