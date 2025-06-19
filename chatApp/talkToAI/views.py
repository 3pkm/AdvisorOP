from django.shortcuts import redirect, render
import google.generativeai as genai
from .noPublic.prompt import get_prompt  # Use relative import with dot notation
from decouple import config
from datetime import datetime
from django.http import JsonResponse # Add this
from django.views.decorators.csrf import ensure_csrf_cookie # Add this for sending CSRF token

# Set API key
api_key = config('GEMINI_API_KEY')
genai.configure(api_key=api_key)

# Select a model (e.g., Gemini Pro)
model = genai.GenerativeModel("gemini-2.0-flash")

prompt = str(get_prompt())

@ensure_csrf_cookie # Ensure CSRF cookie is set for GET requests to this view
def talk(request):
    if request.method == "GET":
        # Initialize session variables if they don't exist
        if 'messages' not in request.session:
            request.session['messages'] = []

        if 'char_count' not in request.session:
            request.session['char_count'] = 0
        
        # For GET, return empty messages to prevent loading old chats on page reload
        return JsonResponse({
            "messages": [],  # Always return empty for GET to avoid old chats
            "char_count": 0
        })

    # POST request handling remains largely the same but returns JSON
    if 'messages' not in request.session:
        request.session['messages'] = []
    if 'char_count' not in request.session:
        request.session['char_count'] = []
    
    messages = request.session['messages']
    
    # Initialize or get chat history
    if 'chat_history' not in request.session:
        # Initialize conversation history with your persona prompt
        history = [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            },
            {
                "role": "model", # Initial AI part for context
                "parts": [{"text": "Hello, I'm Athena. I'm here to help you explore your thoughts and feelings by thinking them through together in a supportive way. How are you feeling today, and what's on your mind?"}]
            }
        ]
        chat = model.start_chat(history=history)
        request.session['chat_history_serialized'] = [{"role": p.role, "parts": [pt.text for pt in p.parts]} for p in chat.history] # Store serializable history
    else:
        # Deserialize chat history from session
        serialized_history = request.session['chat_history_serialized']
        history_for_model = []
        for item in serialized_history:
            parts_for_model = []
            for part_text in item['parts']:
                parts_for_model.append({"text": part_text})
            history_for_model.append({"role": item['role'], "parts": parts_for_model})
        
        chat = model.start_chat(history=history_for_model)

    if request.method == "POST":
        user_message = request.POST.get("message")

        if user_message:
            messages.append({"text": user_message, "is_user": True, "timestamp": datetime.now().strftime("%H:%M")})
            request.session['char_count'] = request.session.get('char_count', 0) + len(user_message)

            try:
                response = chat.send_message(user_message)
                ai_message = response.text
                
                # Process bold text formatting for AI message
                while "**" in ai_message:
                    ai_message = ai_message.replace("**", "<strong>", 1)
                    if "**" in ai_message:
                        ai_message = ai_message.replace("**", "</strong>", 1)
                
                messages.append({"text": ai_message, "is_user": False, "timestamp": datetime.now().strftime("%H:%M")})
                
                # Update session
                request.session['messages'] = messages
                request.session['chat_history_serialized'] = [{"role": p.role, "parts": [pt.text for pt in p.parts]} for p in chat.history]
                request.session.modified = True
                
                # Return only the AI response for frontend
                return JsonResponse({
                    "response": ai_message,
                    "timestamp": datetime.now().strftime("%H:%M")
                })

            except Exception as e:
                error_message = f"Error: {str(e)} - Could not get response from AI."
                messages.append({"text": error_message, "is_user": False, "timestamp": datetime.now().strftime("%H:%M")})
                request.session['messages'] = messages
                request.session.modified = True
                
                return JsonResponse({
                    "response": error_message,
                    "timestamp": datetime.now().strftime("%H:%M")
                })

    # If no message provided
    return JsonResponse({
        "response": "No message provided",
        "timestamp": datetime.now().strftime("%H:%M")
    })


def new_chat(request):
    if 'messages' in request.session:
        del request.session['messages']
    if 'chat_history_serialized' in request.session: # Clear serialized history
        del request.session['chat_history_serialized']
    if 'chat_history' in request.session: # Clear the old flag if it exists
        del request.session['chat_history']

    request.session['char_count'] = 0
    request.session.modified = True
    # Optionally, redirect to talk or just return a success message
    # If redirecting, the GET handler in talk() will provide the initial state
    # return redirect('talk') 
    # For an API, it's better to return a JSON response indicating success
    # and let the frontend fetch the new state from /talk/
    return JsonResponse({"status": "success", "message": "Chat history cleared."})