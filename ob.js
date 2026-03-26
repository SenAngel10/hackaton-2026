let msgAssistant = {
    reply: 'Hello! I am your English Advisor. Please provide me with a sentence or a text you would like me to analyze for structural, grammatical, and punctuation improvements.',
    feedback: [
        {
            sentence: 'hi',
            error: 'Capitalization',
            correction: 'Hi',
            explanation: 'Sentences should always begin with a capital letter.',
            suggestion: 'Always capitalize the first word of a sentence or greeting.'
        }
    ]
};

console.log(msgAssistant.feedback.length);

msgAssistant.feedback.map(x => {
    console.log(x.correction);
    console.log(x.error);

});
