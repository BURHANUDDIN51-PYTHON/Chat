from django.urls import path

from . import views
app_name = 'chat'

urlpatterns = [
    path('api/create-room/<str:uuid>', views.create_room, name='create-room'),
    path('chat-admin/', views.admin, name='admin'),
    path('add-user/', views.add_user, name='add_user'),
    path('chat-admin/<str:uuid>/', views.room, name="room"),
    path('chat-admin/users/<str:uuid>/edit/', views.edit_user, name='edit_user'),
    path('chat-admin/users/<str:uuid>/', views.user_detail, name='user_detail'),
    path('chat-admin/user/delete/<str:uuid>', views.delete_room, name='delete_room')
]
