const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });

} else {
    const app = express();
    const port = 3000;
    const openai = new OpenAI();
    app.use(express.static(__dirname + '/front'));

    const mongoose = require('mongoose');

    const flexibleSchema = new mongoose.Schema({}, { strict: false });
    const FlexibleData = mongoose.model('helpinfo', flexibleSchema);

    // Connect to MongoDB
    mongoose.connect('mongodb://127.0.0.1:27017/messages', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch(error => {
        console.error('Error connecting to MongoDB:', error.message);
    });


    app.use(bodyParser.json());

    const cors = require('cors');
    app.use(cors());



    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/front/chat.html');
    });

    app.post('/chat', async (req, res) => {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).send({ error: 'Message is required' });
        }
        try{

        
        
        // Constructing a more detailed prompt based on the user message
        const prompt = `This  message  either gonna be helprequest or helpoffre or complaint or otherrequest(like question etc) soo just response with one word and it should either one of three words : "${userMessage}". `;

        
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are a helpful assistant."
            }, {
                role: "user",
                content: prompt
            }]
        });

            const responseMessage = response.choices[0].message["helprequest"];
            console.log(response.choices[0].message["content"]);
            if(response.choices[0].message["content"]=="helpoffre")
            {
                const messages = [{"role": "user", "content": userMessage}];
                const functions = [
                    {
                        "name": "offer_help_info",
                        "description": "Get the information from someone offering help",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "full_name": {
                                    "type": "string",
                                    "description": "Full name of the person offering help"
                                },
                                "contact_information": {
                                    "type": "string",
                                    "description": "Contact details like phone number or email"
                                },
                                "location": {
                                    "type": "string",
                                    "description": "Current location or where they can offer help"
                                },
                                "type_of_assistance": {
                                    "type": "string",
                                    "description": "Specific type of assistance being offered"
                                },
                                "availability": {
                                    "type": "string",
                                    "description": "When they are available to provide assistance"
                                },
                                "quantity_duration": {
                                    "type": "string",
                                    "description": "Quantity or duration of the help being offered"
                                },
                                "notes": {
                                    "type": "string",
                                    "description": "Any additional notes or conditions"
                                },
                                "output": {
                                    "type": "string",
                                    "description": "say thank you and stay safe in the language of the offre "
                                }
                            },
                            "required": ["full_name", "contact_information", "location", "type_of_assistance","output"]
                        }
                    },
                ];

                const response = await openai.chat.completions.create({
                    model: "gpt-4-0613",
                    messages: messages,
                    functions: functions,
                    function_call: "auto",  // auto is default, but we'll be explicit
                });
                const responseMessage = response.choices[0].message["function_call"];
                let args = JSON.parse(responseMessage["arguments"]);
                let outputValue = args.output;
                
                FlexibleData.create(args)
                .then(doc => {
                    console.log('Data saved:', doc);
                })
                .catch(error => {
                    console.error('Error saving data:', error.message);
                });
                console.log(outputValue);
                res.send({ message: outputValue });
            }
            else if(response.choices[0].message["content"]=="helprequest")
            {
                const messages = [{"role": "user", "content":userMessage }];
                const functions = [
                    {
                        "name": "request_help_info",
                        "description": "Get the information from someone that offres help",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "full_name": {
                                    "type": "string",
                                    "description": "Full name of the person requesting help"
                                },
                                "contact_information": {
                                    "type": "string",
                                    "description": "Immediate contact details"
                                },
                                "current_location": {
                                    "type": "string",
                                    "description": "Exact location where help is needed"
                                },
                                "type_of_assistance_needed": {
                                    "type": "string",
                                    "description": "Specific type of assistance required"
                                },
                                "number_of_people": {
                                    "type": "number",
                                    "description": "Number of people if asking for a group mention the state of them and catgorise them "
                                },
                                "health_conditions": {
                                    "type": "string",
                                    "description": "Any crucial health conditions or injuries"
                                },
                                "duration": {
                                    "type": "string",
                                    "description": "Duration of required assistance"
                                },
                                "notes": {
                                    "type": "string",
                                    "description": "Any other relevant details"
                                },
                                "other": {
                                    "type": "string",
                                    "description": "rest of the message"
                                },
                                "output": {
                                    "type": "string",
                                    "description": "small message to thank him for the information in the language of the request sent "
                                }
                            },
                            "required": ["full_name", "contact_information", "current_location", "type_of_assistance_needed","output"]
                        }
                    },
                ];

                const response = await openai.chat.completions.create({
                    model: "gpt-4-0613",
                    messages: messages,
                    functions: functions,
                    function_call: "auto",  // auto is default, but we'll be explicit
                });
                const responseMessage = response.choices[0].message["function_call"];
                let args = JSON.parse(responseMessage["arguments"]);
                let outputValue = args.output;
                console.log(outputValue);
                FlexibleData.create(args)
                .then(doc => {
                    console.log('Data saved:', doc);
                })
                .catch(error => {
                    console.error('Error saving data:', error.message);
                });
                res.send({ message: outputValue });
            }
            else if(response.choices[0].message["content"]=="complaint")
            {
                const messages = [{"role": "user", "content":userMessage }];
                const functions = [
                    {
                        "name": "request_help_info",
                        "description": "Get the information from someone that offres help",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "full_name": {
                                    "type": "string",
                                    "description": "Full name of the person requesting help"
                                },
                                "contact_information": {
                                    "type": "string",
                                    "description": "Immediate contact details"
                                },
                                "current_location": {
                                    "type": "string",
                                    "description": "Exact location where help is needed"
                                },
                                "type_of_complaint": {
                                    "type": "string",
                                    "description": "Specific type of complaint required"
                                },
                                "complaint": {
                                    "type": "number",
                                    "description": "summarize the complaint"
                                },
                                "health_conditions": {
                                    "type": "string",
                                    "description": "Any crucial health conditions or injuries"
                                },
                                "other": {
                                    "type": "string",
                                    "description": "rest of the message"
                                },
                                "output": {
                                    "type": "string",
                                    "description": "small message to thank him for the information in the language of the request sent "
                                }
                            },
                            "required": ["full_name", "contact_information", "current_location", "type_of_complaint","output"]
                        }
                    },
                ];

                const response = await openai.chat.completions.create({
                    model: "gpt-4-0613",
                    messages: messages,
                    functions: functions,
                    function_call: "auto",  // auto is default, but we'll be explicit
                });
                const responseMessage = response.choices[0].message["function_call"];
                let args = JSON.parse(responseMessage["arguments"]);
                let outputValue = args.output;
                console.log(outputValue);
                FlexibleData.create(args)
                .then(doc => {
                    console.log('Data saved:', doc);
                })
                .catch(error => {
                    console.error('Error saving data:', error.message);
                });
                res.send({ message: outputValue });
            }
            else
            {
                const prompt = `only answer medical and survival question you're assistant that people gonna contact you to ask about earthquakes and how to deal with them and this is the question : "${userMessage}". `;

        
                const response = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [{
                        role: "system",
                        content: "You are a helpful assistant."
                    }, {
                        role: "user",
                        content: prompt
                    }]
                });
                res.send({ message:response.choices[0].message["content"]});
            }
            
        } catch (error) {
            console.error("An error occurred:", error.message);
            res.status(500).send({ error: 'An unexpected error occurred' });
        }
    
    });

    app.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`);
    });

}
