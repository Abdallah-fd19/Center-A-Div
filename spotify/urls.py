from django.urls import path

from . import views

app_name = 'spotify'
urlpatterns = [
    path('get-auth-url/', views.AuthURL.as_view(), name="get-auth"),
    path('redirect/', views.spotify_callback, name="redirect"),
    path('is-authenticated/', views.IsAuthenticated.as_view(), name="is-auth"),
    path('current-song/', views.CurrentSong.as_view(), name="current-song"),
    path('pause-song/', views.PauseSong.as_view(), name="pause-song"),
    path('play-song/', views.PlaySong.as_view(), name="play-song"),
    path('play-next-song/', views.PlayNextSong.as_view(), name="play-next-song"),
    path('play-prev-song/', views.PlayPrevSong.as_view(), name="play-prev-song"),
]
