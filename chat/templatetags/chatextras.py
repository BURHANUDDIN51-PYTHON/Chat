from django import template

register = template.Library()


@register.filter(name='initials')
def initials(value):
    initials = ''
    name = value.split(' ')
    initials += name[0][0].upper()
    try:
        initials += name[1][0].upper()
    except:
        initials += name[0][1].upper()
            
    return initials