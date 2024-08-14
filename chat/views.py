from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Room
# Create your views here.

@require_POST
def create_room(request, uuid):
    name =  request.POST.get('name', '')
    url = request.POST.get('url', '')
    #  Create a room 
    newRoom = Room.objects.create(uuid=uuid, client=name, url=url)
    newRoom.save()
    return JsonResponse({"message":"Room Created Successfully"})
    