from django.urls import path

from . import views

app_name = 'frontend'
urlpatterns = [
    path('', views.home, name='home'),
    path('join/', views.home, name='join'),
    path('create/', views.home, name='create'),
    path('room/<str:roomCode>/', views.home, name='room'),
]
