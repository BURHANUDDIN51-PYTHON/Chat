from django.shortcuts import render
from django.contrib.auth import logout, authenticate, login
from django.contrib import messages
from django.urls import reverse
from django.http import HttpResponseRedirect
from account.forms import CreateUserForm
from account.models import User
from django.contrib.auth.models import Group



# Create your views here.

# View for logout
def logout_user(request):
    logout(request)
    messages.success(request, "The User has been successfully Logout")
    return HttpResponseRedirect(reverse('core:index'))
    
    
def register(request):
    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            password = form.cleaned_data['password']
            if not password:
                return HttpResponseRedirect(reverse('account:register'))
            user.set_password(form.cleaned_data['password'])
            user.save()
            login(request, user)
            messages.success(request, 'You have been succesfully registered and loged in!')
            return HttpResponseRedirect(reverse('core:index'))
    else:
        form = CreateUserForm()
    return render(request, 'account/register.html', {'form': form})