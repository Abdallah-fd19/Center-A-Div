from django.urls import path

from . import views

app_name = 'api'
urlpatterns = [
    path('room/list/', views.RoomListView.as_view()),
    path('room/create/', views.RoomCreateView.as_view()),
    path('room/', views.RoomDetailView.as_view()),
    path('room/join/', views.RoomJoinView.as_view()),
    path('room/user-in/', views.UserInRoomView.as_view()),
    path('room/leave/', views.LeaveRoomView.as_view()),
    path('room/update/', views.UpdateRoomView.as_view()),
]
