from django.shortcuts import redirect, render
import google.generativeai as genai
from .noPublic.prompt import get_prompt  # Use relative import with dot notation
from decouple import config

# Set API key
api_key = config('GEMINI_API_KEY')
genai.configure(api_key=api_key)

# Select a model (e.g., Gemini Pro)
model = genai.GenerativeModel("gemini-2.0-flash")

prompt = str(get_prompt())

def talk(request):
    # Get or initialize messages from session
    if 'messages' not in request.session:
        request.session['messages'] = []
    
    messages = request.session['messages']
    
    # Initialize or get chat history
    if 'chat_history' not in request.session:
        # Initialize conversation history with your persona prompt
        history = [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ]
        # Create a new chat session
        chat = model.start_chat(history=history)
        # Store chat history in session (need to convert to serializable format)
        request.session['chat_history'] = True  # Flag that chat is initialized
    else:
        # Chat already initialized, continue with existing context
        chat = model.start_chat(history=[
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ])
        
        # Replay previous messages to maintain context
        for msg in messages:
            if msg['is_user']:
                chat.send_message(msg['text'])
            # We don't need to send AI responses back to the model

    if request.method == "POST":
        user_message = request.POST.get("message")

        if user_message:
            # Store user message for display
            messages.append({"text": user_message, "is_user": True})

            try:
                # Get AI response using your existing chat
                response = chat.send_message(user_message)
                ai_message = response.text

                # Store AI response for display
                messages.append({"text": ai_message, "is_user": False})

            except Exception as e:
                messages.append({"text": f"Error: {str(e)}", "is_user": False})
            
            # Save updated messages to session
            request.session['messages'] = messages
            request.session.modified = True

    # Process bold text formatting
    for m in messages:
        text = m["text"]
        while "**" in text:
            text = text.replace("**", "<strong>", 1)
            if "**" in text:
                text = text.replace("**", "</strong>", 1)
        m["text"] = text

    # Pass messages to template for display
    return render(request, "index.html", {"messages": messages})


def new_chat(request):
    if 'messages' in request.session:
        del request.session['messages']
        request.session.modified = True

    return redirect('talk')