# Generated by Django 4.2.1 on 2024-08-14 09:38

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("chat", "0002_alter_room_messages"),
    ]

    operations = [
        migrations.AlterField(
            model_name="room",
            name="messages",
            field=models.ManyToManyField(blank=True, to="chat.message"),
        ),
    ]
