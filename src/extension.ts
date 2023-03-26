// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getGptFix } from "./openaiservice";

// This method is called when your extension is deactivated
export function deactivate() {
  return;
}

export class OpenAIFixActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): Promise<vscode.CodeAction[]> {
    const diagnostics = context.diagnostics;
    if (!diagnostics || diagnostics.length === 0) {
      return [];
    }

    const config = vscode.workspace.getConfiguration(
      "haselerdev.aiquickfix"
    );
    const apiKey = config.get<string>("apiKey");

    // Ensure the API Key is available
    if (!apiKey) {
      vscode.window
        .showErrorMessage(
          "Please set your OpenAI API key in the settings",
          { modal: false },
          { title: "Open Settings" }
        )
        .then((selection) => {
          if (selection && selection.title === "Open Settings") {
            vscode.commands.executeCommand(
              "haselerdev.aiquickfix.openSettings"
            );
          }
        });

      return [];
    }

    let actions: vscode.CodeAction[] = [];

    for (const diagnostic of diagnostics) {
      const problemString = diagnostic.message;
      const problemRange = diagnostic.range;

      const action = new vscode.CodeAction(
        `AI QuickFix: "${problemString}"`,
        vscode.CodeActionKind.QuickFix
      );
      action.command = {
        title: "Request Fix using OpenAI API",
        command: "gptAIProblemFixerCommand",
        arguments: [document, problemRange],
      };
      actions.push(action);
    }

    return actions;
  }
}

function openYourExtensionSettings() {
  vscode.commands.executeCommand(
    "workbench.action.openSettings",
    "@ext:haselerdev.aiquickfix"
  );
}
export let getGptFixFn = getGptFix;


export function activate(context: vscode.ExtensionContext) {
  // Set context as a global as some tests depend on it
  (global as any).testExtensionContext = context;
  

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "haselerdev.aiquickfix.openSettings",
      () => {
        openYourExtensionSettings();
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { pattern: "**/*", scheme: "file" },
      new OpenAIFixActionProvider(),
      {
        providedCodeActionKinds:
          OpenAIFixActionProvider.providedCodeActionKinds,
      }
    )
  );

  let disposable = vscode.commands.registerCommand(
    "gptAIProblemFixerCommand",
    async (document: vscode.TextDocument, range: vscode.Range) => {
      console.log("running command");
      const problemString = document.getText(range);

      const extendedRange = extendRange(document, range, 10);
      const functionRange = await findEnclosingFunctionRange(
        document,
        range.start
      );
      const problemCode = document.getText(functionRange || extendedRange);

      const config = vscode.workspace.getConfiguration(
        "haselerdev.aiquickfix"
      );
      const apiKey = config.get<string>("apiKey");
      const model = config.get<string>("model") || "gpt-3.5-turbo";
      if (!apiKey) {
        vscode.window
          .showErrorMessage(
            "Please set your OpenAI API key in the settings",
            { modal: false },
            { title: "Open Settings" }
          )
          .then((selection) => {
            if (selection && selection.title === "Open Settings") {
              vscode.commands.executeCommand(
                "haselerdev.aiquickfix.openSettings"
              );
            }
          });

        return [];
      }

      const fix = await getGptFix(problemString, problemCode, apiKey, model);

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      // Replace the text with the returned fix
      await editor.edit((editBuilder) => {
        editBuilder.replace(functionRange || extendedRange, fix);
      });
    }
  );

  context.subscriptions.push(disposable);
}

function extendRange(
  document: vscode.TextDocument,
  originalRange: vscode.Range,
  n: number
): vscode.Range {
  const startLine = Math.max(0, originalRange.start.line - n);
  const endLine = Math.min(document.lineCount - 1, originalRange.end.line + n);
  const extendedRange = new vscode.Range(
    new vscode.Position(startLine, 0),
    document.lineAt(endLine).range.end
  );
  return extendedRange;
}

async function findEnclosingFunctionRange(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Range | undefined> {
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    "vscode.executeDocumentSymbolProvider",
    document.uri
  );

  if (!symbols) {
    return;
  }

  function recursivelyFindEnclosingRange(
    symbols: vscode.DocumentSymbol[],
    position: vscode.Position
  ): vscode.DocumentSymbol | undefined {
    for (const symbol of symbols) {
      if (symbol.children.length > 0) {
        const found = recursivelyFindEnclosingRange(symbol.children, position);
        if (found) {
          return found;
        }
      }

      if (symbol.range.contains(position)) {
        return symbol;
      }
    }

    return undefined;
  }

  const enclosingSymbol = recursivelyFindEnclosingRange(symbols, position);
  return enclosingSymbol ? enclosingSymbol.range : undefined;
}
