//usaremos 8 modelos
const modelos = [
  {
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    responseFormat: { type: "json_object" },
  },
  {
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    responseFormat: { type: "json_object" },
  },

  {
    url: "https://api.cerebras.ai/v1/chat/completions",
    key: process.env.CEREBRAS_API_KEY,
    model: "qwen-3-235b-a22b-instruct-2507",
    responseFormat: { type: "json_object" },
  },
  {
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: process.env.OPENROUTER_API_KEY,
    model: "nvidia/nemotron-3-super-120b-a12b:free",
    responseFormat: { type: "json_schema" },
  },
  {
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: process.env.OPENROUTER_API_KEY,
    model: "arcee-ai/trinity-mini:free",
    responseFormat: { type: "json_object" },
  },
  {
    //falla

    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    responseFormat: { type: "json_schema" },
  },
  {
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: process.env.OPENROUTER_API_KEY,
    model: "stepfun/step-3.5-flash:free",
    responseFormat: { type: "json_object" },
  },
];
//como quiero que responda, las reglas deben ser explicitas
const systemPrompt = `
### ROLE
Expert English Language Advisor.
Your goal: Maintain a fluid conversation in English while providing precise linguistic feedback.

### OPERATIONAL RULES
1. **Response Format**: STRICT JSON ONLY. Do not include markdown code blocks ( \`\`\`json ).
2. **Language Constraints**: 
   - 'reply' field: Must be in English.
   - 'explanation' and 'suggestion' fields: Must be in Spanish.
3. **Conversational Flow**: The 'reply' should be natural, engaging, and can include lists or long explanations if necessary.
4. **Correction Scope**: Focus on grammar, punctuation, modern vocabulary, and formal/informal, The reply should only be a talk, it should never have corrections.


### OUTPUT SCHEMA
{
  "reply": "Your conversational response in English.",
  "feedback": [
    {
      "sentence": "Original user sentence",
      "error": "Description of the mistake",
      "correction": "Corrected version",
      "explanation": "Explicación técnica en español",
      "suggestion": "Sugerencia de uso natural o moderno en español"
    }
  ]
}

### CRITICAL
Start your response with '{' and end with '}'. No prose outside the JSON object.`;
//un post a cada modelo utilizando un for,
export async function POST(request) {
  const { messages } = await request.json();

  try {
    //iteramos sobre todos los modelos en caso de que nos quedemos sin peticiones
    for (let i = 0; i < modelos.length; i++) {
      let response = await fetch(`${modelos[i].url}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${modelos[i].key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: `${modelos[i].model}`,
          messages: [
            //primero debe de ir system
            {
              role: "system",
              content: `${systemPrompt}`,
            },
            {
              role: "user",
              content: `${messages}`,
            },
          ],
          //formato schema json a los modelos que lo acepten, a los que no simplemente json_object -> necesita instrucciones explicitas en System
          response_format:
            modelos[i].responseFormat.type === "json_object"
              ? { type: "json_object" }
              : {
                  type: `${modelos[i].responseFormat.type}`,
                  json_schema: {
                    name: "review",
                    strict: true,
                    schema: {
                      type: "object",
                      properties: {
                        reply: {
                          type: "string",
                        },
                        feedback: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              sentence: { type: "string" },
                              error: { type: "string" },
                              correction: { type: "string" },
                              explanation: { type: "string" },
                              suggestion: { type: "string" },
                            },
                            required: [
                              "sentence",
                              "error",
                              "correction",
                              "explanation",
                              "suggestion",
                            ],
                            additionalProperties: false,
                          },
                          minItems: 1,
                        },
                      },
                      required: ["reply", "feedback"],
                      additionalProperties: false, // si o si
                    },
                  },
                },
        }),
      });
      //si falla mandamos que modelo fallo
      if (!response.ok) {
        const errorBody = await response.json();
        console.log("Error body:", JSON.stringify(errorBody));
        console.log(
          `Modelo ${modelos[i].model} fallo con status: ${response.status}`,
        );
        console.log(
          Response.json(
            { error: "todos los modelos fallaron" },
            { status: 500 },
          ),
        );
        continue; //continua si falla o se llego al limite
      } else {
        //no fallo 0.0
        //limpa de json
        let responseJson = await response.json();

        console.log("#####RESPONSEJSON#####");
        console.log(responseJson);
        console.log("##########");

        let limpioResponse = responseJson.choices[0]?.message?.content;
        limpioResponse
          .replaceAll("```json", "")
          .replaceAll("```", "")
          .replaceAll("`", "");
        console.log("#####limpioResponse#####");

        console.log(limpioResponse);
        console.log("##########");

        let respuesta = JSON.parse(limpioResponse);
        console.log("#####respuesta#####");

        console.log(respuesta);
        console.log("##########");

        return Response.json(respuesta);
        //respuesta en formato {reply:..., feedback:[...]}
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}
