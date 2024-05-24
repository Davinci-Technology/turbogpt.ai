import {ApiModel, CustomPrompt} from 'app/pages/Chat/slice/types';
import {Message} from 'utils/types/injector-typings';
import {characterPrompts} from './characters';
import {encode} from "gpt-tokenizer";

// Make an API Call to check if the key is valid on OpenAI
export const checkOpenAiKeyValid = (key: string, model: string) =>
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            referrer: 'https://turbogpt.ai/',
        },
        body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: [{role: 'user', content: 'hello'}],
        }),
    });

const fetchMessage = (key: string, messages: Message[], model: ApiModel) => {
    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
//        mode: 'no-cors',
        headers: {
            Authorization: `Bearer ${key}`,
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
//            referrer: 'https://turbogpt.ai/',
        },
        body: JSON.stringify({
            stream: true,
            model: model || 'gpt-3.5-turbo',
            messages: messages,
        }),
    });
};

export const sendMessage = async function* (
    key: string,
    messages: Message[],
    mood: number,
    characterSelected: string,
    model: ApiModel,
    customPrompt: CustomPrompt,
) {

    let copy = [...messages];

    function updateSystemMessages(messages, newMessage): Message[] {
        if (messages[0].role === 'system') {
            messages[0].content = messages[0].content + "\n" + newMessage;
        }
        else {
            messages = [
                {role: 'system', content: newMessage},
                ...messages,
            ];
        }
        return messages;
    }

    if (
        characterPrompts[characterSelected] &&
        characterSelected !== 'Default AI'
    ) {
//        console.log('--- Selected Character... Adding to messages... ---');
        copy = updateSystemMessages(copy, characterPrompts[characterSelected]);
    }

    if (mood !== 50) {
        let prompt = '';
        if (mood < 10) {
            prompt =
                'I want you to be extremely sassy. Use a lot of emojis. Every single thing you answer should be answered as such.';
        } else if (mood < 20) {
            prompt =
                'I want you to be sassy. Use emojis. Every single thing you answer should be answered as such.';
        } else if (mood < 30) {
            prompt =
                'I want you to be a little sassy. Use emojis. Every single thing you answer should be answered as such.';
        } else if (mood < 40) {
            prompt =
                'I want you to act normal. Every single thing you answer should be answered as such.';
        } else if (mood < 50) {
            prompt = 'I want you to be a little professional. ';
        } else if (mood < 60) {
            prompt = 'I want you to be professional.';
        } else if (mood < 70) {
            prompt = 'I want you to be extremely professional.';
        } else if (mood < 80) {
            prompt = 'I want you to be classy';
        } else if (mood < 90) {
            prompt =
                'I want you to be extremely classy. Every single thing you answer should be answered as such.';
        } else if (mood <= 100) {
            prompt =
                'I want you to be the classiest bot alive. Every single thing you answer should be answered as such.';
        }
//        console.log('--- Selected Mood... Adding to messages... ---');
        copy = updateSystemMessages(copy, prompt);
    }

    if (customPrompt && customPrompt.act !== 'None') {
 //       console.log('--- Selected Custom Prompt... Adding to messages... ---');
        let data = `YOU MUST ACT LIKE THE FOLLOWING, DO NOT BREAK CHARACTER: ${customPrompt.prompt}`
        copy = updateSystemMessages(copy, data);
    }

// Add markdown support
    copy = updateSystemMessages(copy, "Use markdown to format all your answers. (Don't mention it to the other user).")

    const countTokens = (messages) => {
        let count = 0;
        for (let i = 0; i < messages.length; i++) {
            count += encode(messages[i].content).length;
        }
 //       console.log('counted tokens: ', count);
        return count;
    }


    // Now we have all system messages as well as all user and assistant messages.
    // reduce the size of the messages until we have 1000 tokens left for the response.
    let permittedTokens = 7168;
    if (model === 'gpt-3.5-turbo-16k-0613') {
        permittedTokens = 15360;
    }
    if (model === 'gpt-4-1106-preview') {
        permittedTokens = 120*1024
    }
    if (model === 'gpt-4o') {
        permittedTokens = 120*1024
    }
    if (model === 'gpt-4-turbo-2024-04-09') {
        permittedTokens = 120*1024
    }

    while (countTokens(copy) > permittedTokens) {
        // remove the first message that is not a system message
        for (let i = 0; i < copy.length; i++) {
            if (copy[i].role !== 'system') {
                let count = encode(copy[i].content).length;
    //            console.log('removing message with tokens: ', count);
                copy.splice(i, 1);

     //           console.log('copy is now ', copy);

                break;
            }
        }
    }


    const response = await fetchMessage(key, copy, model);
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            const dataLines = decoder
                .decode(value, {stream: true})
                .split('\n')
                .filter(line => line.length > 0)
                .map(line => line.slice(6));

            for (const dataLine of dataLines) {
                if (dataLine === '[DONE]') {
                    yield 'DONE';
                    break;
                }
                yield JSON.parse(dataLine);
            }
        }
    } finally {
        await reader.cancel();
    }
};

export const generateImage = (
    key: string,
    prompt: string,
    n: number = 1,
    size: string = '1024x1024',
    response_format: string = 'url',
) => {
    return fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            referrer: 'https://turbogpt.ai/',
        },
        body: JSON.stringify({
            prompt: prompt,
            n: n,
            size: size,
            response_format: response_format,
        }),
    });
};
