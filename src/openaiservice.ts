import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import * as vscode from "vscode";

export async function getGptFix(
  problem: string,
  problemCode: string,
  apiKey: string,
  model: string
): Promise<string> {
  try {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    let extensionConfig = vscode.workspace.getConfiguration(
      "haselerdev.aiquickfix"
    );

    let systemPrompt = extensionConfig.get("systemPrompt") as string;
    let problemPrefix = extensionConfig.get("problemPrefix") as string;
    let problemCodePrefix = extensionConfig.get("problemCodePrefix") as string;
    let promptSuffix = extensionConfig.get("promptSuffix") as string;

    //gpt-4 respects the system message, but for gpt-3.5-turbo, we need to put the instructions in the user message per advice from OpenAI
    let instructionMessageRole = model === "gpt-4" ? "system" : "user";

    let openAIMessageList: ChatCompletionRequestMessage[] = [
      {
        role: instructionMessageRole as "system" | "user",
        content: systemPrompt,
      },
      {
        role: "user",
        content:
          problemPrefix +
          problem +
          problemCodePrefix +
          problemCode +
          promptSuffix,
      },
    ];

    console.log("Sending message to OpenAI: ", openAIMessageList);

    try {
      const response = await openai.createChatCompletion({
        model: model,
        messages: openAIMessageList,
        temperature: 0.5,
      });

      let solution = response.data.choices[0].message?.content || "";

      if (!solution || solution === "I can't fix this problem") {
        vscode.window.showErrorMessage(
          "Sorry, GPT says it can't fix this problem automatically. Maybe try pasting more context into ChatGPT on the web?"
        );
        return "";
      }

      // If the code contains two sets of 3 backticks, then just return the code between them (GPT-3.5-turbo likes do do this)
      const backtickMatches = solution.match(/```/g);
      if (backtickMatches && backtickMatches.length === 2) {
        solution = solution.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      //ChatGPT suggested perhaps including highlightjs in here to check if the result looks like code. Not sure if it's worth the package size yet.

      return solution;
    } catch (err) {
      vscode.window.showErrorMessage(
        "An error occurred trying to answer your question: " + err
      );
      console.log(err);
      return "";
    }
  } catch (error) {
    vscode.window.showErrorMessage("An error occured: " + error);
    throw error;
  }
}
