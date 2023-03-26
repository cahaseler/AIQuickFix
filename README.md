# AI QuickFix README

AI QuickFix is a Visual Studio Code extension that provides quick fixes to code issues using Artificial Intelligence, powered by GPT-4 and GPT-3.5-turbo.

# How to use

Write buggy code that VSCode, Typescript, or a linter like SonarLint identifies as a problem. Click on the little lightbulb that appears when you mouse over the problem, or click the Quick Fix button. Wait ~5 seconds. ChatGPT will try to fix your bug.

## Features

The extension provides quick fixes to code issues using ChatGPT's API. Code issues are not found by this extension, but this extension adds a fix command to issues found by VSCode, Typescript, ESLint, and any other linter you might have like SonarLint.

When you ask it to fix a problem, it attempts to ask VSCode to find the beginning and end of the current function context. If VSCode can't do that for your language, it grabs the problem range (the red underlines) plus 10 lines on either side.

It then passes the problem as described by the linter and that context to ChatGPT, and asks it to respond only with fixed code. GPT-4 is great at this. GPT-3.5-turbo likes to add extra chatty comments, which the extension attempts to remove but can't always manage it.

You can edit the prompts in the config settings, more information is below. They default to prompts that work great on GPT-4 and are designed to be as effective as possible on GPT-3.5-turbo.

## Requirements

You'll need an OpenAI API account, sign up here: https://platform.openai.com
It works a lot better with GPT-4 access, request that here: https://openai.com/waitlist/gpt-4-api

## Extension Settings

This extension contributes the following settings:

- `aiquickfix.apiKey`: API Key for OpenAI.
- `aiquickfix.model`: Which model to use for AI problem solving. This works reasonably well with GPT-3.5-turbo, but GPT-4 is better.
- `aiquickfix.systemPrompt`: The system prompt giving the AI the initial instructions on what it is and what it does.
- `aiquickfix.problemPrefix`: Text to add in front of the section from your linter describing the problem. Default of blank seems to work fine.
- `aiquickfix.problemCodePrefix`: Text to add in front of the code block context. Default of blank seems to work fine.
- `aiquickfix.problemCodeSuffix`: Text to add after everything else. This is a good place to remind the AI to follow the format. GPT-3.5 really needs the reminder.

The default settings work pretty well for me but I encourage you to prompt engineer and if you find a significantly better performing version open an issue and let me know!

## Known Issues

- GPT-3.5-turbo isn't great at following format instructions and may dump other messages or context into its response. GPT-4 is better about this.

## Tips

- If the answer might be ambigious, leave a comment explaining what you're trying to do, it will get sent to the AI too
- You can use CTRL-enter to preview a response
- I use this alongside [ChatGPT - Genie AI](https://marketplace.visualstudio.com/items?itemName=genieai.chatgpt-vscode) in my sidebar to give me full ChatGPT access when I need it. But it's nice to have an instant-fix button to avoid copy and paste for the simple issues.
- More linters give you more problems it can fix - I like SonarLint to find code smells as well, even if they're not technically problems it's nice to avoid them.

## Release Notes

### 0.0.1

Initial release of AI QuickFix
