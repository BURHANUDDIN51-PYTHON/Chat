from django import template

register = template.Library()


@register.filter(name='intials')
def intials(value):
    intials = ''
    
    for name in value.split(' '):
        if name and len(name) < 3:
            intials += name[0].upper()
            
    return intials