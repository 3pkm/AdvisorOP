from django.contrib import admin
from django.urls import path

from talkToAI import views

urlpatterns = [
    path('', views.talk, name='talk'),
    path('talk/', views.talk, name='talk'),
    path('new-chat/', views.new_chat, name='new-chat'),
]
