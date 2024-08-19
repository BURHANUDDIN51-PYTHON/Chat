from django.shortcuts import render, redirect
import json
from django.contrib import messages
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from .models import Room
from account.models import User
from account.forms import AddUserForm, EditUserForm
from django.contrib.auth.models import Group
# Create your views here.

@require_POST
def create_room(request, uuid):
    name =  request.POST.get('name', '')
    url = request.POST.get('url', '')
    #  Create a room 
    newRoom = Room.objects.create(uuid=uuid, client=name, url=url)
    newRoom.save()
    return JsonResponse({"message":"Room Created Successfully"})
    
    
@login_required
def admin(request):
    rooms = Room.objects.all()
    users = User.objects.filter(is_staff=True)
    
    return render(request, 'chat/admin.html', {
        'rooms': rooms,
        'users': users,
    })
    
@login_required
def room(request, uuid):
    room = Room.objects.get(uuid=uuid)
    
    if room.status == Room.WAITING:
        room.status = Room.ACTIVE
        room.agent = request.user
        room.save()
        
    
    return render(request, 'chat/room.html', {
        'room': room,
        'room_messages': room.messages.all()
        })
    
    
@login_required
def add_user(request):
    if request.user.has_perm('user.add_user'):
        if request.method == 'POST':
            form = AddUserForm(request.POST)
            if form.is_valid():
                user = form.save(commit=False)
                user.is_staff = True
                user.set_password(request.POST.get('password'))  
                user.save()   
                
                if user.role == User.MANAGER :
                    group = Group.objects.get(name='Managers')
                    user.groups.add(group)
                
                elif user.role == User.AGENT:
                    group = Group.objects.get(name='Agents')
                    user.groups.add(group)
                
                messages.success(request, 'The user was added successfully')
                return redirect('/chat-admin')
        else:
            form = AddUserForm()
        return render(request, 'chat/add_user.html', {
            'form': form,
        })
    else:
        messages.error(request, "You don't have access to add user")
        return redirect('/chat-admin/')
    
        
@login_required
def user_detail(request, uuid):
    user = User.objects.get(pk=uuid)
    rooms = user.rooms.all()
    return render(request, 'chat/user_detail.html', {
        'user': user,
        'rooms': rooms
        })
    
def edit_user(request, uuid):
    user = User.objects.get(pk=uuid)
    if not request.user.has_perm('user.edit_user'):
        messages.error(request, "You don't have access to edit the users.")
        return redirect('/chat-admin/')
    
    if request.method == "GET":
        form = EditUserForm(instance=user)
        return render(request, 'chat/edit_user.html', {
            'form': form,
        })
    
    if request.method == "POST":
        edited_form = EditUserForm(request.POST, instance=user)
        if edited_form.is_valid():
            edited_form.save()
            messages.success(request, 'The user has been edited')
            return redirect("/chat-admin/")
    
    messages.error(request, "Changes cannot be save due to some issue please retry")
    return redirect('/chat-admin/')
            
    
def delete_room(request, uuid): 
    print(uuid)
    if request.user.has_perm('room.delete_room'):
        room = Room.objects.get(uuid=uuid)
        room.delete()
        messages.success(request, "The room have been successfully deleted")
        return redirect('/chat-admin/')
    else:
        messages.error(request,"you don't have access to delete a room")
        return redirect("/chat-admin/")