const chatButton = document.getElementById("chat-button");
const chatContainer = document.getElementById("chatContainer");
const minimizeButton = document.getElementById("minimize-button");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("conversation-group");
const sendButton = document.getElementById("SentButton");

if (chatButton) {
    chatButton.addEventListener("click", function () {
        if (chatContainer) {
            chatContainer.classList.add("open");
            chatButton.classList.add("clicked");
        }
    });
}

if (minimizeButton) {
    minimizeButton.addEventListener("click", function () {
        if (chatContainer) {
            chatContainer.classList.remove("open");
            chatButton.classList.remove("clicked");
        }
    });
}

function createMessage(message, isUser = true) {
    const newMessage = document.createElement('div');
    newMessage.classList.add(isUser ? 'sentText' : 'botText');
    newMessage.textContent = message;
    chatMessages.appendChild(newMessage);
    return newMessage;
}

function chatbotResponse(messagetxt) {
    /*const messages = ["Hello!", "How can I assist you?", "Let me know if you have any further questions"];
    const randomIndex = Math.floor(Math.random() * messages.length);*/
    if(messagetxt){
        const message = messagetxt;
        const botMessage = createMessage(message, false);
        botMessage.scrollIntoView();

    }else{
        const messages = ["Hello!", "How can I assist you?", "Let me know if you have any further questions"];
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        const botMessage = createMessage(message, false);
        botMessage.scrollIntoView();
    }
    
}

/*chatInput.addEventListener("input", function (event) {
    if (event.target.value) {
        sendButton.classList.add("svgsent");
    } else {
        sendButton.classList.remove("svgsent");
    }
});*/

/*chatInput.addEventListener("keypress", function (event) {
    if (event.keyCode === 13) {
        

        const message = chatInput.value;
        chatInput.value = "";
        let userMessage = $("#chat-input").val().trim();
        const userMessaged = createMessage(message);
        userMessaged.scrollIntoView();
        
        
        

        // Only send the message if it's not empty
        
        if (userMessage) {
            $.ajax({
                type: "POST",
                url: "/chat",
                timeout: 30000,
                data: JSON.stringify({ message: userMessage }),
                contentType: "application/json", 
                success: function(response) {
                    // Handle successful response
                    console.log(response);
                    
                    // If you want to display the response from the server, you can append it to the chat
                    // Assuming you have a container with ID "messages" to display chat messages
                    
                    setTimeout(chatbotResponse(response.message), 1000);

                },
                error: function(error) {
                    // Handle error
                    console.error("Error:", error);
                }
                
            });
        } else {
            alert("Please enter a message before sending.");
        }
    }
});*/

$(document).ready(function() {
    $("#SentButtonhg").click(function() {
        // Get the user's message from the textarea
       const  chatInputt = document.getElementById("chat-input");
        const message = chatInputt.value;
        let userMessage = $("#chat-input").val().trim();
        chatInputt.value = "";
        const userMessaged = createMessage(message);
        userMessaged.scrollIntoView();
        
        
        
        

        // Only send the message if it's not empty
        
        if (userMessage) {
            $.ajax({
                type: "POST",
                url: "/chat",
                timeout: 30000,
                data: JSON.stringify({ message: userMessage }),
                contentType: "application/json", 
                success: function(response) {
                    // Handle successful response
                    console.log(response);
                    
                    // If you want to display the response from the server, you can append it to the chat
                    // Assuming you have a container with ID "messages" to display chat messages
                    
                    setTimeout(chatbotResponse(response.message), 1000);

                },
                error: function(error) {
                    // Handle error
                    console.error("Error:", error);
                }
                
            });
        } else {
            alert("Please enter a message before sending.");
        }
    });
});


