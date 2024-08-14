import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        # Join room Group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        
        
    async def disconnect(self):
        # Leave Room
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            
    async def receive(self, text_data):
            text_data_json = json.loads(text_data)
            type = text_data_json['type']
            message = text_data_json["message"]
            name = text_data_json['name']
            agent = text_data_json.get('agent', '')

            if type == 'message':
                await self.channel_layer.group_send(
                    self.room_group_name, {
                        'type': 'chat_message',
                        'message': message,
                        'name': name,
                        'agent': agent,
                        'intitals': intials(name),
                        'created_at': timesince(new_message.created_at)
                    }
                )